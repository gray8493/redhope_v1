-- =====================================================
-- SEED DONATION HISTORY FOR SPECIFIC USERS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS donation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID,
    donor_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    volume_ml INTEGER NOT NULL DEFAULT 350,
    blood_group_confirmed VARCHAR(5),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE donation_records DISABLE ROW LEVEL SECURITY;

-- Clear old sample data
DELETE FROM donation_records;

-- Get hospital ID
DO $$
DECLARE
    v_hospital_id UUID;
BEGIN
    -- Get hospital user
    SELECT id INTO v_hospital_id FROM users WHERE role = 'hospital' LIMIT 1;
    
    IF v_hospital_id IS NULL THEN
        v_hospital_id := '8247f405-a477-4565-8095-9092d1acef62'; -- Fallback
    END IF;

    -- =====================================================
    -- USER 1: 7f51114d-79cc-4273-85cf-536c77fcbb3a
    -- =====================================================
    INSERT INTO donation_records (donor_id, hospital_id, volume_ml, blood_group_confirmed, verified_at, notes)
    VALUES 
        ('7f51114d-79cc-4273-85cf-536c77fcbb3a', v_hospital_id, 450, 'A+', NOW() - INTERVAL '5 days', 'Hiến máu thành công'),
        ('7f51114d-79cc-4273-85cf-536c77fcbb3a', v_hospital_id, 350, 'A+', NOW() - INTERVAL '95 days', 'Hiến máu định kỳ'),
        ('7f51114d-79cc-4273-85cf-536c77fcbb3a', v_hospital_id, 400, 'A+', NOW() - INTERVAL '185 days', 'Chiến dịch mùa xuân');

    -- =====================================================
    -- USER 2: 86da2be3-1313-45b6-9a65-0fe8280e6c33
    -- =====================================================
    INSERT INTO donation_records (donor_id, hospital_id, volume_ml, blood_group_confirmed, verified_at, notes)
    VALUES 
        ('86da2be3-1313-45b6-9a65-0fe8280e6c33', v_hospital_id, 350, 'O+', NOW() - INTERVAL '12 days', 'Hiến máu khẩn cấp'),
        ('86da2be3-1313-45b6-9a65-0fe8280e6c33', v_hospital_id, 450, 'O+', NOW() - INTERVAL '102 days', 'Hiến máu thường'),
        ('86da2be3-1313-45b6-9a65-0fe8280e6c33', v_hospital_id, 350, 'O+', NOW() - INTERVAL '192 days', 'Chiến dịch hè'),
        ('86da2be3-1313-45b6-9a65-0fe8280e6c33', v_hospital_id, 400, 'O+', NOW() - INTERVAL '282 days', 'Hiến máu tình nguyện');

    -- =====================================================
    -- USER 3: a2be13e4-0716-4dd7-aaac-b630953d689a
    -- =====================================================
    INSERT INTO donation_records (donor_id, hospital_id, volume_ml, blood_group_confirmed, verified_at, notes)
    VALUES 
        ('a2be13e4-0716-4dd7-aaac-b630953d689a', v_hospital_id, 400, 'B+', NOW() - INTERVAL '20 days', 'Hiến máu lần đầu'),
        ('a2be13e4-0716-4dd7-aaac-b630953d689a', v_hospital_id, 350, 'B+', NOW() - INTERVAL '110 days', 'Hiến máu lần 2');

    -- =====================================================
    -- USER 4: fa956d1f-f812-4192-a070-3ddd2c146710
    -- =====================================================
    INSERT INTO donation_records (donor_id, hospital_id, volume_ml, blood_group_confirmed, verified_at, notes)
    VALUES 
        ('fa956d1f-f812-4192-a070-3ddd2c146710', v_hospital_id, 450, 'AB+', NOW() - INTERVAL '8 days', 'Hiến máu nhân đạo'),
        ('fa956d1f-f812-4192-a070-3ddd2c146710', v_hospital_id, 350, 'AB+', NOW() - INTERVAL '98 days', 'Hiến máu định kỳ'),
        ('fa956d1f-f812-4192-a070-3ddd2c146710', v_hospital_id, 400, 'AB+', NOW() - INTERVAL '188 days', 'Chiến dịch cuối năm'),
        ('fa956d1f-f812-4192-a070-3ddd2c146710', v_hospital_id, 350, 'AB+', NOW() - INTERVAL '278 days', 'Hiến máu tình nguyện'),
        ('fa956d1f-f812-4192-a070-3ddd2c146710', v_hospital_id, 450, 'AB+', NOW() - INTERVAL '368 days', 'Chiến dịch mùa xuân 2024');

    RAISE NOTICE 'Successfully inserted donation records for 4 users';
END $$;

-- =====================================================
-- VERIFY: Show all donation records
-- =====================================================
SELECT 
    u.full_name as "Tên người hiến",
    u.email,
    dr.volume_ml as "ML",
    dr.blood_group_confirmed as "Nhóm máu",
    dr.verified_at as "Ngày hiến",
    dr.notes as "Ghi chú"
FROM donation_records dr
LEFT JOIN users u ON dr.donor_id = u.id
ORDER BY dr.verified_at DESC;
