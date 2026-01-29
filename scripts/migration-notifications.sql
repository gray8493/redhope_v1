-- ============================================
-- MIGRATION: ADD NOTIFICATIONS TABLE
-- Tạo bảng notifications với đầy đủ cột cho hệ thống thông báo real-time
-- ============================================

BEGIN;

-- 1. CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Action metadata
    action_type TEXT, -- 'view_campaign', 'view_appointment', 'view_registrations', etc.
    action_url TEXT,  -- URL to navigate when clicked
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    
    -- Additional metadata (JSON)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDEXES
-- ============================================

-- Index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
    ON public.notifications(user_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
    ON public.notifications(user_id, is_read) 
    WHERE is_read = false;

-- Index for recent notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON public.notifications(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON public.notifications(user_id, created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, delete)
CREATE POLICY "Users can update own notifications" 
    ON public.notifications 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
    ON public.notifications 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Service role can insert notifications for any user
-- This allows backend to create notifications
CREATE POLICY "Service can insert notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (true);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" 
    ON public.notifications 
    FOR ALL 
    USING (public.is_admin());

-- 4. FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON public.notifications;
CREATE TRIGGER update_notifications_updated_at_trigger
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notifications_updated_at();

-- 5. ENABLE REALTIME
-- ============================================

-- Enable Realtime for notifications table
-- Note: You also need to enable this in Supabase Dashboard:
-- Database → Replication → Enable for 'notifications' table

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to get unread count for a user
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.notifications
        WHERE user_id = p_user_id AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = true
    WHERE user_id = p_user_id AND is_read = false;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- 7. VERIFICATION
-- ============================================

-- Verify table exists
SELECT 
    'notifications' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'notifications';

-- Verify indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
    AND schemaname = 'public';

-- Verify RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notifications'
    AND schemaname = 'public';

-- Success message
SELECT '✅ Notifications table created successfully!' as status;
SELECT '📝 Next steps:' as info;
SELECT '1. Go to Supabase Dashboard → Database → Replication' as step_1;
SELECT '2. Enable Realtime for "notifications" table' as step_2;
SELECT '3. Test by creating a notification via /api/test-notification' as step_3;
