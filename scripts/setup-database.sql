-- ============================================
-- REDHOPE DATABASE SETUP - SUPABASE
-- Chạy code này trong Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. BẢNG USERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    blood_group VARCHAR(10),
    city VARCHAR(100),
    district VARCHAR(100),
    current_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Dữ liệu mẫu Users
INSERT INTO public.users (full_name, email, blood_group, city, district, current_points)
VALUES 
    ('Nguyễn Văn An', 'donora@example.com', 'O+', 'Hồ Chí Minh', 'Quận 1', 1500),
    ('Trần Thị Bích', 'donorb@example.com', 'A+', 'Hồ Chí Minh', 'Quận 7', 2300),
    ('Lê Hoàng Nam', 'donorc@example.com', 'B+', 'Hà Nội', 'Cầu Giấy', 800),
    ('Phạm Minh Tuấn', 'donord@example.com', 'AB-', 'Đà Nẵng', 'Hải Châu', 450),
    ('Võ Thị Hương', 'donore@example.com', 'O-', 'Hồ Chí Minh', 'Bình Thạnh', 3200)
ON CONFLICT (email) DO NOTHING;


-- ============================================
-- 2. BẢNG HOSPITALS
-- ============================================
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id), -- Có thể link với tài khoản user quản trị
    name VARCHAR(255),
    license_number VARCHAR(100),
    address TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;

-- Dữ liệu mẫu Hospitals
INSERT INTO public.hospitals (name, license_number, address, is_verified)
VALUES
    ('Bệnh viện Chợ Rẫy', 'HL-8829-HCM', '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM', true),
    ('Bệnh viện Đại học Y Dược', 'HL-4412-HCM', '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM', true),
    ('Bệnh viện Bạch Mai', 'HL-3291-HN', '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội', true),
    ('Bệnh viện Đa khoa Quốc tế Vinmec', 'HL-1055-HN', '458 Minh Khai, Khu đô thị Times City, Hai Bà Trưng, Hà Nội', false),
    ('Bệnh viện Từ Dũ', 'HL-9921-HCM', '284 Cống Quỳnh, Phường Phạm Ngũ Lão, Quận 1, TP.HCM', true);


-- ============================================
-- 3. BẢNG VOUCHERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(100),
    partner_name VARCHAR(255),
    point_cost INTEGER DEFAULT 0,
    imported_by UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Draft
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vouchers DISABLE ROW LEVEL SECURITY;

-- Dữ liệu mẫu Vouchers
INSERT INTO public.vouchers (code, partner_name, point_cost, status)
VALUES
    ('COFFEE-FREE', 'Highlands Coffee', 500, 'Active'),
    ('CGV-2024', 'CGV Cinemas', 1200, 'Active'),
    ('GRAB-50', 'Grab', 800, 'Active'),
    ('SHOPEE-VOUCHER', 'Shopee', 1500, 'Inactive'),
    ('GYM-1-MONTH', 'City Gym', 5000, 'Draft');

-- ============================================
-- CHECK DATA
-- ============================================
SELECT 'Users count: ' || count(*) FROM public.users
UNION ALL
SELECT 'Hospitals count: ' || count(*) FROM public.hospitals
UNION ALL
SELECT 'Vouchers count: ' || count(*) FROM public.vouchers;
