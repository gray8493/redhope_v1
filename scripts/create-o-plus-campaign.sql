-- ============================================
-- SCRIPT TẠO CHIẾN DỊCH HIẾN MÁU NHÓM O+ KHẨN CẤP
-- ============================================

INSERT INTO public.campaigns (
    id, 
    hospital_id, 
    name, 
    description, 
    location_name, 
    city, 
    district, 
    start_time, 
    end_time, 
    target_units, 
    status, 
    created_at
) VALUES (
    gen_random_uuid(), 
    '10000000-0000-0000-0000-000000000002', -- ID Bệnh viện Chợ Rẫy (Lấy từ seed-data)
    'Chiến dịch hiến máu O+ Khẩn cấp', 
    '💎 Hiện tại nguồn máu nhóm O+ tại bệnh viện đang cạn kiệt. Chúng tôi kêu gọi các tình nguyện viên có nhóm máu O+ tham gia hiến máu cứu người ngay hôm nay.', 
    'Khu vực hiến máu A1 - BV Chợ Rẫy', 
    'Hồ Chí Minh', 
    'Quận 5', 
    NOW() + INTERVAL '1 day',              -- Bắt đầu từ ngày mai
    NOW() + INTERVAL '3 days',             -- Kéo dài trong 3 ngày
    150,                                   -- Mục tiêu 150 đơn vị
    'active', 
    NOW()
);

-- Thông báo cho admin (Tùy chọn)
SELECT '✅ Đã tạo thành công chiến dịch hiến máu O+ tại Bệnh viện Chợ Rẫy.' as notification;
