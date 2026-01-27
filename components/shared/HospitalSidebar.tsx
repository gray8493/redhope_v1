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
        <>
            <aside className="fixed left-0 top-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 h-screen z-40 hidden md:flex transition-all duration-300">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-[#6324eb] size-10 rounded-lg flex items-center justify-center text-white shadow-md shadow-[#6324eb]/20">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Bệnh viện</span>
                            <span className="text-slate-500 text-xs font-semibold">Cổng Nhân viên</span>
                        </div>
                    </div>

                    <div className="px-2">
                        <Link href="/hospital-requests/create" className="flex items-center justify-center gap-2 w-full bg-[#6324eb] hover:bg-[#501ac2] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#6324eb]/20 active:scale-[0.98] group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Tạo Yêu cầu
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link href="/hospital-dashboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#6324eb] dark:hover:text-[#6324eb] rounded-xl transition-all font-medium">
                            <LayoutDashboard className="w-5 h-5" />
                            <p className="text-sm">Bảng điều khiển</p>
                        </Link>
                        <Link href="/hospital-requests" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#6324eb] dark:hover:text-[#6324eb] rounded-xl transition-all font-medium">
                            <Droplet className="w-5 h-5" />
                            <p className="text-sm">Yêu cầu máu</p>
                        </Link>
                        <Link href="/hospital-campaign" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#6324eb] dark:hover:text-[#6324eb] rounded-xl transition-all font-medium">
                            <Package className="w-5 h-5" />
                            <p className="text-sm">Chiến dịch</p>
                        </Link>
                        <Link href="/hospital-reports" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#6324eb] dark:hover:text-[#6324eb] rounded-xl transition-all font-medium">
                            <BarChart className="w-5 h-5" />
                            <p className="text-sm">Báo cáo</p>
                        </Link>
                        <Link href="/hospital-settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#6324eb] dark:hover:text-[#6324eb] rounded-xl transition-all font-medium">
                            <Settings className="w-5 h-5" />
                            <p className="text-sm">Cài đặt</p>
                        </Link>
                    </nav>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Trạng thái Kho</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">Ổn định</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500">Đủ đáp ứng 85% nhu cầu tuần tới</p>
                </div>
            </aside>
            {/* Spacer for Fixed Sidebar */}
            <div className="w-64 hidden md:block shrink-0" />
        </>
    );
}
