-- ============================================
-- REDHOPE DATABASE SETUP - SUPABASE
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    blood_group VARCHAR(10),
    city VARCHAR(100),
    district VARCHAR(100),
    current_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for production security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
-- User creation policy: Authenticated users (from auth.users) can insert their corresponding profile
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. HOSPITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Prevent orphaned data
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    address TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Policies for Hospitals
CREATE POLICY "Everyone can view verified hospitals" ON public.hospitals 
    FOR SELECT USING (is_verified = true); -- Only verified hospitals
CREATE POLICY "Admins can manage hospitals" ON public.hospitals 
    FOR ALL USING (
        -- Check custom claim 'role' in the JWT
        (auth.jwt() ->> 'role') = 'admin' 
        OR 
        -- Fallback: also check if email is admin (optional, remove in strict prod)
        -- (auth.jwt() ->> 'email') = 'admin@redhope.com'
        -- Or service role check
        auth.role() = 'service_role'
    );

-- ============================================
-- 3. VOUCHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    partner_name VARCHAR(255),
    point_cost INTEGER DEFAULT 0 CHECK (point_cost >= 0),
    imported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Policies for Vouchers
CREATE POLICY "Everyone can view active vouchers" ON public.vouchers 
    FOR SELECT USING (status = 'Active');

CREATE POLICY "Admins can insert vouchers" ON public.vouchers 
    FOR INSERT WITH CHECK ((auth.jwt() ->> 'role') = 'admin' OR auth.role() = 'service_role');

CREATE POLICY "Admins can update vouchers" ON public.vouchers 
    FOR UPDATE USING ((auth.jwt() ->> 'role') = 'admin' OR auth.role() = 'service_role');

CREATE POLICY "Admins can delete vouchers" ON public.vouchers 
    FOR DELETE USING ((auth.jwt() ->> 'role') = 'admin' OR auth.role() = 'service_role');

-- ============================================
-- 4. RPC FUNCTIONS
-- ============================================
-- Atomic increment for points
CREATE OR REPLACE FUNCTION increment_points(row_id UUID, count INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Security check: Ensure caller owns the row OR is admin
  -- (Simple version: only check if row_id matches auth.uid())
  -- Note: RPC functions run with 'security invoker' by default unless defined with SECURITY DEFINER
  
  -- Prevent negative increment (if only addition allowed) or large subtractions?
  -- Request says: "reject negative count values to prevent theft"
  IF count < 0 THEN
      RAISE EXCEPTION 'Negative point increment not allowed.';
  END IF;

  -- Perform Update
  UPDATE public.users
  SET current_points = COALESCE(current_points, 0) + count
  WHERE id = row_id;
  
  -- If we wanted strictly owner-only:
  -- AND id = auth.uid()
  -- But admin might want to award points.
END;
$$ LANGUAGE plpgsql;
