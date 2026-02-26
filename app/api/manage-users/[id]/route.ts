import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Resolve params for Next.js 15+ compatibility
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        // Initialize Supabase server client to check auth
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) { }
                    },
                },
            }
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if the caller is the same user OR if they are an admin
        // We'll check the 'users' table to see if the caller has the 'admin' role
        if (user.id !== id) {
            const { data: callerProfile } = await supabaseAdmin
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (callerProfile?.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Pre-delete related records to avoid foreign-key constraint violations without ON DELETE CASCADE
        // Order is important: dependencies first (e.g. donation_records -> appointments -> campaigns)
        const relatedTablesParams = [
            { table: 'user_redemptions', fk: 'user_id' },
            { table: 'financial_donations', fk: 'user_id' },
            { table: 'notifications', fk: 'user_id' },
            { table: 'blood_requests', fk: 'hospital_id' }, // If it's a hospital
            { table: 'donation_records', fk: 'donor_id' },
            { table: 'donation_records', fk: 'hospital_id' },
            { table: 'appointments', fk: 'user_id' },
            { table: 'appointments', fk: 'donor_id' },    // Just in case it's named donor_id
            { table: 'appointments', fk: 'hospital_id' }, // If it's a hospital
            { table: 'campaigns', fk: 'hospital_id' }     // If it's a hospital
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

        // Delete from public.users table if no cascade
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Database delete error:', dbError);
            return NextResponse.json({ error: dbError.message || 'Database error' }, { status: 500 });
        }

        // Delete from auth.users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (authError) {
            console.error('Auth delete error:', authError);
            // Even if auth.users delete fails (maybe user doesn't exist in auth anymore),
            // we've already deleted the profile.
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
