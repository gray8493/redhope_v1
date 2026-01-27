import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/'

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
            // Check if user already exists in our 'users' table
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single()

            let role = userData?.role || 'donor';

            if (!userData) {
                // Create default donor profile if first time login via OAuth
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

            // If next is just the root '/', determine the actual dashboard based on role
            if (next === '/') {
                switch (role) {
                    case 'admin':
                        redirectPath = '/admin-dashboard';
                        break;
                    case 'hospital':
                        redirectPath = '/hospital-dashboard';
                        break;
                    default:
                        redirectPath = '/dashboard';
                }
            }

            const response = NextResponse.redirect(`${origin}${redirectPath}`)

            // Set legacy cookies for middleware compatibility
            response.cookies.set('auth-token', data.session?.access_token || '', {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
            response.cookies.set('user-role', role, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })

            return response;
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
