-- Initial database schema for ToolShare platform
-- This migration creates all the core tables needed for the application
-- Includes all features from previous migrations: social features, reputation, ratings, etc.

-- Enable necessary extensions (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION "uuid-ossp";
    END IF;
END $$;

-- Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tools table
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor')),
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
    borrower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled', 'overdue')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_return_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Social connections table (for accepted friend requests)
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- User reputation table
CREATE TABLE IF NOT EXISTS public.user_reputation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    total_loans INTEGER DEFAULT 0,
    successful_loans INTEGER DEFAULT 0,
    failed_loans INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    trust_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Loan ratings table
CREATE TABLE IF NOT EXISTS public.loan_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
    rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rated_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(loan_id, rater_id, rated_user_id)
);

-- Create indexes for better performance (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_owner_id') THEN
        CREATE INDEX idx_tools_owner_id ON public.tools(owner_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_category') THEN
        CREATE INDEX idx_tools_category ON public.tools(category);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_available') THEN
        CREATE INDEX idx_tools_available ON public.tools(is_available);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loans_tool_id') THEN
        CREATE INDEX idx_loans_tool_id ON public.loans(tool_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loans_borrower_id') THEN
        CREATE INDEX idx_loans_borrower_id ON public.loans(borrower_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loans_lender_id') THEN
        CREATE INDEX idx_loans_lender_id ON public.loans(lender_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loans_status') THEN
        CREATE INDEX idx_loans_status ON public.loans(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender_id') THEN
        CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_receiver_id') THEN
        CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_loan_id') THEN
        CREATE INDEX idx_messages_loan_id ON public.messages(loan_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_friend_requests_sender_id') THEN
        CREATE INDEX idx_friend_requests_sender_id ON public.friend_requests(sender_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_friend_requests_receiver_id') THEN
        CREATE INDEX idx_friend_requests_receiver_id ON public.friend_requests(receiver_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_friend_requests_status') THEN
        CREATE INDEX idx_friend_requests_status ON public.friend_requests(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_social_connections_user_id') THEN
        CREATE INDEX idx_social_connections_user_id ON public.social_connections(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_social_connections_friend_id') THEN
        CREATE INDEX idx_social_connections_friend_id ON public.social_connections(friend_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_reputation_user_id') THEN
        CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loan_ratings_loan_id') THEN
        CREATE INDEX idx_loan_ratings_loan_id ON public.loan_ratings(loan_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loan_ratings_rated_user_id') THEN
        CREATE INDEX idx_loan_ratings_rated_user_id ON public.loan_ratings(rated_user_id);
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (only if they don't exist)
DO $$
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
    END IF;

    -- Tools policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tools' AND policyname = 'Users can view tools') THEN
        CREATE POLICY "Users can view tools" ON public.tools FOR SELECT USING (
            is_available = true OR (auth.uid() IS NOT NULL AND (SELECT auth.uid()) = owner_id)
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tools' AND policyname = 'Users can insert their own tools') THEN
        CREATE POLICY "Users can insert their own tools" ON public.tools FOR INSERT WITH CHECK ((SELECT auth.uid()) = owner_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tools' AND policyname = 'Users can update their own tools') THEN
        CREATE POLICY "Users can update their own tools" ON public.tools FOR UPDATE USING ((SELECT auth.uid()) = owner_id) WITH CHECK ((SELECT auth.uid()) = owner_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tools' AND policyname = 'Users can delete their own tools') THEN
        CREATE POLICY "Users can delete their own tools" ON public.tools FOR DELETE USING ((SELECT auth.uid()) = owner_id);
    END IF;

    -- Loans policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'Users can view loans they are involved in') THEN
        CREATE POLICY "Users can view loans they're involved in" ON public.loans FOR SELECT USING ((SELECT auth.uid()) = borrower_id OR (SELECT auth.uid()) = lender_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'Users can insert loans') THEN
        CREATE POLICY "Users can insert loans" ON public.loans FOR INSERT WITH CHECK ((SELECT auth.uid()) = borrower_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'Users can update loans they are involved in') THEN
        CREATE POLICY "Users can update loans they're involved in" ON public.loans FOR UPDATE USING ((SELECT auth.uid()) = borrower_id OR (SELECT auth.uid()) = lender_id);
    END IF;

    -- Messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages they are involved in') THEN
        CREATE POLICY "Users can view messages they're involved in" ON public.messages FOR SELECT USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can insert messages') THEN
        CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update their own messages') THEN
        CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING ((SELECT auth.uid()) = sender_id);
    END IF;

    -- Friend requests policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can view own friend requests') THEN
        CREATE POLICY "Users can view own friend requests" ON public.friend_requests FOR SELECT USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can create friend requests') THEN
        CREATE POLICY "Users can create friend requests" ON public.friend_requests FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can update received friend requests') THEN
        CREATE POLICY "Users can update received friend requests" ON public.friend_requests FOR UPDATE USING ((SELECT auth.uid()) = receiver_id);
    END IF;

    -- Social connections policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_connections' AND policyname = 'Users can view own connections') THEN
        CREATE POLICY "Users can view own connections" ON public.social_connections FOR SELECT USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_connections' AND policyname = 'Users can create connections') THEN
        CREATE POLICY "Users can create connections" ON public.social_connections FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;

    -- User reputation policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reputation' AND policyname = 'Users can view all reputation') THEN
        CREATE POLICY "Users can view all reputation" ON public.user_reputation FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reputation' AND policyname = 'Users can update own reputation') THEN
        CREATE POLICY "Users can update own reputation" ON public.user_reputation FOR UPDATE USING ((SELECT auth.uid()) = user_id);
    END IF;

    -- Loan ratings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loan_ratings' AND policyname = 'Users can view loan ratings') THEN
        CREATE POLICY "Users can view loan ratings" ON public.loan_ratings FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loan_ratings' AND policyname = 'Users can create loan ratings') THEN
        CREATE POLICY "Users can create loan ratings" ON public.loan_ratings FOR INSERT WITH CHECK ((SELECT auth.uid()) = rater_id);
    END IF;
END $$;

-- Function to handle user creation (with security fix)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to handle friend request acceptance
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id UUID)
RETURNS void AS $$
DECLARE
    sender_uuid UUID;
    receiver_uuid UUID;
BEGIN
    -- Get the request details
    SELECT sender_id, receiver_id INTO sender_uuid, receiver_uuid
    FROM public.friend_requests
    WHERE id = request_id AND receiver_id = (SELECT auth.uid()) AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or not authorized';
    END IF;
    
    -- Update request status
    UPDATE public.friend_requests 
    SET status = 'accepted', updated_at = NOW()
    WHERE id = request_id;
    
    -- Create social connection (bidirectional)
    INSERT INTO public.social_connections (user_id, friend_id)
    VALUES (sender_uuid, receiver_uuid), (receiver_uuid, sender_uuid)
    ON CONFLICT (user_id, friend_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to handle friend request rejection
CREATE OR REPLACE FUNCTION public.reject_friend_request(request_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.friend_requests 
    SET status = 'rejected', updated_at = NOW()
    WHERE id = request_id AND receiver_id = (SELECT auth.uid()) AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or not authorized';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update user reputation
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS trigger AS $$
BEGIN
    -- Insert or update reputation record
    INSERT INTO public.user_reputation (user_id, total_loans, successful_loans, failed_loans)
    VALUES (
        NEW.borrower_id,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'cancelled' OR NEW.status = 'failed' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_loans = public.user_reputation.total_loans + EXCLUDED.total_loans,
        successful_loans = public.user_reputation.successful_loans + EXCLUDED.successful_loans,
        failed_loans = public.user_reputation.failed_loans + EXCLUDED.failed_loans,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tools_updated_at') THEN
        CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_loans_updated_at') THEN
        CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_friend_requests_updated_at') THEN
        CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON public.friend_requests
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_reputation_updated_at') THEN
        CREATE TRIGGER update_user_reputation_updated_at BEFORE UPDATE ON public.user_reputation
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_loan_status_change') THEN
        CREATE TRIGGER on_loan_status_change
            AFTER UPDATE OF status ON public.loans
            FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation();
    END IF;
END $$; 