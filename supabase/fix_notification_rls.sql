-- =====================================================
-- KIỂM TRA VÀ SỬA LẠI TOÀN BỘ RLS CHO BẢNG NOTIFICATIONS
-- Chạy từng phần một trong Supabase SQL Editor
-- =====================================================

-- BƯỚC 1: Kiểm tra RLS đã bật chưa
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notifications';

-- BƯỚC 2: Bật RLS nếu chưa bật
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- BƯỚC 3: Xóa TẤT CẢ policy cũ
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.notifications;
DROP POLICY IF EXISTS "Allow all insert" ON public.notifications;

-- BƯỚC 4: Tạo policy MỚI cho phép INSERT từ bất kỳ ai đã đăng nhập
CREATE POLICY "Allow authenticated insert" 
ON public.notifications 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- BƯỚC 5: Tạo policy cho SELECT (chỉ xem thông báo của mình)
CREATE POLICY "Allow select own" 
ON public.notifications 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- BƯỚC 6: Tạo policy cho UPDATE (chỉ sửa thông báo của mình)
CREATE POLICY "Allow update own" 
ON public.notifications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- BƯỚC 7: Tạo policy cho DELETE (chỉ xóa thông báo của mình)
CREATE POLICY "Allow delete own" 
ON public.notifications 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- BƯỚC 8: Kiểm tra lại các policy đã tạo
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'notifications';
