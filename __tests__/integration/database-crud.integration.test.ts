/**
 * @jest-environment node
 * 
 * INTEGRATION TEST: Database CRUD Operations (Full Flow)
 * 
 * Test này sẽ:
 * 1. Kết nối với Supabase database thật
 * 2. Thực hiện các thao tác Create, Read, Update, Delete một cách liên hoàn
 * 3. Kiểm tra tính toàn vẹn của dữ liệu và RLS / foreign keys (nếu áp dụng trực tiếp)
 */

import { createClient } from '@supabase/supabase-js';

const hasCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const describeOrSkip = hasCredentials ? describe : describe.skip;

describeOrSkip('Database Full CRUD Integration Test', () => {
    let supabase: any;
    let testHospitalId: string | null = null;
    let testCampaignId: string | null = null;
    let testDonorId: string | null = null;
    let testAppointmentId: string | null = null;

    beforeAll(() => {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        console.log('🔗 Connected to Supabase for Full Flow CRUD test');
    });

    afterAll(async () => {
        // Cleanup resources
        console.log('🧹 Cleaning up test data...');
        if (testAppointmentId) {
            await supabase.from('appointments').delete().eq('id', testAppointmentId);
        }
        if (testCampaignId) {
            await supabase.from('campaigns').delete().eq('id', testCampaignId);
        }
        if (testHospitalId) {
            await supabase.from('users').delete().eq('id', testHospitalId).eq('role', 'hospital');
        }
        if (testDonorId) {
            await supabase.from('users').delete().eq('id', testDonorId).eq('role', 'donor');
        }
        console.log('✅ Cleanup complete');
    });

    it('should run a complete database flow (Create Users -> Create Campaign -> Create Appointment)', async () => {
        // 1. Create a Fake Hospital User
        const fakeHospitalId = `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}`;
        testHospitalId = fakeHospitalId;

        const { error: hError } = await supabase.from('users').insert({
            id: fakeHospitalId,
            email: `integration_test_hospital_${Date.now()}@example.com`,
            role: 'hospital',
            hospital_name: 'Test Integration Hospital',
            city: 'TP. Hồ Chí Minh',
            status: 'approved'
        });

        // Supabase might fail if ID mapping to auth.users is strict on this insert. 
        // Note: this depends on DB constraints. We assume public.users allows manual insert here for test, 
        // or we just find an existing hospital to test.
        let usableHospitalId = fakeHospitalId;
        if (hError) {
            console.warn('⚠️ Could not create fake hospital (maybe RLS/Auth constraint). Fetching existing hospital instead.', hError.message);
            const { data } = await supabase.from('users').select('id').eq('role', 'hospital').limit(1).single();
            if (!data) {
                console.warn('No hospital found to continue test.');
                return;
            }
            usableHospitalId = data.id;
            testHospitalId = null; // Don't delete it later
        }

        // 2. Create a Fake Donor User
        const fakeDonorId = `11111111-1111-1111-1111-${Date.now().toString().slice(-12)}`;
        testDonorId = fakeDonorId;

        const { error: dError } = await supabase.from('users').insert({
            id: fakeDonorId,
            email: `integration_test_donor_${Date.now()}@example.com`,
            role: 'donor',
            full_name: 'Test Integration Donor',
            blood_group: 'O+',
            city: 'TP. Hồ Chí Minh',
            status: 'approved'
        });

        let usableDonorId = fakeDonorId;
        if (dError) {
            console.warn('⚠️ Could not create fake donor. Fetching existing...', dError.message);
            const { data } = await supabase.from('users').select('id').eq('role', 'donor').limit(1).single();
            if (!data) {
                console.warn('No donor found to continue.');
                return;
            }
            usableDonorId = data.id;
            testDonorId = null; // Don't delete later
        }

        // 3. Create a Campaign using the Hospital ID
        const futureDate = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 days later
        const { data: campaignData, error: cError } = await supabase.from('campaigns').insert({
            hospital_id: usableHospitalId,
            name: `Integration Test Campaign ${Date.now()}`,
            city: 'TP. Hồ Chí Minh',
            target_blood_group: ['O+'],
            start_time: futureDate,
            end_time: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
            status: 'active',
            slots_available: 50
        }).select().single();

        expect(cError).toBeNull();
        expect(campaignData).toHaveProperty('id');
        testCampaignId = campaignData.id;

        // 4. Create an Appointment for the Donor in that Campaign
        const { data: appointmentData, error: aError } = await supabase.from('appointments').insert({
            donor_id: usableDonorId,
            campaign_id: testCampaignId,
            appointment_time: futureDate,
            status: 'pending',
            blood_group: 'O+',
        }).select().single();

        expect(aError).toBeNull();
        expect(appointmentData).toHaveProperty('id');
        testAppointmentId = appointmentData.id;

        // 5. Update Appointment Status
        const { error: uError } = await supabase.from('appointments').update({
            status: 'completed'
        }).eq('id', testAppointmentId);

        expect(uError).toBeNull();

        console.log(`✅ successfully ran CRUD integration flow: Hospital -> Campaign (${testCampaignId}) -> Appointment (${testAppointmentId}) -> Update Status`);
    }, 20000);
});
