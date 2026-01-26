"use client";

import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
    const { profile } = useAuth();
    const firstName = profile?.full_name?.split(' ')[0] || "người bạn";

    return (
        <div className="flex flex-col gap-6 ">
            <div className="flex flex-wrap justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Chào {firstName}!</h1>
                    <p className="text-slate-500 text-sm font-medium">Hôm nay là một ngày tuyệt vời để chia sẻ sự sống.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trạng thái</p>
                        <div className="flex items-center gap-2">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{profile?.role === 'donor' ? 'Đủ điều kiện hiến máu' : 'Đủ điều kiện nhận máu'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
