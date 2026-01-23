"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Droplet,
    Package,
    BarChart,
    Settings,
    Building2,
    Activity,
    Plus
} from "lucide-react";

export function HospitalSidebar() {
    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 sticky top-0 h-screen hidden md:flex">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-[#6324eb] size-10 rounded-lg flex items-center justify-center text-white">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Bệnh viện</span>
                        <span className="text-slate-500 text-xs">Cổng Nhân viên</span>
                    </div>
                </div>

                <div className="px-2">
                    <Link href="/hospital/requests/create" className="flex items-center justify-center gap-2 w-full bg-[#6324eb] hover:bg-[#501ac2] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#6324eb]/20 active:scale-[0.98]">
                        <Plus className="w-5 h-5" />
                        Tạo Yêu cầu
                    </Link>
                </div>

                <nav className="flex flex-col gap-2">
                    <Link href="/hospital" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <LayoutDashboard className="w-6 h-6" />
                        <p className="text-sm font-medium">Bảng điều khiển</p>
                    </Link>
                    <Link href="/hospital/requests/create" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Droplet className="w-6 h-6" />
                        <p className="text-sm font-medium">Yêu cầu máu</p>
                    </Link>
                    <Link href="/hospital/campaign" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Package className="w-6 h-6" />
                        <p className="text-sm font-medium">Chiến dịch</p>
                    </Link>
                    <Link href="/hospital/reports" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <BarChart className="w-6 h-6" />
                        <p className="text-sm font-medium">Báo cáo</p>
                    </Link>
                    <Link href="/hospital/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Settings className="w-6 h-6" />
                        <p className="text-sm font-medium">Cài đặt</p>
                    </Link>
                </nav>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái Kho</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">Ổn định</p>
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[85%]"></div>
                </div>
                <p className="text-[10px] mt-2 text-slate-500">Đủ đáp ứng 85% nhu cầu tuần tới</p>
            </div>
        </aside>
    );
}
