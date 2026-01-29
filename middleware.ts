import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const authToken = request.cookies.get('auth-token')?.value;
    const userRole = request.cookies.get('user-role')?.value;

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

    // Redirect to login if not authenticated
    if (isProtectedRoute && !authToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin has access to all routes
    if (userRole === 'admin') {
        return NextResponse.next();
    }

    // Protect Admin routes
    if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Protect Hospital routes
    if (isHospitalRoute && userRole !== 'hospital' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Protect Donor routes (allow donors only, but admin/hospital can also access for flexibility)
    if (isDonorRoute && !['donor', 'admin'].includes(userRole || '')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
}

// Match all protected routes
export const config = {
    matcher: [
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
