-- ============================================
-- FIX USERS TABLE & RLS FOR ADMIN DASHBOARD
-- ============================================

-- 1. Allow 'id' to be auto-generated if missing (Crucial for Admin 'Create User' forms)
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Confirm is_admin function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-APPLY ALL ADMIN POLICIES (FORCE OVERWRITE)
DROP POLICY IF EXISTS "Admins can create users" ON public.users;
CREATE POLICY "Admins can create users" ON public.users FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.is_admin());

-- 4. EMERGENCY: Grant service role permissions just in case (optional, good for debugging)
GRANT ALL ON TABLE public.users TO service_role;

SELECT 'Schema and RLS updated successfully' as status;
