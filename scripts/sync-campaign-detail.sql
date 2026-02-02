-- ============================================
-- REDHOPE DATABASE SYNC - CAMPAIGN DETAIL
-- Run this in Supabase SQL Editor to ensure consistency with UI.
-- ============================================

BEGIN;

-- 1. Add missing columns to campaigns table (if not renamed)
-- Note: 'target_blood_group' already exists as VARCHAR, but UI expects 'target_blood_group' to be usable.
-- We will add 'blood_group_needed' as an alias or extra column if you prefer,
-- but for simplicity, let's just make sure target_blood_group is there.
-- If you want it to support multiple values (ARRAY), use this:
ALTER TABLE public.campaigns 
    ALTER COLUMN target_blood_group TYPE TEXT[] 
    USING CASE 
        WHEN target_blood_group IS NULL THEN '{}'::TEXT[]
        ELSE ARRAY[target_blood_group]
    END;

-- 2. Add donation details to appointments table
-- This allows hospital to record blood type and volume directly on the appointment record.
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5),
    ADD COLUMN IF NOT EXISTS blood_volume INTEGER;

-- 3. Update existing records (optional)
UPDATE public.appointments 
SET blood_type = 'O+', blood_volume = 350 
WHERE status = 'Completed' AND blood_type IS NULL;

COMMIT;
