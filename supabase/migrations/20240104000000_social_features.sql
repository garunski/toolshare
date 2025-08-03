-- Social Features Migration
-- Add friend requests and social connections

-- Create friend_requests table
CREATE TABLE friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create social_connections table (friendships)
CREATE TABLE social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create user_reputation table
CREATE TABLE user_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_loans INTEGER DEFAULT 0,
  successful_loans INTEGER DEFAULT 0,
  failed_loans INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  trust_score INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create loan_ratings table
CREATE TABLE loan_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loan_id, rater_id, rated_user_id)
);

-- Enable Row Level Security
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
CREATE POLICY "Users can view own friend requests" ON friend_requests 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create friend requests" ON friend_requests 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received friend requests" ON friend_requests 
  FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for social_connections
CREATE POLICY "Users can view own connections" ON social_connections 
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create connections" ON social_connections 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_reputation
CREATE POLICY "Users can view all reputation" ON user_reputation 
  FOR SELECT USING (true);
CREATE POLICY "Users can update own reputation" ON user_reputation 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for loan_ratings
CREATE POLICY "Users can view loan ratings" ON loan_ratings 
  FOR SELECT USING (true);
CREATE POLICY "Users can create loan ratings" ON loan_ratings 
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Create indexes for better performance
CREATE INDEX idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);
CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_social_connections_friend_id ON social_connections(friend_id);
CREATE INDEX idx_user_reputation_user_id ON user_reputation(user_id);
CREATE INDEX idx_loan_ratings_loan_id ON loan_ratings(loan_id);
CREATE INDEX idx_loan_ratings_rated_user_id ON loan_ratings(rated_user_id);

-- Create function to handle friend request acceptance
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS void AS $$
DECLARE
  sender_uuid UUID;
  receiver_uuid UUID;
BEGIN
  -- Get the request details
  SELECT sender_id, receiver_id INTO sender_uuid, receiver_uuid
  FROM friend_requests
  WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
  
  -- Update request status
  UPDATE friend_requests 
  SET status = 'accepted', updated_at = NOW()
  WHERE id = request_id;
  
  -- Create social connection (bidirectional)
  INSERT INTO social_connections (user_id, friend_id)
  VALUES (sender_uuid, receiver_uuid), (receiver_uuid, sender_uuid)
  ON CONFLICT (user_id, friend_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle friend request rejection
CREATE OR REPLACE FUNCTION reject_friend_request(request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE friend_requests 
  SET status = 'rejected', updated_at = NOW()
  WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
BEGIN
  -- Insert or update reputation record
  INSERT INTO user_reputation (user_id, total_loans, successful_loans, failed_loans)
  VALUES (
    NEW.borrower_id,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'cancelled' OR NEW.status = 'failed' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_loans = user_reputation.total_loans + EXCLUDED.total_loans,
    successful_loans = user_reputation.successful_loans + EXCLUDED.successful_loans,
    failed_loans = user_reputation.failed_loans + EXCLUDED.failed_loans,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for loan status changes
CREATE TRIGGER on_loan_status_change
  AFTER UPDATE OF status ON loans
  FOR EACH ROW EXECUTE PROCEDURE update_user_reputation(); 