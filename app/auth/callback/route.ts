import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const role = (user.user_metadata?.role || 'donor').toLowerCase();

                if (role === 'admin') return NextResponse.redirect(`${origin}/admin`);
                if (role === 'hospital') return NextResponse.redirect(`${origin}/hospital`);

                // Kiểm tra profile cho Donor
                const { data: profile } = await supabase
                    .from('users')
                    .select('blood_group, city, full_name')
                    .eq('id', user.id)
                    .single();

                if (!profile?.blood_group || !profile?.city) {
                    return NextResponse.redirect(`${origin}/complete-profile`);
                } else if (!profile?.full_name) {
                    return NextResponse.redirect(`${origin}/complete-profile/verification`);
                }

                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Trả về trang login nếu có lỗi
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
