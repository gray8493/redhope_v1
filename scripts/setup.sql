-- ============================================
-- REDHOPE DATABASE SETUP & REPAIR SCRIPT
-- Combined Fixes for Schema, RLS, and Admin Permissions
-- Run this script in Supabase SQL Editor to fix everything.
-- ============================================

BEGIN;

-- 1. SCHEMA UPDATES & MISSING COLUMNS
-- ============================================

-- USER Table Fixes
ALTER TABLE public.users 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing Donor columns if they don't exist
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS weight FLOAT,
    ADD COLUMN IF NOT EXISTS height FLOAT,
    ADD COLUMN IF NOT EXISTS health_history TEXT,
    ADD COLUMN IF NOT EXISTS last_donation_date DATE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add missing Hospital columns if they don't exist
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hospital_address TEXT,
    ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 1.1 SYSTEM SETTINGS TABLE (NEW)
-- Singleton table to store global configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Singleton ID
    low_stock_alert BOOLEAN DEFAULT false,
    donation_reminder BOOLEAN DEFAULT true,
    emergency_broadcast BOOLEAN DEFAULT false,
    
    ai_sensitivity INTEGER DEFAULT 7,
    min_hemoglobin FLOAT DEFAULT 12.5,
    min_weight FLOAT DEFAULT 50,
    question_version TEXT DEFAULT 'V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)',
    
    points_per_donation INTEGER DEFAULT 1000,
    referral_bonus INTEGER DEFAULT 250,
    exchange_rate INTEGER DEFAULT 500,
    points_expiry BOOLEAN DEFAULT true,
    
    two_factor_auth TEXT DEFAULT 'Bắt buộc cho tất cả Quản trị viên',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- 2. HELPER FUNCTIONS
-- ============================================

-- Create safe is_admin function to avoid RLS recursion using JWT metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create safe is_hospital function
CREATE OR REPLACE FUNCTION public.is_hospital()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'hospital';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- 3.1 TABLE: USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop old/conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can create users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Allows everyone to view hospital profiles" ON public.users;

-- Admin Policies (Full Access)
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (public.is_admin());

-- Hospital Visibility (Public)
-- This allows donors to join with users table to get hospital names/addresses
CREATE POLICY "Allows everyone to view hospital profiles" 
ON public.users 
FOR SELECT 
USING (role = 'hospital' OR auth.uid() = id OR public.is_admin());

-- User Policies (Self Access)
CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);


-- 3.2 TABLE: CAMPAIGNS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Hospitals can manage own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

-- Public View
CREATE POLICY "Everyone can view active campaigns" ON public.campaigns 
    FOR SELECT USING (true); -- Or limit to status='active'

-- Hospital Access (Manage Own)
CREATE POLICY "Hospitals can manage own campaigns" ON public.campaigns 
    FOR ALL USING (auth.uid() = hospital_id);

-- Admin Access
CREATE POLICY "Admins can manage campaigns" ON public.campaigns 
    FOR ALL USING (public.is_admin());


-- 3.3 TABLE: BLOOD_REQUESTS
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Hospitals can manage own requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Admins can manage requests" ON public.blood_requests;

-- Public View
CREATE POLICY "Everyone can view active requests" ON public.blood_requests 
    FOR SELECT USING (true);

-- Hospital Access
CREATE POLICY "Hospitals can manage own requests" ON public.blood_requests 
    FOR ALL USING (auth.uid() = hospital_id);

-- Admin Access
CREATE POLICY "Admins can manage requests" ON public.blood_requests 
    FOR ALL USING (public.is_admin());


-- 3.4 TABLE: SYSTEM_SETTINGS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins update settings" ON public.system_settings;

-- Allow Read Access for All Authenticated Users
CREATE POLICY "Public read settings" ON public.system_settings 
    FOR SELECT USING (true);

-- Allow Admin Update
CREATE POLICY "Admins update settings" ON public.system_settings 
    FOR UPDATE USING (public.is_admin());


-- 4. CLEANUP & CACHE REFRESH
-- ============================================

COMMIT;

-- Force refreshing the schema cache
NOTIFY pgrst, 'reload schema';

-- Verification Output
SELECT 'Database setup completed successfully' as status;
