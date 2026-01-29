-- ============================================
-- FIX RLS POLICY FOR USER REGISTRATION
-- Run this SQL in Supabase Dashboard -> SQL Editor
-- ============================================

-- Policy: Allow authenticated users to create their own profile
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
CREATE POLICY "Users can create own profile" ON public.users 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Alternative: If the above doesn't work (because session might not be ready immediately)
-- Use this more permissive policy that checks email match instead
-- DROP POLICY IF EXISTS "Users can create profile with matching email" ON public.users;
-- CREATE POLICY "Users can create profile with matching email" ON public.users 
--     FOR INSERT 
--     WITH CHECK (auth.jwt()->>'email' = email);

-- If you still have issues, you can temporarily allow all inserts for testing
-- (NOT recommended for production)
-- DROP POLICY IF EXISTS "Allow all inserts" ON public.users;
-- CREATE POLICY "Allow all inserts" ON public.users FOR INSERT WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';
