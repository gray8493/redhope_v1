-- ============================================
-- FIX RLS POLICY - Allow service to insert notifications
-- Chạy script này để fix lỗi "new row violates row-level security policy"
-- ============================================

-- Xóa policy cũ
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Tạo policy mới cho phép insert với service role key
-- Policy này cho phép backend tạo thông báo cho bất kỳ user nào
CREATE POLICY "Service can insert notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (true);

-- Hoặc nếu muốn chặt chẽ hơn, chỉ cho phép authenticated users insert
-- CREATE POLICY "Authenticated can insert notifications" 
--     ON public.notifications 
--     FOR INSERT 
--     WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Verify policies
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
WHERE tablename = 'notifications';

SELECT '✅ RLS Policy đã được cập nhật!' as status;
SELECT 'Bây giờ backend có thể tạo thông báo cho bất kỳ user nào' as info;
