"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    History,
    Search,
    Award,
    Heart,
    Settings,
    Star
} from "lucide-react";
import { RedHopeLogo, NameRedHope } from "@/components/shared/icons";

export function Sidebar() {
    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 sticky top-0 h-screen hidden md:flex">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-[#6324eb] size-10 rounded-lg flex items-center justify-center text-white">
                        <RedHopeLogo className="w-24 h-24 fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <NameRedHope className="text-slate-900 dark:text-white text-lg font-bold leading-tight" />
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <LayoutDashboard className="w-6 h-6" />
                        <p className="text-sm font-semibold">Dashboard</p>
                    </Link>
                    <Link href="/donations" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <History className="w-6 h-6" />
                        <p className="text-sm font-medium">Lịch sử hiến máu</p>
                    </Link>
                    <Link href="/requests" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Search className="w-6 h-6" />
                        <p className="text-sm font-medium">Tìm điểm hiến máu</p>
                    </Link>
                    <Link href="/rewards" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Award className="w-6 h-6" />
                        <p className="text-sm font-medium">Đổi quà</p>
                    </Link>
                    <Link href="/donate" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Heart className="w-6 h-6" />
                        <p className="text-sm font-medium">Quyên góp</p>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Settings className="w-6 h-6" />
                        <p className="text-sm font-medium">Cài đặt</p>
                    </Link>
                </nav>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900">
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm tích lũy</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">750 pts</p>
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#6324eb] h-full w-3/4"></div>
                </div>
                <p className="text-[10px] mt-2 text-slate-500">Còn 250 pts để lên hạng Platinum</p>
            </div>
        </aside>
    );
}
