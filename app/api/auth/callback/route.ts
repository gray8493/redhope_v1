import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // SECURITY: Validate 'next' parameter to prevent open redirect
    const rawNext = searchParams.get('next') ?? '/'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: '', ...options })
                        } catch (e) { }
                    },
                },
            }
        )
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .maybeSingle()

            let role = userData?.role || 'donor';

            if (!userData) {
                await supabase.from('users').insert({
                    id: data.user.id,
                    email: data.user.email,
                    full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Unknown User',
                    role: 'donor',
                    current_points: 0
                })
                role = 'donor';
            }

            let redirectPath = next;

            if (next === '/') {
                switch (role) {
                    case 'admin':
                        redirectPath = '/admin-dashboard';
                        break;
                    case 'hospital':
                        redirectPath = '/hospital-dashboard';
                        break;
                    default:
                        redirectPath = '/requests';
                }
            }

            const response = NextResponse.redirect(`${origin}${redirectPath}`)

            // SECURITY: Removed insecure legacy cookies (auth-token, user-role)
            // Supabase SSR handles session cookies automatically via the cookie handlers above.

            return response;
        }
    }

    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
