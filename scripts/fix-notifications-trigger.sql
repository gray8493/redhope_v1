-- ============================================
-- FIX: NOTIFICATIONS TABLE TRIGGER ERROR
-- Giải quyết lỗi: record "new" has no field "updated_at"
-- ============================================

BEGIN;

-- 1. Đảm bảo cột updated_at tồn tại
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added missing column updated_at to notifications table';
    END IF;
END $$;

-- 2. Cập nhật lại function trigger để đảm bảo nó đồng bộ với table
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tạo lại trigger để làm mới liên kết
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON public.notifications;
CREATE TRIGGER update_notifications_updated_at_trigger
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notifications_updated_at();

-- 4. Thông báo hoàn thành
COMMIT;

SELECT '✅ Notifications table repaired successfully!' as status;
