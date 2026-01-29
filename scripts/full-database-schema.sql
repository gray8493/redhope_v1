-- ============================================
-- REDHOPE FULL DATABASE SCHEMA - SUPABASE (POSTGRESQL)
-- Version: 1.1 (Clean Install Support)
-- ============================================

-- 0. INITIAL SETUP
-- Clean up old tables to ensure fresh schema and prevent column errors
DROP TABLE IF EXISTS public.user_redemptions CASCADE;
DROP TABLE IF EXISTS public.vouchers CASCADE;
DROP TABLE IF EXISTS public.donation_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.screening_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 1. USERS TABLE
CREATE TABLE public.users (
    id UUID PRIMARY KEY, -- Matches Auth UID
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('donor', 'hospital', 'admin')),
    phone VARCHAR(20),
    
    -- Profile Address
    city VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    
    -- Donor Specific
    blood_group VARCHAR(10),
    citizen_id VARCHAR(20) UNIQUE,
    dob DATE,
    gender VARCHAR(10),
    current_points INTEGER DEFAULT 0,
    
    -- Hospital Specific
    hospital_name VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
CREATE POLICY "Users can create own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view verified hospitals" ON public.users;
CREATE POLICY "Public can view verified hospitals" ON public.users FOR SELECT USING (role = 'hospital' AND is_verified = true);

DROP POLICY IF EXISTS "Admins have full access" ON public.users;
CREATE POLICY "Admins have full access" ON public.users FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

-- 2. CAMPAIGNS TABLE
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_name VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    target_units INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active campaigns" ON public.campaigns;
CREATE POLICY "Everyone can view active campaigns" ON public.campaigns FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Hospitals can manage own campaigns" ON public.campaigns;
CREATE POLICY "Hospitals can manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = hospital_id);

-- 3. BLOOD REQUESTS TABLE
CREATE TABLE public.blood_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    required_blood_group VARCHAR(10),
    required_units INTEGER DEFAULT 0,
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('Normal', 'Urgent', 'Emergency')),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view blood requests" ON public.blood_requests;
CREATE POLICY "Everyone can view blood requests" ON public.blood_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hospitals can manage own requests" ON public.blood_requests;
CREATE POLICY "Hospitals can manage own requests" ON public.blood_requests FOR ALL USING (auth.uid() = hospital_id);

-- 4. APPOINTMENTS TABLE
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    qr_code VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'Booked' CHECK (status IN ('Booked', 'Cancelled', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, campaign_id)
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own appointments" ON public.appointments;
CREATE POLICY "Users can manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hospitals can view appointments for their campaigns" ON public.appointments;
CREATE POLICY "Hospitals can view appointments for their campaigns" ON public.appointments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND hospital_id = auth.uid()));

-- 5. DONATION RECORDS TABLE
CREATE TABLE public.donation_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE UNIQUE,
    donor_id UUID REFERENCES public.users(id),
    hospital_id UUID REFERENCES public.users(id),
    volume_ml INTEGER,
    blood_group_confirmed VARCHAR(10),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

ALTER TABLE public.donation_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own donation history" ON public.donation_records;
CREATE POLICY "Users can view own donation history" ON public.donation_records FOR SELECT USING (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Hospitals can manage own records" ON public.donation_records;
CREATE POLICY "Hospitals can manage own records" ON public.donation_records FOR ALL USING (auth.uid() = hospital_id);

-- 6. VOUCHERS TABLE
CREATE TABLE public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(100) UNIQUE,
    partner_name VARCHAR(255),
    point_cost INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active vouchers" ON public.vouchers;
CREATE POLICY "Everyone can view active vouchers" ON public.vouchers FOR SELECT USING (status = 'Active');

DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;
CREATE POLICY "Admins can manage vouchers" ON public.vouchers FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

-- 7. USER REDEMPTIONS TABLE
CREATE TABLE public.user_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'Redeemed',
    UNIQUE(user_id, voucher_id)
);

ALTER TABLE public.user_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own redemptions" ON public.user_redemptions;
CREATE POLICY "Users can view own redemptions" ON public.user_redemptions FOR SELECT USING (auth.uid() = user_id);

-- 8. SCREENING LOGS (AI)
CREATE TABLE public.screening_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    campaign_id UUID REFERENCES public.campaigns(id),
    ai_result BOOLEAN,
    health_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.screening_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own screening logs" ON public.screening_logs;
CREATE POLICY "Users can view own screening logs" ON public.screening_logs FOR SELECT USING (auth.uid() = user_id);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view/update own notifications" ON public.notifications;
CREATE POLICY "Users can view/update own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);


-- 10. FINANCIAL DONATIONS TABLE (Quyên góp tiền)
CREATE TABLE public.financial_donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) CHECK (payment_method IN ('momo', 'bank_transfer')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_code VARCHAR(50) UNIQUE,
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.financial_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view completed donations" ON public.financial_donations;
CREATE POLICY "Everyone can view completed donations" ON public.financial_donations 
    FOR SELECT USING (status = 'completed');

DROP POLICY IF EXISTS "Users can create donations" ON public.financial_donations;
CREATE POLICY "Users can create donations" ON public.financial_donations 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own donations" ON public.financial_donations;
CREATE POLICY "Users can view own donations" ON public.financial_donations 
    FOR SELECT USING (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Users can update own pending donations" ON public.financial_donations;
CREATE POLICY "Users can update own pending donations" ON public.financial_donations 
    FOR UPDATE USING (auth.uid() = donor_id AND status = 'pending');

-- 11. FUNCTIONS & RPC
-- Increment points function
CREATE OR REPLACE FUNCTION increment_points(row_id UUID, count INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET current_points = COALESCE(current_points, 0) + count
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-increment points on donation completion
CREATE OR REPLACE FUNCTION handle_donation_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Update appointment status to Completed
    UPDATE public.appointments SET status = 'Completed' WHERE id = NEW.appointment_id;
    
    -- Increment donor points (default 100)
    PERFORM increment_points(NEW.donor_id, 100);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_donation_verified
AFTER INSERT ON public.donation_records
FOR EACH ROW EXECUTE FUNCTION handle_donation_completion();
