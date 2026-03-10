import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireRole } from '@/lib/auth-helpers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // SECURITY: Only admins or the user themselves can delete
        const { user: authUser, error: authError } = await requireRole(['admin', 'donor', 'hospital']);
        if (authError || !authUser) return authError!;

        // Resolve params for Next.js 15+ compatibility
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        // SECURITY: Non-admin users can only delete themselves
        if (authUser.role !== 'admin' && authUser.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Get all related IDs to clear transitive dependencies
        const { data: userAppointments } = await supabaseAdmin
            .from('appointments')
            .select('id')
            .or(`user_id.eq.${id}`);

        const appointmentIds = userAppointments?.map(a => a.id) || [];

        const { data: userCampaigns } = await supabaseAdmin
            .from('campaigns')
            .select('id')
            .eq('hospital_id', id);

        const campaignIds = userCampaigns?.map(c => c.id) || [];

        // 2. Clear screening logs & donation records pointing to those appointments/campaigns
        if (appointmentIds.length > 0) {
            await supabaseAdmin.from('screening_logs').delete().in('appointment_id', appointmentIds);
            await supabaseAdmin.from('donation_records').delete().in('appointment_id', appointmentIds);
        }

        if (campaignIds.length > 0) {
            await supabaseAdmin.from('screening_logs').delete().in('campaign_id', campaignIds);
            // Appointments for these campaigns must also be cleared
            await supabaseAdmin.from('appointments').delete().in('campaign_id', campaignIds);
        }

        // 3. Clear direct user-related records
        const directRelated = [
            { table: 'screening_logs', fk: 'user_id' },
            { table: 'donation_records', fk: 'donor_id' },
            { table: 'donation_records', fk: 'hospital_id' },
            { table: 'appointments', fk: 'user_id' },
            { table: 'user_redemptions', fk: 'user_id' },
            { table: 'financial_donations', fk: 'donor_id' },
            { table: 'notifications', fk: 'user_id' },
            { table: 'blood_requests', fk: 'hospital_id' },
            { table: 'campaigns', fk: 'hospital_id' }
        ];

        // Handle self-reference (verified_by) before deletion
        await supabaseAdmin
            .from('users')
            .update({ verified_by: null })
            .eq('verified_by', id);

        for (const { table, fk } of directRelated) {
            await supabaseAdmin.from(table).delete().eq(fk, id);
        }

        // 4. Finally delete from public.users table
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Final user deletion failed:', dbError);
            return NextResponse.json({
                error: 'Database error',
                message: dbError.message,
                details: dbError.details,
                code: dbError.code
            }, { status: 500 });
        }

        // 5. Delete from auth.users (Supabase Auth)
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authDeleteError) {
            console.warn('Auth delete warning (profile already deleted):', authDeleteError.message);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in DELETE user route:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
