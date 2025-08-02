-- Fix RLS Performance Issues
-- Replace direct auth.uid() calls with (SELECT auth.uid()) to prevent re-evaluation for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own tools" ON tools;
DROP POLICY IF EXISTS "Users can view own loans" ON loans;
DROP POLICY IF EXISTS "Users can create loans" ON loans;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- RLS Policies for tools
CREATE POLICY "Users can manage own tools" ON tools FOR ALL USING ((SELECT auth.uid()) = owner_id);

-- RLS Policies for loans
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING ((SELECT auth.uid()) = borrower_id OR (SELECT auth.uid()) = lender_id);
CREATE POLICY "Users can create loans" ON loans FOR INSERT WITH CHECK ((SELECT auth.uid()) = borrower_id);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id); 