"use client";

import React, { useEffect, useMemo } from 'react';
import { HospitalSidebar } from '@/components/shared/HospitalSidebar';
import AdminHeader from '@/components/shared/AdminHeader';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const ROUTE_TITLES: Record<string, string> = {
    '/hospital-dashboard': 'Bảng điều khiển',
    '/hospital-requests': 'Yêu cầu máu',
    '/hospital-campaign': 'Chiến dịch',
    '/hospital-reports': 'Báo cáo',
    '/hospital-settings': 'Cài đặt',
};

function getHeaderTitle(pathname: string): string {
    // Exact match first
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

    // Check if pathname starts with a known route (e.g. /hospital-campaign/123)
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
        if (pathname.startsWith(route + '/')) return title;
    }

    return 'Bệnh viện & Đối tác';
}

import { SidebarProvider, useSidebar } from '@/components/providers/SidebarProvider';

function HospitalLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { isOpen } = useSidebar();

    const headerTitle = useMemo(() => getHeaderTitle(pathname), [pathname]);

    useEffect(() => {
        if (!loading && profile) {
            const isComplete = profile.hospital_address && profile.phone;
            if (!isComplete) {
                router.push('/complete-hospital-profile');
            }
        }
    }, [profile, loading, router]);

    return (
        <div className="hospital-layout-zoom flex bg-[#f6f6f8] dark:bg-[#161121] overflow-hidden h-screen">
            {/* Sidebar */}
            <HospitalSidebar />

            {/* Spacer for fixed sidebar */}
            <div
                className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0'
                    }`}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header */}
                <AdminHeader title={headerTitle} />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function HospitalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <style>{`
                .hospital-layout-zoom {
                    zoom: 0.875;
                    height: calc(100vh / 0.875);
                }
            `}</style>
            <HospitalLayoutContent>{children}</HospitalLayoutContent>
        </SidebarProvider>
    );
}

