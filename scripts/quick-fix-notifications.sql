-- ============================================
-- QUICK FIX: Create notifications table
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- Kiểm tra xem bảng đã tồn tại chưa
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        -- Tạo bảng notifications
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            action_type TEXT,
            action_url TEXT,
            is_read BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Tạo indexes
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
        CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

        -- Bật RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

        -- Tạo policies
        CREATE POLICY "Users can read own notifications" 
            ON public.notifications FOR SELECT 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update own notifications" 
            ON public.notifications FOR UPDATE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete own notifications" 
            ON public.notifications FOR DELETE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Service can insert notifications" 
            ON public.notifications FOR INSERT 
            WITH CHECK (true);

        RAISE NOTICE '✅ Bảng notifications đã được tạo thành công!';
    ELSE
        -- Nếu bảng đã tồn tại, thêm các cột thiếu
        ALTER TABLE public.notifications 
            ADD COLUMN IF NOT EXISTS action_type TEXT,
            ADD COLUMN IF NOT EXISTS action_url TEXT,
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

        RAISE NOTICE '✅ Đã thêm các cột thiếu vào bảng notifications!';
    END IF;
END $$;

-- Bật Realtime (nếu chưa có)
DO $$
BEGIN
    -- Thử thêm vào publication, bỏ qua nếu đã có
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Realtime đã được bật cho bảng notifications';
END $$;

-- Verify
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'notifications'
ORDER BY ordinal_position;

SELECT '✅ HOÀN THÀNH! Bảng notifications đã sẵn sàng.' as status;
