-- Add blood details to appointments table to support tracking donations
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS blood_type text,
    ADD COLUMN IF NOT EXISTS blood_volume integer DEFAULT 350;

-- Refresh PostgREST Schema Cache so the client can see the new columns immediately
NOTIFY pgrst, 'reload schema';
