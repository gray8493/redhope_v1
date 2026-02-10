"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    X,
    LayoutDashboard,
    History,
    Search,
    Award,
    Heart,
    Settings,
    Droplet,
    Package,
    BarChart,
    Building2,
    Plus,
    Users,
    Hospital,
    Ticket,
    BarChart3,
    Megaphone
} from "lucide-react";
import { RedHopeLogo, NameRedHope } from "@/components/shared/icons";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    // Determine the environment based on pathname
    const isAdminPath = pathname.startsWith('/admin-') ||
        pathname.startsWith('/campaign-management') ||
        pathname.startsWith('/voucher-management') ||
        pathname.startsWith('/global-ana') ||
        pathname.startsWith('/system-setting');

    const isHospitalPath = pathname.startsWith('/hospital-');

    // Determine userRole for menu display
    // Current role of the logged in user
    const actualRole = user?.role || 'donor';

    // Default display role is the user's actual role
    let displayRole = actualRole;

    // Context-based overrides: 
    // If user is on a specific module's path, show that module's menu
    if (isAdminPath) displayRole = 'admin';
    else if (isHospitalPath) displayRole = 'hospital';
    else if (pathname === '/' || pathname.startsWith('/requests') || pathname.startsWith('/dashboard') || pathname.startsWith('/donations')) {
        displayRole = 'donor';
    }

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-mobile-menu', handleOpen);
        return () => window.removeEventListener('open-mobile-menu', handleOpen);
    }, []);

    // Close on navigation
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const donorItems = [
        { href: '/requests', icon: Search, label: 'Yêu cầu hiến máu' },
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/donations', icon: History, label: 'Lịch sử hiến máu' },
        { href: '/rewards', icon: Award, label: 'Đổi quà' },
        { href: '/donate', icon: Heart, label: 'Quyên góp' },
        { href: '/settings', icon: Settings, label: 'Cài đặt' },
    ];

    const hospitalItems = [
        { href: '/hospital-dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
        { href: '/hospital-requests', icon: Droplet, label: 'Yêu cầu máu' },
        { href: '/hospital-campaign', icon: Package, label: 'Chiến dịch' },
        { href: '/hospital-reports', icon: BarChart, label: 'Báo cáo' },
        { href: '/hospital-settings', icon: Settings, label: 'Cài đặt' },
    ];

    const adminItems = [
        { href: '/admin-dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
        { href: '/admin-donor', icon: Users, label: 'Quản lý người hiến' },
        { href: '/campaign-management', icon: Megaphone, label: 'Quản lý chiến dịch' },
        { href: '/admin-hospitals', icon: Hospital, label: 'Bệnh viện' },
        { href: '/voucher-management', icon: Ticket, label: 'Quản lý Voucher' },
        { href: '/global-ana', icon: BarChart3, label: 'Phân tích hệ thống' },
        { href: '/system-setting', icon: Settings, label: 'Cài đặt hệ thống' },
    ];

    const landingItems = [
        { href: '/', icon: LayoutDashboard, label: 'Trang chủ' },
        { href: '/login', icon: Users, label: 'Đăng nhập' },
        { href: '/register', icon: Heart, label: 'Tạo tài khỏan mới' },
    ];

    const isLandingPage = pathname === '/';

    // Determine menu items
    let menuItems = displayRole === 'admin' ? adminItems : displayRole === 'hospital' ? hospitalItems : donorItems;

    // If not logged in OR on landing page (and not in a specific sub-path), show landing items
    if (!user || (isLandingPage && !isAdminPath && !isHospitalPath)) {
        menuItems = landingItems;
    }

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Drawer */}
            <aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-[#120e1b] z-[101] shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-[#0065FF] size-8 rounded-lg flex items-center justify-center text-white">
                            <RedHopeLogo className="w-5 h-5 fill-current" />
                        </div>
                        <NameRedHope className="text-slate-900 dark:text-white text-base font-bold" />
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                    {displayRole === 'hospital' && (
                        <Link href="/hospital-requests/create" className="px-2">
                            <Button className="w-full h-12 bg-[#0065FF] hover:bg-[#0052cc] text-white rounded-xl font-bold gap-2">
                                <Plus className="w-5 h-5" />
                                Tạo Yêu cầu Máu
                            </Button>
                        </Link>
                    )}

                    <nav className="flex flex-col gap-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm",
                                        isActive
                                            ? "bg-[#0065FF]/10 text-[#0065FF]"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-[#0065FF]" : "opacity-70")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    {user ? (
                        <div className="bg-slate-50 dark:bg-[#1c162e] rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vai trò hiện tại</p>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                                    {actualRole === 'admin' ? 'Hệ thống Quản trị' : actualRole === 'hospital' ? 'Nhân viên Y tế' : 'Người hiến máu'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800 text-center">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Chào mừng đến với RedHope</p>
                            <p className="text-[10px] text-blue-500/70 mt-1">Hệ thống hiến máu thông minh</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
