import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define route groups
    const adminRoutes = [
        '/admin-dashboard',
        '/admin-donor',
        '/admin-hospitals',
        '/campaign-management',
        '/voucher-management',
        '/global-ana',
        '/system-setting'
    ];

    const hospitalRoutes = [
        '/hospital-dashboard',
        '/hospital-campaign',
        '/hospital-reports',
        '/hospital-requests',
        '/hospital-settings',
        '/support'
    ];

    const donorRoutes = [
        '/dashboard',
        '/donate',
        '/donations',
        '/rewards',
        '/requests',
        '/notifications',
        '/screening',
        '/settings'
    ];

    // Check if current path matches any protected route
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isHospitalRoute = hospitalRoutes.some(route => pathname.startsWith(route));
    const isDonorRoute = donorRoutes.some(route => pathname.startsWith(route));
    const isProtectedRoute = isAdminRoute || isHospitalRoute || isDonorRoute;
    const isAuthPage = ['/login', '/register'].includes(pathname);

    // Create Supabase server client with cookie handling
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // SECURE: Verify user via Supabase JWT (server-side, NOT client cookie)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // If user is authenticated, fetch role from DB (trusted source)
    let userRole: string | null = null;
    if (user && !userError) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        userRole = profile?.role || user.user_metadata?.role || 'donor';
    }

    // 1. Redirect to dashboard if already logged in and trying to access auth pages
    if (isAuthPage && user && userRole) {
        let redirectPath = '/requests';
        if (userRole === 'admin') redirectPath = '/admin-dashboard';
        else if (userRole === 'hospital') redirectPath = '/hospital-dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // 2. Redirect to login if not authenticated and accessing protected route
    if (isProtectedRoute && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Role-based access control (using server-verified role)
    if (user && userRole) {
        // Admin has access to all routes
        if (userRole === 'admin') {
            return response;
        }

        // Protect Admin routes
        if (isAdminRoute && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Protect Hospital routes
        if (isHospitalRoute && userRole !== 'hospital' && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Protect Donor routes
        if (isDonorRoute && !['donor', 'admin'].includes(userRole)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    return response;
}

// Match all protected routes + auth pages
export const config = {
    matcher: [
        // Auth pages (for redirect if logged in)
        '/login',
        '/register',
        // Admin routes
        '/admin-dashboard/:path*',
        '/admin-donor/:path*',
        '/admin-hospitals/:path*',
        '/campaign-management/:path*',
        '/voucher-management/:path*',
        '/global-ana/:path*',
        '/system-setting/:path*',
        // Hospital routes
        '/hospital-dashboard/:path*',
        '/hospital-campaign/:path*',
        '/hospital-reports/:path*',
        '/hospital-requests/:path*',
        '/hospital-settings/:path*',
        '/support/:path*',
        // Donor routes
        '/dashboard/:path*',
        '/donate/:path*',
        '/donations/:path*',
        '/rewards/:path*',
        '/requests/:path*',
        '/notifications/:path*',
        '/screening/:path*',
        '/settings/:path*',
    ],
};
