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
    Plus,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function HospitalSidebar() {
    return (
        <>
            <aside className="fixed left-0 top-0 w-72 border-r border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col justify-between p-6 h-screen z-40 hidden md:flex transition-all duration-300">
                <div className="flex flex-col gap-10">
                    {/* Branding */}
                    <div className="flex items-center gap-4 px-2">
                        <div className="bg-med-primary size-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-med-primary/20 rotate-3 transition-transform hover:rotate-0">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white text-xl font-medical-header leading-tight">REDHOPE</span>
                            <span className="text-med-primary text-[10px] font-black uppercase tracking-[0.2em]">Cổng Y tế Pro</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-2">
                        <Link href="/hospital-requests/create">
                            <Button className="w-full h-12 bg-med-primary hover:bg-med-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-med-primary/20 group gap-3 border-b-4 border-teal-800 transition-all hover:translate-y-0.5 active:border-b-0">
                                <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-180 transition-transform duration-500">
                                    <Plus className="w-4 h-4" />
                                </div>
                                Tạo Yêu cầu Mới
                            </Button>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1.5">
                        <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Điều hành</p>
                        <SidebarLink href="/hospital-dashboard" icon={LayoutDashboard} label="Bảng điều khiển" />
                        <SidebarLink href="/hospital-requests" icon={Droplet} label="Yêu cầu máu" />
                        <SidebarLink href="/hospital-campaign" icon={Package} label="Chiến dịch" />

                        <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6 mb-2">Phân tích</p>
                        <SidebarLink href="/hospital-reports" icon={BarChart} label="Báo cáo chuyên sâu" />
                        <SidebarLink href="/hospital-notifications" icon={Bell} label="Thông báo hệ thống" />
                        <SidebarLink href="/hospital-settings" icon={Settings} label="Cấu hình đơn vị" />
                    </nav>
                </div>

                {/* Status Card */}
                <div className="glass-medical p-5 rounded-[24px] border border-med-primary/10 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 size-20 bg-med-primary/5 rounded-full blur-2xl group-hover:bg-med-primary/10 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="size-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-med-primary">
                            <div className="relative">
                                <Activity className="w-6 h-6" />
                                <div className="absolute -right-0.5 -top-0.5 size-2.5 bg-med-primary rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái Kho</p>
                            <p className="text-base font-medical-header text-slate-900 dark:text-white">Ổn định tuyệt vời</p>
                        </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Mức dự trữ</span>
                            <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-med-primary [&>div]:shadow-[0_0_10px_rgba(13,148,136,0.3)]" />
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">Đủ đáp ứng 85% nhu cầu tuần tới dựa trên AI dự báo.</p>
                    </div>
                </div>
            </aside>
            {/* Spacer for Fixed Sidebar */}
            <div className="w-72 hidden md:block shrink-0" />
        </>
    );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 px-5 py-3.5 text-slate-600 dark:text-slate-400 hover:bg-med-primary/5 dark:hover:bg-slate-800/50 hover:text-med-primary dark:hover:text-med-primary rounded-2xl transition-all font-semibold relative overflow-hidden"
        >
            <div className="size-8 rounded-lg flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-800 shadow-none group-hover:shadow-sm transition-all">
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[14px] leading-none">{label}</p>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-med-primary rounded-r-full group-hover:h-6 transition-all duration-300"></div>
        </Link>
    );
}
