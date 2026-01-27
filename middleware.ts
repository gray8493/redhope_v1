import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const authCookie = request.cookies.get('auth-token');
    const userRole = request.cookies.get('user-role')?.value;

    const protectedPaths = [
        '/admin-dashboard', '/admin-donor', '/admin-hospitals', '/campaign-management', '/voucher-management', '/global-ana', '/system-setting',
        '/hospital-dashboard', '/hospital-campaign', '/hospital-reports', '/hospital-settings',
        '/dashboard', '/profile'
    ];
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected && !authCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin có quyền vào mọi trang
    if (userRole === 'admin') {
        return NextResponse.next();
    }

    // Bảo vệ trang Admin
    const isAdminPath = [
        '/admin-dashboard', '/admin-donor', '/admin-hospitals', '/campaign-management', '/voucher-management', '/global-ana', '/system-setting'
    ].some(path => pathname.startsWith(path));

    if (isAdminPath && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Bảo vệ trang Hospital
    const isHospitalPath = [
        '/hospital-dashboard', '/hospital-campaign', '/hospital-reports', '/hospital-settings'
    ].some(path => pathname.startsWith(path));

    if (isHospitalPath && userRole !== 'hospital') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Bảo vệ trang Donor (giả sử là dashboard hoặc profile)
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/donor')) && userRole !== 'donor') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
}

// Chỉ chạy middleware cho các đường dẫn cụ thể
export const config = {
    matcher: [
        '/admin/:path*',
        '/hospital/:path*',
        '/dashboard/:path*',
        '/rewards/:path*',
        '/donations/:path*',
    ],
};
