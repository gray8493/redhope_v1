-- ============================================
-- FIX RLS POLICY FOR USER UPSERT (Verification Page)
-- Run this SQL in Supabase Dashboard -> SQL Editor
-- ============================================

-- 1. DROP ALL EXISTING POLICIES ON users TABLE
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "allow_own_user_select" ON public.users;
DROP POLICY IF EXISTS "allow_own_user_insert" ON public.users;
DROP POLICY IF EXISTS "allow_own_user_update" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- 2. CREATE NEW COMPREHENSIVE POLICIES

-- Policy: Users can SELECT their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can INSERT their own profile (for upsert)
CREATE POLICY "Users can create own profile" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can UPDATE their own profile (for upsert and profile edits)
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. ADMIN POLICIES (optional - for admin dashboard)
-- Admin can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can update all users
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. VERIFY POLICIES
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
