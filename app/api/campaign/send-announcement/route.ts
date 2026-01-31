import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CampaignAnnouncementEmail from '@/components/emails/CampaignAnnouncementEmail';

export async function POST(req: Request) {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        return NextResponse.json({
            error: 'Cấu hình Email (RESEND_API_KEY) chưa được thiết lập trong tệp .env.local'
        }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    try {
        let { campaignId, message } = await req.json();
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

        console.log('[API] Campaign metadata:', campaign ? 'Found' : 'Not Found', campaignId);

        if (campaignError || !campaign) {
            console.error('Error fetching campaign:', campaignError);
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // 2. Fetch all donor registrations for this campaign
        console.log('[API] Fetching all appointments for campaign:', campaignId);
        const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
            .from('appointments')
            .select('id, user_id, status')
            .eq('campaign_id', campaignId);

        if (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
            return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
        }

        console.log('[API] Total appointments found (all statuses):', allAppointments?.length || 0);

        const rawAppointments = allAppointments?.filter(a =>
            a.status?.toString().toLowerCase() === 'booked'
        ) || [];

        console.log('[API] Final "Booked" appointments for processing:', rawAppointments.length);

        if (rawAppointments.length === 0) {
            console.log('[API] No matching appointments to notify');
            return NextResponse.json({
                message: 'No registered donors to notify',
                summary: { total: 0, success: 0, failed: 0 }
            }, { status: 200 });
        }

        // 3. Fetch user details for these appointments
        const userIds = rawAppointments.map(a => a.user_id);
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email')
            .in('id', userIds);

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
        }

        const userMap = new Map(users?.map(u => [u.id, u]) || []);

        // 4. Send emails
        const sendResults = await Promise.all(
            rawAppointments.map(async (app: any) => {
                const donor = userMap.get(app.user_id);
                if (!donor?.email) {
                    return { success: false, email: 'N/A', error: 'No email' };
                }

                console.log(`[API] Attempting to send email to: ${donor.email}`);
                try {
                    const emailHtml = await render(
                        CampaignAnnouncementEmail({
                            donorName: donor.full_name || 'Người hiến máu',
                            campaignName: campaign.name,
                            hospitalName: campaign.hospital?.hospital_name || campaign.hospital?.full_name || 'Bệnh viện',
                            startTime: campaign.start_time,
                            endTime: campaign.end_time,
                            locationName: campaign.location_name,
                            message: message,
                        })
                    );

                    const { data, error } = await resend.emails.send({
                        from: 'RedHope <onboarding@resend.dev>',
                        to: [donor.email],
                        subject: `📣 Thông báo từ: ${campaign.name}`,
                        html: emailHtml,
                    });

                    if (error) {
                        console.error(`[API] Resend error for ${donor.email}:`, error);
                        return { success: false, email: donor.email, error };
                    }
                    console.log(`[API] Successfully sent to ${donor.email}. ID: ${data?.id}`);
                    return { success: true, email: donor.email, id: data?.id };
                } catch (err: any) {
                    console.error(`[API] Unexpected error sending to ${donor.email}:`, err);
                    return { success: false, email: donor.email, error: err.message };
                }
            })
        );

        const successCount = sendResults.filter(r => r.success).length;
        const failCount = sendResults.length - successCount;

        return NextResponse.json({
            message: `Processed ${sendResults.length} emails`,
            summary: {
                total: sendResults.length,
                success: successCount,
                failed: failCount,
            },
            details: sendResults,
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
