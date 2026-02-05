import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CampaignAnnouncementEmail from '@/components/emails/CampaignAnnouncementEmail';
import RegistrationSuccessEmail from '@/components/emails/RegistrationSuccessEmail';
import AppointmentReminderEmail from '@/components/emails/AppointmentReminderEmail';

export async function POST(req: Request) {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        return NextResponse.json({
            error: 'Cấu hình Email (RESEND_API_KEY) chưa được thiết lập trong tệp .env.local'
        }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    try {
        let { campaignId, message, notificationType = 'announcement' } = await req.json();
        campaignId = campaignId?.trim();

        if (!campaignId) {
            return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }

        // 1. Fetch campaign details
        const { data: campaign, error: campaignError } = await supabaseAdmin
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name)')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            console.error('Error fetching campaign:', campaignError);
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const hospitalName = campaign.hospital?.hospital_name || campaign.hospital?.full_name || 'Bệnh viện';

        // 2. Fetch recipients and send emails based on notification type
        let sendResults: any[] = [];

        if (notificationType === 'new_campaign_invite') {
            // Gửi email mời đến tất cả donors phù hợp (chưa đăng ký)
            const targetBloodGroups = campaign.target_blood_group || [];
            let query = supabaseAdmin
                .from('users')
                .select('id, full_name, email, blood_group')
                .eq('role', 'donor')
                .eq('city', campaign.city);

            // Nếu có yêu cầu nhóm máu cụ thể
            if (targetBloodGroups && targetBloodGroups.length > 0 && targetBloodGroups.length < 8) {
                query = query.in('blood_group', targetBloodGroups);
            }

            const { data: potentialDonors, error: donorsError } = await query;

            if (donorsError) {
                console.error('Error fetching potential donors:', donorsError);
                return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
            }

            const users = potentialDonors || [];

            if (users.length === 0) {
                return NextResponse.json({
                    message: 'Không tìm thấy người nhận phù hợp',
                    summary: { total: 0, success: 0, failed: 0 }
                }, { status: 200 });
            }

            // Gửi email mời
            sendResults = await Promise.all(
                users.map(async (user: any) => {
                    if (!user?.email) {
                        return { success: false, email: 'N/A', error: 'No email' };
                    }

                    try {
                        const subject = `🩸 Chiến dịch hiến máu mới gần bạn!`;
                        const emailHtml = await render(
                            React.createElement(CampaignAnnouncementEmail, {
                                donorName: user.full_name || 'Người hiến máu',
                                campaignName: campaign.name,
                                hospitalName: hospitalName,
                                startTime: campaign.start_time,
                                endTime: campaign.end_time,
                                locationName: campaign.location_name,
                                message: message,
                            })
                        );

                        const { data, error } = await resend.emails.send({
                            from: 'RedHope <onboarding@resend.dev>',
                            to: [user.email],
                            subject: subject,
                            html: emailHtml,
                        });

                        if (error) return { success: false, email: user.email, error };
                        return { success: true, email: user.email, id: data?.id };
                    } catch (err: any) {
                        return { success: false, email: user.email, error: err.message };
                    }
                })
            );
        } else {
            // Gửi email cho người đã đăng ký (logic cũ)
            const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
                .from('appointments')
                .select('id, user_id, status, scheduled_time')
                .eq('campaign_id', campaignId);

            if (appointmentsError) {
                console.error('Error fetching appointments:', appointmentsError);
                return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
            }

            const rawAppointments = allAppointments?.filter((a: any) => {
                const status = a.status?.toString().toLowerCase();
                if (notificationType === 'announcement') {
                    return status !== 'cancelled';
                }
                return status === 'booked' || !status;
            }) || [];

            if (rawAppointments.length === 0) {
                return NextResponse.json({
                    message: 'Không tìm thấy người hiến máu phù hợp để gửi thông báo',
                    summary: { total: 0, success: 0, failed: 0 }
                }, { status: 200 });
            }

            // Fetch user details
            const userIds = rawAppointments.map((a: any) => a.user_id);
            const { data: users, error: usersError } = await supabaseAdmin
                .from('users')
                .select('id, full_name, email')
                .in('id', userIds);

            if (usersError) {
                console.error('Error fetching users:', usersError);
                return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
            }

            const userMap = new Map(users?.map((u: any) => [u.id, u]) || []);

            sendResults = await Promise.all(
                rawAppointments.map(async (app: any) => {
                    const donor = userMap.get(app.user_id);
                    if (!donor?.email) {
                        return { success: false, email: 'N/A', error: 'No email' };
                    }

                    try {
                        let emailHtml;
                        let subject = `📣 Thông báo từ: ${campaign.name}`;

                        switch (notificationType) {
                            case 'registration_success':
                                subject = `✅ Đăng ký thành công: ${campaign.name}`;
                                emailHtml = await render(
                                    React.createElement(RegistrationSuccessEmail, {
                                        donorName: donor.full_name || 'Người hiến máu',
                                        campaignName: campaign.name,
                                        hospitalName: hospitalName,
                                        locationName: campaign.location_name,
                                        startTime: app.scheduled_time || campaign.start_time,
                                        appointmentId: app.id,
                                        message: message,
                                    })
                                );
                                break;
                            case 'reminder_8h':
                                subject = `⏰ Nhắc nhở (8h): Lịch hiến máu ${campaign.name}`;
                                emailHtml = await render(
                                    React.createElement(AppointmentReminderEmail, {
                                        donorName: donor.full_name || 'Người hiến máu',
                                        campaignName: campaign.name,
                                        hospitalName: hospitalName,
                                        locationName: campaign.location_name,
                                        startTime: app.scheduled_time || campaign.start_time,
                                        hoursLeft: 8,
                                        message: message,
                                    })
                                );
                                break;
                            case 'reminder_4h':
                                subject = `🔋 Nhắc nhở (4h): Sắp đến giờ hiến máu tại ${hospitalName}`;
                                emailHtml = await render(
                                    React.createElement(AppointmentReminderEmail, {
                                        donorName: donor.full_name || 'Người hiến máu',
                                        campaignName: campaign.name,
                                        hospitalName: hospitalName,
                                        locationName: campaign.location_name,
                                        startTime: app.scheduled_time || campaign.start_time,
                                        hoursLeft: 4,
                                        message: message,
                                    })
                                );
                                break;
                            default: // announcement
                                emailHtml = await render(
                                    React.createElement(CampaignAnnouncementEmail, {
                                        donorName: donor.full_name || 'Người hiến máu',
                                        campaignName: campaign.name,
                                        hospitalName: hospitalName,
                                        startTime: campaign.start_time,
                                        endTime: campaign.end_time,
                                        locationName: campaign.location_name,
                                        message: message,
                                    })
                                );
                        }

                        const { data, error } = await resend.emails.send({
                            from: 'RedHope <onboarding@resend.dev>',
                            to: [donor.email],
                            subject: subject,
                            html: emailHtml,
                        });

                        if (error) return { success: false, email: donor.email, error };
                        return { success: true, email: donor.email, id: data?.id };
                    } catch (err: any) {
                        return { success: false, email: donor.email, error: err.message };
                    }
                })
            );
        }

        const successCount = sendResults.filter((r: any) => r.success).length;

        return NextResponse.json({
            message: `Processed ${sendResults.length} emails`,
            summary: {
                total: sendResults.length,
                success: successCount,
                failed: sendResults.length - successCount,
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
