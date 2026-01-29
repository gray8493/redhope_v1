-- ============================================
-- FIX RLS INFINITE RECURSION
-- Run this SQL in Supabase Dashboard -> SQL Editor
-- ============================================

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- 2. Create a SECURITY DEFINER function to check admin status withouth triggering RLS
-- This function runs with the privileges of the creator (postgres), bypassing RLS on 'users' table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create Admin policies using the safe function
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Ensure basic user policies are still there (just to be safe)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);
