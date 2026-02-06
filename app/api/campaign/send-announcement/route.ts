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

    try {
        sgMail.setApiKey(sendgridApiKey);
        const body = await req.json();
        const { campaignId, message, notificationType = 'announcement' } = body;
        console.log(`[API Campaign] Sending ${notificationType} for campaign ${campaignId}`);

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
            console.error('[API Campaign] Error fetching campaign:', campaignError);
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
            console.log(`[API Campaign] Found ${users.length} potential donors for invite`);

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
                            from: 'RedHope <at06012005@gmail.com>',
                            subject: subject,
                            html: emailHtml,
                        });

                        return { success: true, email: user.email };
                    } catch (err: any) {
                        console.error(`[Email Error] Failed invite for ${user?.email}:`, err.response?.body || err.message);
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

            console.log(`[API Campaign] Found ${allAppointments?.length || 0} total appointments for manual trigger`);

            const rawAppointments = allAppointments?.filter((a: any) => {
                const status = a.status?.toString().toLowerCase();
                // Relax filter for manual triggers to allow testing on completed/booked records
                // Only exclude 'cancelled'
                if (notificationType === 'announcement' || notificationType === 'registration_success') {
                    return status !== 'cancelled' && status !== 'rejected';
                }
                // Reminders are usually for upcoming ones
                return (status === 'booked' || !status);
            }) || [];

            console.log(`[API Campaign] Filtered to ${rawAppointments.length} eligible recipients (Type: ${notificationType})`);

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
                            // Default: announcement
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
                        console.error(`[Email Error] Failed for ${donor?.email} (Type: ${notificationType}):`, err.response?.body || err);
                        const errorMessage = err.response?.body?.errors?.[0]?.message || err.message;
                        return { success: false, email: donor?.email, error: errorMessage };
                    }
                })
            );
        }

        const successCount = sendResults.filter((r: any) => r.success).length;
        const failedDetails = sendResults.filter((r: any) => !r.success);

        if (failedDetails.length > 0) {
            console.error('[API Campaign] Some emails failed:', failedDetails);
        }

        return NextResponse.json({
            message: `Processed ${sendResults.length} emails`,
            summary: { total: sendResults.length, success: successCount, failed: sendResults.length - successCount },
            details: sendResults
        });
    } catch (error: any) {
        console.error('[API Campaign] Global error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
