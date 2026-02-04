-- Migration: Add screening fields to users table
-- Run this in Supabase SQL Editor

-- Add screening status fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS screening_status TEXT DEFAULT 'not_done' 
  CHECK (screening_status IN ('not_done', 'passed', 'failed'));

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS screening_verified_at TIMESTAMPTZ;

-- Comment for documentation
COMMENT ON COLUMN users.screening_status IS 'AI screening status: not_done, passed, or failed';
COMMENT ON COLUMN users.screening_verified_at IS 'Timestamp when screening was passed (valid for 24 hours)';
