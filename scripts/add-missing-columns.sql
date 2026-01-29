-- ============================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- Run this SQL in Supabase Dashboard -> SQL Editor
-- ============================================

-- Add 'weight' column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS weight numeric;

-- Add 'last_donation_date' column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_donation_date timestamp with time zone;

-- Add 'health_history' column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS health_history text;

-- Add 'is_verified' column if it doesn't exist (just in case)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Add 'avatar_url' column if it doesn't exist (saw this in types too)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Refresh schema cache (implicit in Supabase usually, but good to know)
NOTIFY pgrst, 'reload config';
