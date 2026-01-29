-- ============================================
-- FIX ALL RLS POLICIES - COMPLETE
-- Run this SQL in Supabase Dashboard -> SQL Editor
-- ============================================

-- =============================================
-- 1. USERS TABLE - Add INSERT policy
-- =============================================
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
CREATE POLICY "Users can create own profile" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. USER REDEMPTIONS TABLE - Add INSERT policy
-- =============================================
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.user_redemptions;
CREATE POLICY "Users can view own redemptions" ON public.user_redemptions 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create redemptions" ON public.user_redemptions;
CREATE POLICY "Users can create redemptions" ON public.user_redemptions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 3. VOUCHERS TABLE - Allow authenticated users to view active vouchers
-- =============================================
DROP POLICY IF EXISTS "Everyone can view active vouchers" ON public.vouchers;
CREATE POLICY "Everyone can view active vouchers" ON public.vouchers 
    FOR SELECT USING (status = 'Active');

-- Also allow viewing for join queries (user_redemptions -> vouchers)
DROP POLICY IF EXISTS "Authenticated can view all vouchers" ON public.vouchers;
CREATE POLICY "Authenticated can view all vouchers" ON public.vouchers 
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- 4. APPOINTMENTS - Allow users to create appointments
-- =============================================
DROP POLICY IF EXISTS "Users can manage own appointments" ON public.appointments;
CREATE POLICY "Users can manage own appointments" ON public.appointments 
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 5. NOTIFICATIONS - Allow users to manage own notifications
-- =============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 6. CAMPAIGNS - Allow everyone to view active campaigns
-- =============================================
DROP POLICY IF EXISTS "Everyone can view active campaigns" ON public.campaigns;
CREATE POLICY "Everyone can view active campaigns" ON public.campaigns 
    FOR SELECT USING (status = 'active');

-- Allow authenticated users to view all campaigns (for donor dashboard)
DROP POLICY IF EXISTS "Authenticated can view all campaigns" ON public.campaigns;
CREATE POLICY "Authenticated can view all campaigns" ON public.campaigns 
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- 7. BLOOD REQUESTS - Allow everyone to view
-- =============================================
DROP POLICY IF EXISTS "Everyone can view blood requests" ON public.blood_requests;
CREATE POLICY "Everyone can view blood requests" ON public.blood_requests 
    FOR SELECT USING (true);

-- =============================================
-- 8. FINANCIAL DONATIONS - Fix policies
-- =============================================
DROP POLICY IF EXISTS "Users can create donations" ON public.financial_donations;
CREATE POLICY "Users can create donations" ON public.financial_donations 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own donations" ON public.financial_donations;
CREATE POLICY "Users can view own donations" ON public.financial_donations 
    FOR SELECT USING (auth.uid() = donor_id OR status = 'completed');

DROP POLICY IF EXISTS "Users can update own pending donations" ON public.financial_donations;
CREATE POLICY "Users can update own pending donations" ON public.financial_donations 
    FOR UPDATE USING (auth.uid() = donor_id AND status = 'pending');

-- =============================================
-- 9. SCREENING LOGS - Allow users to view and create own logs
-- =============================================
DROP POLICY IF EXISTS "Users can view own screening logs" ON public.screening_logs;
CREATE POLICY "Users can view own screening logs" ON public.screening_logs 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own screening logs" ON public.screening_logs;
CREATE POLICY "Users can create own screening logs" ON public.screening_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 10. DONATION RECORDS - Fix for donor view
-- =============================================
DROP POLICY IF EXISTS "Users can view own donation history" ON public.donation_records;
CREATE POLICY "Users can view own donation history" ON public.donation_records 
    FOR SELECT USING (auth.uid() = donor_id);

-- =============================================
-- DONE! Verify policies
-- =============================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
