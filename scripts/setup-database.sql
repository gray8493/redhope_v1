-- ============================================
-- REDHOPE DATABASE SETUP - SUPABASE (COMPREHENSIVE UNIFIED USERS TABLE)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Buộc Supabase cập nhật lại sơ đồ bảng (Khắc phục lỗi 406)
NOTIFY pgrst, 'reload schema';

-- 2. USERS TABLE (Donor, Hospital, Admin)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Matches Auth UID
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('donor', 'hospital', 'admin')),
    phone VARCHAR(20),
    
    -- Common profile fields
    city VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    
    -- Donor specific fields
    blood_group VARCHAR(10),
    citizen_id_encrypted BYTEA, -- Strong AES/GCM encrypted value
    citizen_id_hash VARCHAR(64) UNIQUE, -- Deterministic HMAC_SHA256 for uniqueness checks
    dob DATE,
    gender VARCHAR(10),
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
DROP POLICY IF EXISTS "Enable email search for all" ON public.users;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public to view hospitals" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;
DROP POLICY IF EXISTS "Allow signup inserts" ON public.users;

-- RLS policies follow least-privilege principle.
-- REPLACED: CREATE POLICY "Enable email search for all" ON public.users FOR SELECT USING (true);
-- Note: Use a specific RPC with restricted access to look up users by email for search functionality.
CREATE POLICY "Allow users to view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow public to view hospitals" ON public.users FOR SELECT USING (role = 'hospital' AND is_verified = true);
CREATE POLICY "Admin full access" ON public.users FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "Allow signup inserts" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    partner_name VARCHAR(255),
    point_cost INTEGER DEFAULT 0 CHECK (point_cost >= 0),
    imported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view active vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;

CREATE POLICY "Everyone can view active vouchers" ON public.vouchers FOR SELECT USING (status = 'Active');
CREATE POLICY "Admins can manage vouchers" ON public.vouchers FOR ALL USING ((auth.jwt() ->> 'role') = 'admin' OR auth.role() = 'service_role');

-- 4. RPC FUNCTIONS
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
