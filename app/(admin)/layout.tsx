import React from 'react';
import { AdminSidebar } from '@/components/shared/AdminSidebar';
import AdminHeader from '@/components/shared/AdminHeader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* Header */}
                <AdminHeader />

                {/* Scrollable Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
