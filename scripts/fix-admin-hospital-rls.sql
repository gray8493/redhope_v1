-- FIX ADMIN PERMISSIONS FOR MANAGING HOSPITALS (INSERT/UPDATE/DELETE)

-- 1. Ensure Admin Helper Function Exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ADMIN PERMISSIONS ON USERS TABLE
-- Allow Admins to INSERT new users (e.g. create hospitals)
DROP POLICY IF EXISTS "Admins can create users" ON public.users;
CREATE POLICY "Admins can create users" ON public.users 
    FOR INSERT WITH CHECK (public.is_admin());

-- Allow Admins to UPDATE any user
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users 
    FOR UPDATE USING (public.is_admin());

-- Allow Admins to DELETE users (if needed)
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users 
    FOR DELETE USING (public.is_admin());

-- Allow Admins to VIEW all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users 
    FOR SELECT USING (public.is_admin());

-- Confirm setup
SELECT 'Admin policies updated successfully' as status;
