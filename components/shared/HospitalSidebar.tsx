"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Droplet,
    Package,
    BarChart,
    Settings,
    Building2,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/providers/SidebarProvider";

export function HospitalSidebar() {
    const [isStaffMode, setIsStaffMode] = useState(false);
    const { isOpen } = useSidebar();

    useEffect(() => {
        // Check standard localStorage key
        if (typeof window !== 'undefined') {
            setIsStaffMode(localStorage.getItem('hospital_staff_mode') === 'true');
        }
    }, []);

    return (
        <>
            {/* Desktop Sidebar - Fixed. Mobile drawer is handled by MobileSidebar in root layout */}
            <aside className={`fixed left-0 top-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 h-screen z-40 hidden md:flex transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-[#0065FF] size-10 rounded-lg flex items-center justify-center text-white shadow-md shadow-[#0065FF]/20">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white text-base font-bold leading-tight">Bệnh viện</span>
                            <span className="text-slate-500 text-[10px] font-semibold">Cổng Nhân viên</span>
                        </div>
                    </div>

                    {!isStaffMode && (
                        <div className="px-2">
                            <Link href="/hospital-requests/create">
                                <Button className="w-full h-10 bg-[#0065FF] hover:bg-[#0052cc] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0065FF]/20 group gap-2">
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Tạo Yêu cầu
                                </Button>
                            </Link>
                        </div>
                    )}

                    <nav className="flex flex-col gap-2">
                        {!isStaffMode && (
                            <>
                                <Link href="/hospital-dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#0065FF] dark:hover:text-[#0065FF] rounded-xl transition-all font-medium">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <p className="text-[13px]">Bảng điều khiển</p>
                                </Link>
                                <Link href="/hospital-requests" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#0065FF] dark:hover:text-[#0065FF] rounded-xl transition-all font-medium">
                                    <Droplet className="w-5 h-5" />
                                    <p className="text-[13px]">Yêu cầu máu</p>
                                </Link>
                            </>
                        )}
                        <Link href="/hospital-campaign" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#0065FF] dark:hover:text-[#0065FF] rounded-xl transition-all font-medium">
                            <Package className="w-5 h-5" />
                            <p className="text-[13px]">Chiến dịch</p>
                        </Link>
                        {!isStaffMode && (
                            <Link href="/hospital-reports" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#0065FF] dark:hover:text-[#0065FF] rounded-xl transition-all font-medium">
                                <BarChart className="w-5 h-5" />
                                <p className="text-[13px]">Báo cáo</p>
                            </Link>
                        )}

                        <Link href="/hospital-settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#0065FF] dark:hover:text-[#0065FF] rounded-xl transition-all font-medium">
                            <Settings className="w-5 h-5" />
                            <p className="text-[13px]">Cài đặt</p>
                        </Link>
                    </nav>
                </div>
            </aside>

        </>
    );
}
