-- Fix tools RLS policy to allow viewing available tools without authentication
-- The current policy requires auth.uid() which fails for unauthenticated users

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view tools" ON tools;

-- Create a new policy that allows viewing available tools without authentication
-- For unauthenticated users, only show available tools
-- For authenticated users, show available tools OR their own tools
CREATE POLICY "Users can view tools" ON tools FOR SELECT USING (
  is_available = true OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
); 