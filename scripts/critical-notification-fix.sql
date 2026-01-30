-- CRITICAL FIX FOR NOTIFICATIONS RLS & SCHEMA
-- This ensures anyone can insert notifications (to notify hospitals)

-- 1. Ensure columns exist (just in case)
ALTER TABLE public.notifications 
    ADD COLUMN IF NOT EXISTS action_type TEXT,
    ADD COLUMN IF NOT EXISTS action_url TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 2. Fix RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop all existing insert policies to avoid conflicts
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

-- Create a truly public insert policy
-- This is needed because donors need to create notifications for hospitals
CREATE POLICY "Anyone can insert notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (true);

-- Ensure users can see their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Ensure users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
    ON public.notifications 
    FOR UPDATE 
    USING (auth.uid() = user_id);
