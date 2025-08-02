-- Consolidate Multiple Permissive Policies on Tools Table
-- Replace multiple SELECT policies with a single optimized policy

-- Drop existing policies that create conflicts
DROP POLICY IF EXISTS "Users can view available tools" ON tools;
DROP POLICY IF EXISTS "Users can manage own tools" ON tools;

-- Create consolidated policies
-- Single SELECT policy that covers all scenarios: view available tools OR own tools
CREATE POLICY "Users can view tools" ON tools FOR SELECT USING (
  is_available = true OR (SELECT auth.uid()) = owner_id
);

-- Separate policies for non-SELECT operations
CREATE POLICY "Users can insert own tools" ON tools FOR INSERT WITH CHECK (
  (SELECT auth.uid()) = owner_id
);

CREATE POLICY "Users can update own tools" ON tools FOR UPDATE USING (
  (SELECT auth.uid()) = owner_id
) WITH CHECK (
  (SELECT auth.uid()) = owner_id
);

CREATE POLICY "Users can delete own tools" ON tools FOR DELETE USING (
  (SELECT auth.uid()) = owner_id
); 