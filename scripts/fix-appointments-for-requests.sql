-- ============================================
-- FIX: SUPPORT BLOOD REQUEST REGISTRATION
-- Add blood_request_id to appointments table
-- ============================================

BEGIN;

-- 1. Ensure blood_request_id column exists in appointments
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'blood_request_id'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN blood_request_id UUID REFERENCES public.blood_requests(id);
        RAISE NOTICE 'Added blood_request_id to appointments table';
    END IF;
END $$;

-- 2. Add an index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_blood_request ON public.appointments(blood_request_id);

COMMIT;

SELECT '✅ Appointments table updated with blood_request_id' as status;
