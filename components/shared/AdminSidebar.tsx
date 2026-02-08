"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Heart,
    Hospital,
    Ticket,
    BarChart3,
    Settings,
    Megaphone
} from "lucide-react";
import { RedHopeLogo, NameRedHope } from "@/components/shared/icons";

export const AdminSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin-dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
        { href: '/admin-donor', icon: Users, label: 'Quản lý người hiến' },
        { href: '/campaign-management', icon: Megaphone, label: 'Quản lý chiến dịch' },
        { href: '/admin-hospitals', icon: Hospital, label: 'Bệnh viện' },
        { href: '/voucher-management', icon: Ticket, label: 'Quản lý Voucher' },
        { href: '/global-ana', icon: BarChart3, label: 'Phân tích hệ thống' },
        { href: '/system-setting', icon: Settings, label: 'Cài đặt hệ thống' },
    ];

    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 sticky top-0 h-screen hidden md:flex">
            <div className="flex flex-col gap-8">
                <Link href="/admin-dashboard" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
                    <div className="bg-[#0065FF] size-10 rounded-lg flex items-center justify-center text-white">
                        <RedHopeLogo className="w-24 h-24 fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <NameRedHope className="text-slate-900 dark:text-white text-lg font-bold leading-tight" />
                    </div>
                </Link>
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-[#0065FF]/10 text-[#0065FF]'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'text-[#0065FF]' : ''}`} />
                                <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.label}
                                </p>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Status Card - Visual consistency with donor sidebar if it had one, 
                but keeping it consistent with the overall theme */}
            <div className="mt-auto">
                <div className="bg-[#0065FF]/5 dark:bg-[#0065FF]/10 rounded-2xl p-4 border border-[#0065FF]/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0065FF] mb-2">Trạng thái hệ thống</p>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Hoạt động bình thường</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
