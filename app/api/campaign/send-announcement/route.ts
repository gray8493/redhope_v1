import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireRole } from '@/lib/auth-helpers';
import CampaignAnnouncementEmail from '@/components/emails/CampaignAnnouncementEmail';
import RegistrationSuccessEmail from '@/components/emails/RegistrationSuccessEmail';
import AppointmentReminderEmail from '@/components/emails/AppointmentReminderEmail';

export async function POST(req: Request) {
    // SECURITY: Only hospital and admin can send announcements
    const { user: authUser, error: authError } = await requireRole(['hospital', 'admin']);
    if (authError || !authUser) return authError!;

    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
        return NextResponse.json({
            error: 'Cấu hình Email chưa được thiết lập'
        }, { status: 500 });
    }

    try {
        sgMail.setApiKey(sendgridApiKey);
        const body = await req.json();
        const { campaignId, message, notificationType = 'announcement' } = body;

        if (!campaignId) {
            return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }

        // SECURITY: If hospital, verify they own this campaign
        if (authUser.role === 'hospital') {
            const { data: campaignOwner } = await supabaseAdmin
                .from('campaigns')
                .select('hospital_id')
                .eq('id', campaignId)
                .single();

            if (!campaignOwner || campaignOwner.hospital_id !== authUser.id) {
                return NextResponse.json({ error: 'Forbidden: You do not own this campaign' }, { status: 403 });
            }
        }

        // 1. Fetch campaign details
        const { data: campaign, error: campaignError } = await supabaseAdmin
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name)')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const hospitalName = campaign.hospital?.hospital_name || campaign.hospital?.full_name || 'Bệnh viện';

        // 2. Fetch recipients and send emails based on notification type
        let sendResults: any[] = [];

        if (notificationType === 'new_campaign_invite') {
            let targetBloodGroups: string[] = [];

            if (campaign.target_blood_group) {
                if (Array.isArray(campaign.target_blood_group)) {
                    targetBloodGroups = campaign.target_blood_group;
                } else if (typeof campaign.target_blood_group === 'string') {
                    const trimmed = campaign.target_blood_group.trim();
                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                        try {
                            targetBloodGroups = JSON.parse(trimmed);
                        } catch (e) {
                            // invalid JSON
                        }
                    } else if (trimmed) {
                        targetBloodGroups = trimmed.split(',').map((s: string) => s.trim()).filter(Boolean);
                    }
                }
            }

            const cleanCity = campaign.city.replace(/^(Thành phố|Tỉnh)\s+/i, '').trim();

            let query = supabaseAdmin
                .from('users')
                .select('id, full_name, email, blood_group, city')
                .eq('role', 'donor')
                .ilike('city', `%${cleanCity}%`);

            if (targetBloodGroups.length > 0 && targetBloodGroups.length < 8) {
                query = query.in('blood_group', targetBloodGroups);
            }

            const { data: potentialDonors } = await query;
            const users = potentialDonors || [];

            sendResults = await Promise.all(
                users.map(async (user: any) => {
                    if (!user?.email) return { success: false, email: 'N/A', error: 'No email' };

                    try {
                        const subject = `✉️ Thư mời tham gia chiến dịch hiến máu: ${campaign.name}`;
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
                            from: 'RedHope <at06012005@gmail.com>',
                            subject: subject,
                            html: emailHtml,
                        });

                        return { success: true, email: user.email };
                    } catch (err: any) {
                        const errorMessage = err.response?.body?.errors?.[0]?.message || err.message;
                        return { success: false, email: user.email, error: errorMessage };
                    }
                })
            );
        } else {
            const { data: allAppointments } = await supabaseAdmin
                .from('appointments')
                .select('id, user_id, status, scheduled_time')
                .eq('campaign_id', campaignId);

            const rawAppointments = allAppointments?.filter((a: any) => {
                const status = a.status?.toString().toLowerCase();
                if (notificationType === 'announcement' || notificationType === 'registration_success') {
                    return status !== 'cancelled' && status !== 'rejected';
                }
                return (status === 'booked' || !status);
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
                        let subject = `[RedHope] Thong bao tu: ${campaign.name}`;

                        if (notificationType === 'registration_success') {
                            subject = `[RedHope] Dang ky thanh cong: ${campaign.name}`;
                            emailHtml = await render(React.createElement(RegistrationSuccessEmail, {
                                donorName: donor.full_name || 'Người hiến máu',
                                campaignName: campaign.name,
                                hospitalName,
                                locationName: campaign.location_name,
                                startTime: app.scheduled_time || campaign.start_time,
                                appointmentId: app.id,
                                message
                            }));
                        } else if (notificationType === 'reminder_8h' || notificationType === 'reminder_4h') {
                            const hours = notificationType === 'reminder_8h' ? 8 : 4;
                            subject = `[RedHope] Nhac nho (${hours}h): ${campaign.name}`;
                            emailHtml = await render(React.createElement(AppointmentReminderEmail, {
                                donorName: donor.full_name || 'Người hiến máu',
                                campaignName: campaign.name,
                                hospitalName,
                                locationName: campaign.location_name,
                                startTime: app.scheduled_time || campaign.start_time,
                                hoursLeft: hours as (4 | 8),
                                message
                            }));
                        } else {
                            emailHtml = await render(React.createElement(CampaignAnnouncementEmail, {
                                donorName: donor.full_name || 'Người hiến máu',
                                campaignName: campaign.name,
                                hospitalName,
                                startTime: campaign.start_time,
                                endTime: campaign.end_time,
                                locationName: campaign.location_name,
                                message
                            }));
                        }

                        await sgMail.send({
                            to: donor.email,
                            from: 'RedHope <at06012005@gmail.com>',
                            subject: subject,
                            html: emailHtml,
                        });

                        return { success: true, email: donor.email };
                    } catch (err: any) {
                        const errorMessage = err.response?.body?.errors?.[0]?.message || err.message;
                        return { success: false, email: donor?.email, error: errorMessage };
                    }
                })
            );
        }

        const successCount = sendResults.filter((r: any) => r.success).length;
        const failedDetails = sendResults.filter((r: any) => !r.success);

        return NextResponse.json({
            message: `Processed ${sendResults.length} emails`,
            summary: { total: sendResults.length, success: successCount, failed: sendResults.length - successCount },
            details: sendResults
        });
    } catch (error: any) {
        console.error('[API Campaign] Error:', error?.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
