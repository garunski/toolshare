-- Fix: Set search_path to empty string for security in all functions
-- This prevents schema hijacking attacks and ensures functions only reference intended objects

-- Fix update_user_reputation function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix accept_friend_request function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix reject_friend_request function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''; 