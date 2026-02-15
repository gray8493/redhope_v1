-- Migration: Add blood_volume to appointments and ensure blood_group in users
-- Run this in Supabase SQL Editor

-- Add blood_volume column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS blood_volume INTEGER;

COMMENT ON COLUMN appointments.blood_volume IS 'Volume of blood donated in ml (e.g., 250, 350, 450)';

-- Ensure blood_group exists in users table (it should already be there based on code usage)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS blood_group TEXT;

-- Optional: Add other tracking fields to appointments if needed
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reaction_type TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;
