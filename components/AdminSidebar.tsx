"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AdminSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin', icon: 'dashboard', label: 'Bảng điều khiển' },
        { href: '/admin/admin-donor', icon: 'person', label: 'Quản lý người hiến' },
        { href: '/admin/admin-hospitals', icon: 'domain', label: 'Bệnh viện' },
        { href: '/admin/voucher-management', icon: 'confirmation_number', label: 'Quản lý Voucher' },
        { href: '/admin/global-ana', icon: 'analytics', label: 'Phân tích toàn cầu' },
        { href: '/admin/system-setting', icon: 'settings', label: 'Cài đặt hệ thống' },
    ];

    return (
        <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
            <div className="p-6 flex flex-col h-full justify-between">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-center gap-3 w-full py-4 mb-2">
                        <img src="/logo.png" alt="REDHOPE Logo" className="h-12 w-auto object-contain" />
                        <h1 className="text-2xl font-extrabold text-[#7f1d1d] tracking-wider">REDHOPE</h1>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-[#f3effc] text-[#1f1f1f]'
                                        : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    <p className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                        {item.label}
                                    </p>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto">
                    <div className="bg-[#f3effc] rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-[#6324eb] mb-1">Trạng thái</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium">Hệ thống hoạt động tốt</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border-t border-gray-100 pt-4">


                    </div>
                </div>
            </div>
        </aside>
    );
};
