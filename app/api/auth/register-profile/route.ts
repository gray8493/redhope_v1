import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const {
            userId,
            email,
            fullName,
            role,
            phone,
            dob,
            gender,
            bloodGroup,
            city,
            district,
            address
        } = await request.json();

        if (!userId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`[API] Registering profile for ${email} with role ${role}...`);

        // Insert into users table using Admin client to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert({
                id: userId,
                email,
                full_name: fullName,
                role: role || 'donor',
                phone: phone || null,
                dob: dob || null,
                gender: gender || null,
                blood_group: bloodGroup || null,
                city: city || null,
                district: district || null,
                address: address || null,
                current_points: role === 'donor' ? 0 : null
            }, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('[API] Error creating user profile:', JSON.stringify(error, null, 2));
            return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: data });
    } catch (error: any) {
        console.error('[API] Unexpected error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
