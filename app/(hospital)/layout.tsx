import React from 'react';
import { HospitalSidebar } from '@/components/shared/HospitalSidebar';
import AdminHeader from '@/components/shared/AdminHeader';

export default function HospitalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#f6f6f8] dark:bg-[#161121] overflow-hidden">
            {/* Sidebar */}
            <HospitalSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header */}
                <AdminHeader title="Bệnh viện & Đối tác" />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
