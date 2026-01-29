-- ============================================
-- REDHOPE SAMPLE DATA - 5 RECORDS FOR EACH TABLE
-- Run this after full-database-schema.sql
-- ============================================

-- =============================================
-- 1. USERS TABLE (5 Donors, 3 Hospitals, 2 Admins = 10 total, but 5 minimum each role shown)
-- =============================================

-- Admin accounts
INSERT INTO public.users (id, full_name, email, role, phone, city, district, address, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Super Admin', 'admin@redhope.vn', 'admin', '0900000001', 'Hà Nội', 'Hoàn Kiếm', '1 Tràng Thi', NOW()),
('00000000-0000-0000-0000-000000000002', 'Admin Hỗ Trợ', 'support@redhope.vn', 'admin', '0900000002', 'Hồ Chí Minh', 'Quận 1', '100 Nguyễn Huệ', NOW());

-- Hospital accounts
INSERT INTO public.users (id, full_name, email, role, phone, city, district, address, hospital_name, license_number, is_verified, created_at) VALUES
('10000000-0000-0000-0000-000000000001', 'Bệnh viện Bạch Mai', 'contact@bachmai.vn', 'hospital', '0241234567', 'Hà Nội', 'Đống Đa', '78 Giải Phóng', 'Bệnh viện Bạch Mai', 'BV-HN-001', true, NOW()),
('10000000-0000-0000-0000-000000000002', 'Bệnh viện Chợ Rẫy', 'contact@choray.vn', 'hospital', '0281234567', 'Hồ Chí Minh', 'Quận 5', '201B Nguyễn Chí Thanh', 'Bệnh viện Chợ Rẫy', 'BV-HCM-001', true, NOW()),
('10000000-0000-0000-0000-000000000003', 'Bệnh viện Việt Đức', 'contact@vietduc.vn', 'hospital', '0241234568', 'Hà Nội', 'Hoàn Kiếm', '40 Tràng Thi', 'Bệnh viện Việt Đức', 'BV-HN-002', true, NOW()),
('10000000-0000-0000-0000-000000000004', 'Bệnh viện Đại học Y Dược', 'contact@umc.vn', 'hospital', '0281234569', 'Hồ Chí Minh', 'Quận 5', '215 Hồng Bàng', 'Bệnh viện ĐH Y Dược TP.HCM', 'BV-HCM-002', true, NOW()),
('10000000-0000-0000-0000-000000000005', 'Bệnh viện Nhi Trung Ương', 'contact@nhitw.vn', 'hospital', '0241234570', 'Hà Nội', 'Đống Đa', '18/879 La Thành', 'Bệnh viện Nhi Trung Ương', 'BV-HN-003', false, NOW());

-- Donor accounts (người hiến máu)
INSERT INTO public.users (id, full_name, email, role, phone, city, district, address, blood_group, citizen_id, dob, gender, current_points, created_at) VALUES
('20000000-0000-0000-0000-000000000001', 'Nguyễn Văn An', 'nguyenvanan@gmail.com', 'donor', '0901234567', 'Hà Nội', 'Ba Đình', '12 Liễu Giai', 'O+', '001200001234', '1995-05-15', 'Male', 500, NOW()),
('20000000-0000-0000-0000-000000000002', 'Trần Thị Bình', 'tranthibinh@gmail.com', 'donor', '0912345678', 'Hồ Chí Minh', 'Quận 3', '45 Võ Văn Tần', 'A+', '079200002345', '1998-08-22', 'Female', 350, NOW()),
('20000000-0000-0000-0000-000000000003', 'Lê Minh Châu', 'leminhchau@gmail.com', 'donor', '0923456789', 'Đà Nẵng', 'Hải Châu', '88 Nguyễn Văn Linh', 'B+', '048200003456', '1992-12-03', 'Male', 800, NOW()),
('20000000-0000-0000-0000-000000000004', 'Phạm Thị Dung', 'phamthidung@gmail.com', 'donor', '0934567890', 'Hà Nội', 'Cầu Giấy', '20 Duy Tân', 'AB+', '001199004567', '1999-03-18', 'Female', 150, NOW()),
('20000000-0000-0000-0000-000000000005', 'Hoàng Văn Em', 'hoangvanem@gmail.com', 'donor', '0945678901', 'Hồ Chí Minh', 'Bình Thạnh', '123 Điện Biên Phủ', 'O-', '079199005678', '1990-07-25', 'Male', 1200, NOW());

-- =============================================
-- 2. CAMPAIGNS TABLE (5 chiến dịch hiến máu)
-- =============================================
INSERT INTO public.campaigns (id, hospital_id, name, description, location_name, city, district, start_time, end_time, target_units, status, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hiến Máu Nhân Đạo Xuân 2026', 'Chương trình hiến máu đầu năm mới, mang những giọt máu hồng đến với các bệnh nhân cần máu.', 'Hội trường Bạch Mai', 'Hà Nội', 'Đống Đa', '2026-02-01 08:00:00+07', '2026-02-01 17:00:00+07', 200, 'active', NOW()),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Giọt Máu Hồng – Chợ Rẫy', 'Chiến dịch vận động toàn dân hiến máu, kêu gọi sự chung tay của cộng đồng.', 'Sân bệnh viện Chợ Rẫy', 'Hồ Chí Minh', 'Quận 5', '2026-02-10 07:30:00+07', '2026-02-10 16:30:00+07', 300, 'active', NOW()),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Lễ Hội Giọt Máu Yêu Thương', 'Sự kiện thường niên lớn nhất miền Bắc về hiến máu tình nguyện.', 'Cung VH Hữu Nghị', 'Hà Nội', 'Ba Đình', '2026-03-15 08:00:00+07', '2026-03-17 17:00:00+07', 500, 'active', NOW()),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Ngày Hội Hiến Máu Sinh Viên', 'Dành cho sinh viên các trường đại học khu vực Hà Nội.', 'Trường ĐH Bách Khoa HN', 'Hà Nội', 'Hai Bà Trưng', '2026-04-01 08:00:00+07', '2026-04-01 16:00:00+07', 150, 'draft', NOW()),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'Chiến dịch Máu Sài Gòn', 'Chiến dịch vận động hiến máu khẩn cấp do thiếu hụt nguồn máu dự trữ.', 'Nhà VH Thanh Niên', 'Hồ Chí Minh', 'Quận 1', '2026-01-20 07:00:00+07', '2026-01-25 18:00:00+07', 400, 'ended', NOW());

