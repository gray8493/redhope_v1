"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect directly to create form
export default function HospitalRequestsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/hospital-requests/create');
    }, [router]);

    return (
        <div className="flex-1 flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="loading w-8 h-8 text-[#0065FF] mx-auto mb-4"></div>
                <p className="text-slate-500">Đang chuyển hướng...</p>
            </div>
        </div>
    );
}
