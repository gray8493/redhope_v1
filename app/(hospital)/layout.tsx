"use client";

import React, { useEffect } from 'react';
import { HospitalSidebar } from '@/components/shared/HospitalSidebar';
import AdminHeader from '@/components/shared/AdminHeader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function HospitalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && profile) {
            const isComplete = profile.hospital_address && profile.phone;
            if (!isComplete) {
                router.push('/complete-hospital-profile');
            }
        }
    }, [profile, loading, router]);

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
