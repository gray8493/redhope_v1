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

        // Pre-delete related records to avoid foreign-key constraint violations
        const relatedTablesParams = [
            { table: 'user_redemptions', fk: 'user_id' },
            { table: 'financial_donations', fk: 'user_id' },
            { table: 'notifications', fk: 'user_id' },
            { table: 'blood_requests', fk: 'hospital_id' },
            { table: 'donation_records', fk: 'donor_id' },
            { table: 'donation_records', fk: 'hospital_id' },
            { table: 'appointments', fk: 'user_id' },
            { table: 'appointments', fk: 'donor_id' },
            { table: 'appointments', fk: 'hospital_id' },
            { table: 'campaigns', fk: 'hospital_id' }
        ];

        for (const { table, fk } of relatedTablesParams) {
            const { error: fkError } = await supabaseAdmin
                .from(table)
                .delete()
                .eq(fk, id);

            if (fkError && fkError.code !== 'PGRST116' && fkError.code !== '42P01') {
                console.warn(`Could not delete from ${table} where ${fk}=${id}:`, fkError.message);
            }
        }

        // Delete from public.users table
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Delete from auth.users
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (authDeleteError) {
            // Profile already deleted, auth deletion failure is acceptable
            console.warn('Auth delete warning:', authDeleteError.message);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting user:', error?.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
