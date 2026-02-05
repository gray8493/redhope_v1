import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CampaignAnnouncementEmail from '@/components/emails/CampaignAnnouncementEmail';
import RegistrationSuccessEmail from '@/components/emails/RegistrationSuccessEmail';
import AppointmentReminderEmail from '@/components/emails/AppointmentReminderEmail';

export async function POST(req: Request) {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
        return NextResponse.json({
            error: 'Cấu hình Email (SENDGRID_API_KEY) chưa được thiết lập'
        }, { status: 500 });
    }

    sgMail.setApiKey(sendgridApiKey);

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
            const targetBloodGroups = campaign.target_blood_group || [];
            let query = supabaseAdmin
                .from('users')
                .select('id, full_name, email, blood_group')
                .eq('role', 'donor')
                .eq('city', campaign.city);

            if (targetBloodGroups && targetBloodGroups.length > 0 && targetBloodGroups.length < 8) {
                query = query.in('blood_group', targetBloodGroups);
            }

            const { data: potentialDonors, error: donorsError } = await query;
            const users = potentialDonors || [];

            sendResults = await Promise.all(
                users.map(async (user: any) => {
                    if (!user?.email) return { success: false, email: 'N/A', error: 'No email' };

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

                        await sgMail.send({
                            to: user.email,
                            from: 'at06012005@gmail.com',
                            subject: subject,
                            html: emailHtml,
                        });

                        return { success: true, email: user.email };
                    } catch (err: any) {
                        console.error(`SendGrid Error for ${user?.email}:`, err.response?.body || err.message);
                        const errorMessage = err.response?.body?.errors?.[0]?.message || err.message;
                        return { success: false, email: user.email, error: errorMessage };
                    }
                })
            );
        } else {
            const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
                .from('appointments')
                .select('id, user_id, status, scheduled_time')
                .eq('campaign_id', campaignId);

            const rawAppointments = allAppointments?.filter((a: any) => {
                const status = a.status?.toString().toLowerCase();
                return notificationType === 'announcement' ? status !== 'cancelled' : (status === 'booked' || !status);
            }) || [];

            const userIds = rawAppointments.map((a: any) => a.user_id);
            const { data: users } = await supabaseAdmin.from('users').select('id, full_name, email').in('id', userIds);
            const userMap = new Map(users?.map((u: any) => [u.id, u]) || []);

            sendResults = await Promise.all(
                rawAppointments.map(async (app: any) => {
                    const donor = userMap.get(app.user_id);
                    if (!donor?.email) return { success: false, email: 'N/A', error: 'No email' };

                    try {
                        let emailHtml;
                        let subject = `📣 Thông báo từ: ${campaign.name}`;

                        // Rendering logic (same as before but using sgMail)
                        // ... (omitted for brevity in explanation but included in code)
                        if (notificationType === 'registration_success') {
                            subject = `✅ Đăng ký thành công: ${campaign.name}`;
                            emailHtml = await render(React.createElement(RegistrationSuccessEmail, { donorName: donor.full_name || 'Người hiến máu', campaignName: campaign.name, hospitalName, locationName: campaign.location_name, startTime: app.scheduled_time || campaign.start_time, appointmentId: app.id, message }));
                        } else {
                            emailHtml = await render(React.createElement(CampaignAnnouncementEmail, { donorName: donor.full_name || 'Người hiến máu', campaignName: campaign.name, hospitalName, startTime: campaign.start_time, endTime: campaign.end_time, locationName: campaign.location_name, message }));
                        }

                        await sgMail.send({
                            to: donor.email,
                            from: 'RedHope <at06012005@gmail.com>',
                            subject: subject,
                            html: emailHtml,
                        });

                        return { success: true, email: donor.email };
                    } catch (err: any) {
                        console.error(`SendGrid Error for ${donor?.email}:`, err.response?.body || err.message);
                        const errorMessage = err.response?.body?.errors?.[0]?.message || err.message;
                        return { success: false, email: donor?.email, error: errorMessage };
                    }
                })
            );
        }

        const successCount = sendResults.filter((r: any) => r.success).length;
        return NextResponse.json({
            message: `Processed ${sendResults.length} emails`,
            summary: { total: sendResults.length, success: successCount, failed: sendResults.length - successCount },
            details: sendResults
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
