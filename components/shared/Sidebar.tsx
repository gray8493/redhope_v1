"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    History,
    Search,
    Award,
    Heart,
    Settings,
    ChevronsRight,
    ChevronsLeft,
} from "lucide-react";
import { RedHopeLogo, NameRedHope } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/requests", icon: Search, label: "Yêu cầu hiến máu" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/donations", icon: History, label: "Lịch sử hiến máu" },
    { href: "/rewards", icon: Award, label: "Đổi quà" },
    { href: "/donate", icon: Heart, label: "Quyên góp" },
    { href: "/settings", icon: Settings, label: "Cài đặt" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    // Listen for toggle event from TopNav hamburger button
    useEffect(() => {
        const handleToggle = () => setIsExpanded(prev => !prev);
        window.addEventListener('toggle-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-sidebar', handleToggle);
    }, []);

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col h-full",
                "transition-all duration-300 ease-in-out",
                "border-r border-slate-200 dark:border-slate-800",
                "bg-white dark:bg-slate-900",
                "overflow-hidden flex-shrink-0 relative",
                isExpanded ? "w-64" : "w-[72px]"
            )}
        >
            {/* Logo */}
            <div className="p-4 flex items-center gap-3 h-[65px] border-b border-slate-100 dark:border-slate-800">
                <Link href="/requests" className="flex items-center gap-3 min-w-0">
                    <div className="bg-[#0065FF] size-10 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <RedHopeLogo className="w-24 h-24 fill-current" />
                    </div>
                    <div
                        className={cn(
                            "transition-all duration-300 whitespace-nowrap overflow-hidden",
                            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                        )}
                    >
                        <NameRedHope className="text-slate-900 dark:text-white text-lg font-bold leading-tight" />
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={cn(
                                "flex items-center gap-3 rounded-xl transition-all duration-200 min-w-0",
                                isExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                                isActive
                                    ? "bg-[#0065FF]/10 text-[#0065FF] font-bold"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-[#0065FF]")} />
                            <span
                                className={cn(
                                    "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                                    isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Toggle Button */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "flex items-center gap-3 w-full rounded-xl py-2.5 transition-all duration-200",
                        "text-slate-400 hover:text-[#0065FF] hover:bg-[#0065FF]/5",
                        isExpanded ? "px-3" : "px-0 justify-center"
                    )}
                    title={isExpanded ? "Thu gọn" : "Mở rộng"}
                >
                    {isExpanded ? (
                        <>
                            <ChevronsLeft className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium whitespace-nowrap">Thu gọn</span>
                        </>
                    ) : (
                        <ChevronsRight className="w-5 h-5 flex-shrink-0" />
                    )}
                </button>
            </div>
        </aside>
    );
}
