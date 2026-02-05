import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DonationSuccessEmail from '@/components/emails/DonationSuccessEmail';

export async function POST(req: Request) {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
        console.warn('SENDGRID_API_KEY is not configured');
        return NextResponse.json({
            success: false,
            message: 'Email service not configured'
        }, { status: 500 });
    }

    sgMail.setApiKey(sendgridApiKey);

    try {
        const { donorId, hospitalId, volumeMl } = await req.json();

        if (!donorId || !hospitalId) {
            return NextResponse.json({ error: 'Missing donorId or hospitalId' }, { status: 400 });
        }

        // 1. Fetch donor and hospital details
        const [donorRes, hospitalRes] = await Promise.all([
            supabaseAdmin.from('users').select('full_name, email').eq('id', donorId).single(),
            supabaseAdmin.from('users').select('hospital_name, full_name').eq('id', hospitalId).single()
        ]);

        const donor = donorRes.data;
        const hospital = hospitalRes.data;

        if (!donor?.email) {
            return NextResponse.json({ error: 'Donor email not found' }, { status: 404 });
        }

        const hospitalName = hospital?.hospital_name || hospital?.full_name || 'Bệnh viện';

        // 2. Render and send email
        const subject = `🩸 Chúc mừng bạn đã hiến máu thành công tại ${hospitalName}!`;
        const emailHtml = await render(
            React.createElement(DonationSuccessEmail, {
                donorName: donor.full_name || 'Người hiến máu',
                hospitalName: hospitalName,
                volumeMl: volumeMl || 350,
                pointsEarned: 100 // Giả định là 100 điểm theo logic hệ thống
            })
        );

        await sgMail.send({
            to: donor.email,
            from: 'at06012005@gmail.com',
            subject: subject,
            html: emailHtml,
        });

        return NextResponse.json({
            success: true,
            message: 'Donation congratulation email sent via SendGrid'
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
