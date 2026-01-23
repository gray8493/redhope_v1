-- ============================================
-- REDHOPE DATABASE SETUP - SUPABASE (UNIFIED USERS TABLE)
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS TABLE (Donor, Hospital, Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('donor', 'hospital', 'admin')),
    
    -- Donor specific fields
    blood_group VARCHAR(10),
    city VARCHAR(100),
    district VARCHAR(100),
    current_points INTEGER DEFAULT 0,
    
    -- Hospital specific fields
    hospital_name VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    hospital_address TEXT,
    is_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id OR (auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all" ON public.users FOR SELECT USING ((auth.jwt() ->> 'role') = 'admin');

-- ============================================
-- 2. VOUCHERS TABLE
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

CREATE POLICY "Everyone can view active vouchers" ON public.vouchers 
    FOR SELECT USING (status = 'Active');
CREATE POLICY "Admins can manage vouchers" ON public.vouchers 
    FOR ALL USING ((auth.jwt() ->> 'role') = 'admin' OR auth.role() = 'service_role');

-- ============================================
-- 3. RPC FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION increment_points(row_id UUID, count INTEGER)
RETURNS VOID AS $$
BEGIN
  IF count < 0 THEN
      RAISE EXCEPTION 'Negative point increment not allowed.';
  END IF;

  UPDATE public.users
  SET current_points = COALESCE(current_points, 0) + count
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
