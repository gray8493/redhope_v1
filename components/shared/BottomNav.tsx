"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Search,
    LayoutDashboard,
    History,
    Award,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { href: "/requests", icon: Search, label: "Yêu cầu" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/donations", icon: History, label: "Lịch sử" },
    { href: "/rewards", icon: Award, label: "Đổi quà" },
    { href: "/settings", icon: Settings, label: "Cài đặt" },
];

export function BottomNav() {
    const pathname = usePathname();

    // Only show on donor pages
    const isDonorPage =
        pathname === "/" ||
        pathname.startsWith("/requests") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/donations") ||
        pathname.startsWith("/rewards") ||
        pathname.startsWith("/donate") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/screening") ||
        pathname.startsWith("/settings");

    // Don't show on auth, admin, hospital pages
    const isExcluded =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot") ||
        pathname.startsWith("/complete-") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/hospital") ||
        pathname.startsWith("/campaign-management") ||
        pathname.startsWith("/voucher-management") ||
        pathname.startsWith("/global-ana") ||
        pathname.startsWith("/system-setting") ||
        pathname.startsWith("/kiosk") ||
        pathname.startsWith("/unauthorized");

    if (!isDonorPage || isExcluded) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Glassmorphism background */}
            <div className="bg-white/80 dark:bg-[#120e1b]/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-stretch justify-around px-1" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive =
                            pathname === tab.href ||
                            (tab.href !== "/" && pathname.startsWith(tab.href));

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[52px] transition-all duration-200 relative",
                                    isActive
                                        ? "text-[#0065FF]"
                                        : "text-slate-400 dark:text-slate-500 active:text-slate-600"
                                )}
                            >
                                {/* Active indicator dot */}
                                {isActive && (
                                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#0065FF] animate-in fade-in zoom-in duration-200" />
                                )}
                                <Icon
                                    className={cn(
                                        "w-[22px] h-[22px] transition-transform duration-200",
                                        isActive && "scale-110"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] leading-tight transition-all duration-200",
                                        isActive ? "font-bold" : "font-medium"
                                    )}
                                >
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
