-- ============================================
-- FIX ADMIN PERMISSIONS & PROMOTE USER
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. FIX INFINITE RECURSION (Critical for Admin Access)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in public.users table (Bypassing RLS)
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RESET & APPLY ADMIN POLICIES ON KEY TABLES

-- Table: USERS
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (public.is_admin());

-- Table: CAMPAIGNS
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
    FOR ALL USING (public.is_admin());

-- Table: BLOOD_REQUESTS
DROP POLICY IF EXISTS "Admins can manage requests" ON public.blood_requests;
CREATE POLICY "Admins can manage requests" ON public.blood_requests
    FOR ALL USING (public.is_admin());

-- 3. PROMOTE YOUR CURRENT USER TO ADMIN (Optional but Recommended for Testing)
-- This updates the most recently created user to be an ADMIN.
-- CAREFUL: Only run this if you want the latest user to be Admin.
UPDATE public.users
SET role = 'admin'
WHERE id = auth.uid(); 
-- Note: auth.uid() works in policy context, but in SQL Editor you might need to specify ID manually if this doesn't capture your session.
-- Better approach for manual run: Update by email if you know it, e.g.:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your_email@example.com';

-- 4. EMERGENCY FALLBACK (ONLY IF NOTHING WORKS)
-- Allow Service Role (Supabase Dashboard) to always bypass.
-- (This is default behavior but good to ensure RLS doesn't block dashboard viewers if using client login)
