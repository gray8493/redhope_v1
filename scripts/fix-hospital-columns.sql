-- ============================================
-- FIX MISSING HOSPITAL COLUMNS IN USERS TABLE
-- ============================================

-- 1. Add missing columns for Hospital profile if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS hospital_address TEXT,
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Force Reload Schema Cache (Fixes PGRST204 error)
NOTIFY pgrst, 'reload schema';

SELECT 'Hospital columns added and schema cache reloaded' as status;
