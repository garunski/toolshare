-- Fix Social Features RLS Performance Issues
-- Replace direct auth.uid() calls with (SELECT auth.uid()) to prevent re-evaluation for each row

-- Drop existing social feature policies
DROP POLICY IF EXISTS "Users can view own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can create friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update received friend requests" ON friend_requests;

DROP POLICY IF EXISTS "Users can view own connections" ON social_connections;
DROP POLICY IF EXISTS "Users can create connections" ON social_connections;

DROP POLICY IF EXISTS "Users can update own reputation" ON user_reputation;

DROP POLICY IF EXISTS "Users can create loan ratings" ON loan_ratings;

-- Recreate friend_requests policies with optimized auth.uid() calls
CREATE POLICY "Users can view own friend requests" ON friend_requests 
  FOR SELECT USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);
CREATE POLICY "Users can create friend requests" ON friend_requests 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id);
CREATE POLICY "Users can update received friend requests" ON friend_requests 
  FOR UPDATE USING ((SELECT auth.uid()) = receiver_id);

-- Recreate social_connections policies with optimized auth.uid() calls
CREATE POLICY "Users can view own connections" ON social_connections 
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_id);
CREATE POLICY "Users can create connections" ON social_connections 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Recreate user_reputation policies with optimized auth.uid() calls
CREATE POLICY "Users can update own reputation" ON user_reputation 
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Recreate loan_ratings policies with optimized auth.uid() calls
CREATE POLICY "Users can create loan ratings" ON loan_ratings 
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = rater_id); 