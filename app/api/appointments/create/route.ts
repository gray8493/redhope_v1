import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase (cho read operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase Admin (cho write operations - bypass RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, campaignId, scheduledTime } = body;

        if (!userId || !campaignId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, campaignId' },
                { status: 400 }
            );
        }

        // 1. Lấy thông tin campaign
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*, hospital:users!campaigns_hospital_id_fkey(hospital_name)')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // 2. Lấy thông tin donor
        const { data: donor, error: donorError } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', userId)
            .single();

        if (donorError || !donor) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3. Kiểm tra khoảng cách giữa các lần hiến máu
        // 3a. Lấy cấu hình hệ thống
        const { data: settings } = await supabase
            .from('system_settings')
            .select('donation_interval_months')
            .eq('id', 1)
            .single();

        const intervalMonths = settings?.donation_interval_months || 3;

        // 3b. Tìm lần hiến máu thành công gần nhất
        const { data: lastAppointment } = await supabase
            .from('appointments')
            .select('scheduled_time, created_at')
            .eq('user_id', userId)
            .eq('status', 'Completed')
            .order('scheduled_time', { ascending: false })
            .limit(1)
            .single();

        if (lastAppointment) {
            const lastDate = new Date(lastAppointment.scheduled_time || lastAppointment.created_at);
            const nextElligibleDate = new Date(lastDate);
            nextElligibleDate.setMonth(nextElligibleDate.getMonth() + intervalMonths);

            if (new Date() < nextElligibleDate) {
                const formattedDate = nextElligibleDate.toLocaleDateString('vi-VN');
                return NextResponse.json(
                    {
                        error: `Bạn chưa đủ điều kiện hiến máu tiếp. Theo quy định, khoảng cách giữa 2 lần hiến máu phải là ${intervalMonths} tháng. Ngày sớm nhất bạn có thể đăng ký là ${formattedDate}.`
                    },
                    { status: 403 }
                );
            }
        }



        // 4. Tạo appointment - Dùng supabaseAdmin để bypass RLS
        const { data: appointment, error: appointmentError } = await supabaseAdmin
            .from('appointments')
            .insert({
                user_id: userId,
                campaign_id: campaignId,
                scheduled_time: scheduledTime || campaign.start_time,

                status: 'Booked',
            })
            .select()
            .single();

        if (appointmentError) {
            console.error('Error creating appointment:', appointmentError);
            return NextResponse.json(
                { error: 'Failed to create appointment' },
                { status: 500 }
            );
        }

        // 5. Gửi thông báo cho donor - Dùng supabaseAdmin
        try {
            await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: userId,
                    title: '✅ Đăng ký thành công!',
                    content: `Bạn đã đăng ký tham gia chiến dịch "${campaign.name}" thành công. Vui lòng đến đúng giờ!`,
                    action_type: 'view_appointment',
                    action_url: `/appointments/${appointment.id}`,
                    metadata: {
                        appointment_id: appointment.id,
                        campaign_name: campaign.name,
                    },
                    is_read: false,
                });
        } catch (notifError) {
            console.error('Failed to send donor notification:', notifError);
        }

        // 6. Gửi thông báo cho hospital - Dùng supabaseAdmin
        try {
            await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: campaign.hospital_id,
                    title: '👤 Có người đăng ký mới!',
                    content: `${donor.full_name} vừa đăng ký tham gia chiến dịch "${campaign.name}". Nhấn để xem danh sách.`,
                    action_type: 'view_registrations',
                    action_url: `/hospital-campaign/${campaignId}?tab=registrations`,
                    metadata: {
                        campaign_id: campaignId,
                        campaign_name: campaign.name,
                        donor_name: donor.full_name,
                    },
                    is_read: false,
                });
        } catch (notifError) {
            console.error('Failed to send hospital notification:', notifError);
        }

        return NextResponse.json({
            success: true,
            appointment,
            message: 'Đăng ký thành công!'
        });

    } catch (error: any) {
        console.error('Error in appointment creation:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