-- =============================================
-- 3. BLOOD REQUESTS TABLE (5 yêu cầu máu khẩn cấp)
-- =============================================
INSERT INTO public.blood_requests (id, hospital_id, required_blood_group, required_units, urgency_level, status, description, created_at) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'O-', 10, 'Emergency', 'Open', 'Cần gấp máu O- cho bệnh nhân phẫu thuật tim mạch. Tình trạng nguy kịch.', NOW()),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'A+', 5, 'Urgent', 'Open', 'Bệnh nhân ung thư cần truyền máu định kỳ. Mức độ khẩn cấp.', NOW()),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'B+', 8, 'Normal', 'Open', 'Dự trữ máu B+ thấp, cần bổ sung cho kho lưu trữ.', NOW()),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'AB-', 3, 'Emergency', 'Open', 'Bệnh nhân tai nạn giao thông cần máu hiếm AB-. RẤT KHẨN CẤP!', NOW()),
('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'O+', 15, 'Normal', 'Closed', 'Yêu cầu đã được đáp ứng. Cảm ơn các nhà hảo tâm!', NOW());

-- =============================================
-- 4. APPOINTMENTS TABLE (5 lịch hẹn hiến máu)
-- =============================================
INSERT INTO public.appointments (id, user_id, campaign_id, scheduled_time, qr_code, status, created_at) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2026-02-01 09:00:00+07', 'QR-REDHOPE-001-AN', 'Booked', NOW()),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '2026-02-10 10:30:00+07', 'QR-REDHOPE-002-BINH', 'Booked', NOW()),
('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '2026-03-15 14:00:00+07', 'QR-REDHOPE-003-CHAU', 'Booked', NOW()),
('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '2026-01-22 08:30:00+07', 'QR-REDHOPE-004-EM', 'Completed', NOW()),
('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '2026-02-01 11:00:00+07', 'QR-REDHOPE-005-DUNG', 'Cancelled', NOW());

-- =============================================
-- 5. DONATION RECORDS TABLE (5 lịch sử hiến máu)
-- =============================================
INSERT INTO public.donation_records (id, appointment_id, donor_id, hospital_id, volume_ml, blood_group_confirmed, verified_at, notes) VALUES
('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 450, 'O-', '2026-01-22 09:15:00+07', 'Hiến máu toàn phần. Tình trạng sức khỏe tốt.'),
('60000000-0000-0000-0000-000000000002', NULL, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 350, 'O+', '2025-12-15 10:30:00+07', 'Hiến tiểu cầu. Người hiến có tiền sử hiến máu nhiều lần.'),
('60000000-0000-0000-0000-000000000003', NULL, '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 450, 'B+', '2025-11-20 14:00:00+07', 'Hiến máu toàn phần lần đầu. Kết quả xét nghiệm tốt.'),
('60000000-0000-0000-0000-000000000004', NULL, '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 250, 'A+', '2025-10-05 09:00:00+07', 'Hiến plasma. Người hiến khỏe mạnh.'),
('60000000-0000-0000-0000-000000000005', NULL, '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 450, 'O-', '2025-08-12 11:30:00+07', 'Hiến máu toàn phần. Nhà hảo tâm VIP.');

-- =============================================
-- 6. VOUCHERS TABLE (5 voucher đổi quà)
-- =============================================
INSERT INTO public.vouchers (id, title, description, code, partner_name, point_cost, stock_quantity, status, expires_at, created_at) VALUES
('70000000-0000-0000-0000-000000000001', 'Giảm 50K Tiki', 'Mã giảm 50.000đ cho đơn hàng từ 200.000đ trên Tiki.vn', 'TIKI50K-REDHOPE', 'Tiki', 200, 100, 'Active', '2026-06-30 23:59:59+07', NOW()),
('70000000-0000-0000-0000-000000000002', 'Trà sữa The Alley', 'Tặng 1 ly trà sữa size L bất kỳ tại The Alley toàn quốc.', 'ALLEY-FREE-L', 'The Alley', 150, 50, 'Active', '2026-04-30 23:59:59+07', NOW()),
('70000000-0000-0000-0000-000000000003', 'Vé xem phim CGV', 'Miễn phí 1 vé xem phim 2D tại tất cả rạp CGV.', 'CGV-MOVIE-FREE', 'CGV Cinemas', 300, 30, 'Active', '2026-05-15 23:59:59+07', NOW()),
('70000000-0000-0000-0000-000000000004', 'Giảm 100K Shopee', 'Mã giảm 100.000đ cho đơn từ 500.000đ. Áp dụng sản phẩm chính hãng.', 'SHOPEE100K-RH', 'Shopee', 400, 200, 'Active', '2026-12-31 23:59:59+07', NOW()),
('70000000-0000-0000-0000-000000000005', 'Combo Highland Coffee', 'Tặng combo 1 Freeze + 1 Bánh ngọt tại Highland Coffee.', 'HIGHLAND-COMBO', 'Highland Coffee', 250, 0, 'Inactive', '2026-03-31 23:59:59+07', NOW());

-- =============================================
-- 7. USER REDEMPTIONS TABLE (5 lịch sử đổi quà)
-- =============================================
INSERT INTO public.user_redemptions (id, user_id, voucher_id, redeemed_at, status) VALUES
('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000001', '2026-01-15 10:00:00+07', 'Redeemed'),
('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003', '2026-01-10 14:30:00+07', 'Redeemed'),
('80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', '2026-01-20 09:15:00+07', 'Redeemed'),
('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000004', '2026-01-25 16:00:00+07', 'Redeemed'),
('80000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', '2026-01-28 11:45:00+07', 'Redeemed');

-- =============================================
-- 8. SCREENING LOGS TABLE (5 bản ghi sàng lọc AI)
-- =============================================
INSERT INTO public.screening_logs (id, user_id, campaign_id, ai_result, health_details, created_at) VALUES
('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, '{"weight": 65, "hemoglobin": 14.2, "blood_pressure": "120/80", "temperature": 36.5, "recent_illness": false, "medications": [], "eligible": true}', NOW()),
('90000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', true, '{"weight": 52, "hemoglobin": 12.8, "blood_pressure": "115/75", "temperature": 36.3, "recent_illness": false, "medications": [], "eligible": true}', NOW()),
('90000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', true, '{"weight": 78, "hemoglobin": 15.1, "blood_pressure": "125/82", "temperature": 36.6, "recent_illness": false, "medications": [], "eligible": true}', NOW()),
('90000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', false, '{"weight": 48, "hemoglobin": 10.5, "blood_pressure": "100/65", "temperature": 36.2, "recent_illness": false, "medications": ["vitamin"], "eligible": false, "reason": "Hemoglobin thấp, cần bổ sung sắt trước khi hiến máu."}', NOW()),
('90000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', true, '{"weight": 82, "hemoglobin": 16.0, "blood_pressure": "118/78", "temperature": 36.4, "recent_illness": false, "medications": [], "eligible": true, "note": "VIP Donor - Hiến máu nhiều lần"}', NOW());

-- =============================================
-- 9. NOTIFICATIONS TABLE (5 thông báo)
-- =============================================
INSERT INTO public.notifications (id, user_id, title, content, is_read, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Đặt lịch thành công!', 'Bạn đã đặt lịch hiến máu thành công tại chiến dịch "Hiến Máu Nhân Đạo Xuân 2026" vào ngày 01/02/2026. Vui lòng đến đúng giờ!', false, NOW()),
('a0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'Cảm ơn bạn đã hiến máu!', 'Bạn đã hiến máu thành công và được cộng 100 điểm. Tổng điểm hiện tại: 1200. Cảm ơn bạn vì nghĩa cử cao đẹp!', true, NOW()),
('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Chiến dịch mới gần bạn!', 'Chiến dịch "Giọt Máu Hồng – Chợ Rẫy" sẽ diễn ra vào ngày 10/02/2026 tại Quận 5. Hãy đăng ký ngay!', false, NOW()),
('a0000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'Voucher sắp hết hạn!', 'Voucher "Vé xem phim CGV" của bạn sẽ hết hạn vào 15/05/2026. Hãy sử dụng trước khi quá muộn!', false, NOW()),
('a0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 'Cập nhật sức khỏe', 'Kết quả sàng lọc cho thấy bạn cần bổ sung sắt trước khi hiến máu. Hãy tham khảo bác sĩ và thử lại sau 3 tháng.', true, NOW());

-- =============================================
-- 10. FINANCIAL DONATIONS TABLE (5 quyên góp tiền)
-- =============================================
INSERT INTO public.financial_donations (id, donor_id, donor_name, amount, payment_method, status, transaction_code, is_anonymous, message, created_at) VALUES
('b0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'Hoàng Văn Em', 5000000, 'bank_transfer', 'completed', 'TXN-RH-202601-001', false, 'Ủng hộ quỹ hiến máu. Chúc sức khỏe mọi người!', '2026-01-10 08:30:00+07'),
('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Lê Minh Châu', 2000000, 'momo', 'completed', 'TXN-RH-202601-002', false, 'Một chút đóng góp cho cộng đồng.', '2026-01-15 14:20:00+07'),
('b0000000-0000-0000-0000-000000000003', NULL, 'Người ẩn danh', 10000000, 'bank_transfer', 'completed', 'TXN-RH-202601-003', true, NULL, '2026-01-18 10:00:00+07'),
('b0000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Nguyễn Văn An', 500000, 'momo', 'completed', 'TXN-RH-202601-004', false, 'Góp sức nhỏ, làm việc lớn!', '2026-01-25 17:45:00+07'),
('b0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Trần Thị Bình', 1000000, 'momo', 'pending', 'TXN-RH-202601-005', false, 'Quyên góp cho bệnh viện Chợ Rẫy.', NOW());

-- =============================================
-- DONE! Sample data inserted successfully.
-- =============================================

-- Summary:
-- ✅ users: 12 records (2 admin, 5 hospital, 5 donor)
-- ✅ campaigns: 5 records
-- ✅ blood_requests: 5 records
-- ✅ appointments: 5 records
-- ✅ donation_records: 5 records
-- ✅ vouchers: 5 records
-- ✅ user_redemptions: 5 records
-- ✅ screening_logs: 5 records
-- ✅ notifications: 5 records
-- ✅ financial_donations: 5 records
