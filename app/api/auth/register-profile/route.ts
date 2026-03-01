import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function POST(request: Request) {
    try {
        // SECURITY: Verify authentication
        const { user: authUser, error: authError } = await getAuthenticatedUser();
        if (authError || !authUser) return authError!;

        const {
            email,
            fullName,
            phone,
            dob,
            gender,
            bloodGroup,
            city,
            district,
            address
        } = await request.json();

        // SECURITY: Use server-verified userId, not client-supplied
        const userId = authUser.id;

        if (!email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // SECURITY: Force role based on existing DB record or default to 'donor'
        // Users CANNOT self-assign roles - only admin can promote
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        const safeRole = existingUser?.role || 'donor';

        // Insert into users table using Admin client to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert({
                id: userId,
                email,
                full_name: fullName,
                role: safeRole, // SECURITY: Server-enforced role
                phone: phone || null,
                dob: dob || null,
                gender: gender || null,
                blood_group: bloodGroup || null,
                city: city || null,
                district: district || null,
                address: address || null,
                current_points: safeRole === 'donor' ? 0 : null
            }, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            if (error.message?.includes('duplicate key') || error.message?.includes('users_email_key')) {
                return NextResponse.json({ error: 'Email này đã có người đăng ký. Vui lòng sử dụng email khác.' }, { status: 409 });
            }

            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: data });
    } catch (error: any) {
        console.error('[API] Unexpected error:', error?.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
