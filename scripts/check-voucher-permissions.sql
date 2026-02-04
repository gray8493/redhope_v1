-- Script to check and fix voucher table permissions
-- Run this in Supabase SQL Editor

-- 1. Check current RLS policies on vouchers table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'vouchers';

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vouchers';

-- 3. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vouchers'
ORDER BY ordinal_position;

-- 4. If you need to enable admin access, uncomment and run:
/*
-- Drop existing policies if needed
DROP POLICY IF EXISTS "Admin full access to vouchers" ON vouchers;

-- Create policy for admin full access
CREATE POLICY "Admin full access to vouchers"
ON vouchers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Enable RLS if not already enabled
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
*/

-- 5. Test query to see if current user can insert
/*
INSERT INTO vouchers (code, partner_name, point_cost, status)
VALUES ('TEST-' || gen_random_uuid()::text, 'Test Voucher', 1000, 'Draft')
RETURNING *;
*/
