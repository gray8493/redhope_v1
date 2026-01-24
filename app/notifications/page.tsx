"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";

export default function NotificationsPage() {
    // Duplicate initial state structure for type safety/fallback
    const initialNotifications = [
        {
            id: 1,
            title: "Máu của bạn đã được sử dụng!",
            desc: "Đơn vị máu hiến ngày 24/10 đã được chuyển đến BV Chợ Rẫy.",
            time: "2 giờ trước",
            unread: true,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            id: 2,
            title: "Lời kêu gọi khẩn cấp nhóm O+",
            desc: "Bệnh viện 115 đang thiếu hụt nhóm máu của bạn.",
            time: "5 giờ trước",
            unread: true,
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-50"
        },
        {
            id: 3,
            title: "Nhắc nhở lịch hẹn",
            desc: "Bạn có thể hiến máu lại bắt đầu từ tuần tới.",
            time: "1 ngày trước",
            unread: false,
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-50"
        }
    ];

    const [notifications, setNotifications] = useState(initialNotifications);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage linked with TopNav state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notifications_state');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Re-attach icons
                    const restored = parsed.map((n: any) => ({
                        ...n,
                        icon: n.id === 1 ? CheckCircle : n.id === 2 ? AlertCircle : Clock
                    }));
                    setNotifications(restored);
                } catch (error) {
                    console.error("Error parsing notifications", error);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f0a19]">
            <div className="flex">
                {/* Sidebar placeholder or layout wrapper if needed, but for now assuming standalone or wrapped in layout */}
                {/* Using dashboard layout usually wraps this, but checking file path app/notifications/page.tsx implies it inherits root layout */}

                <main className="flex-1">
                    <TopNav title="Thông báo" />

                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bell className="w-6 h-6 text-[#6324eb]" />
                                Tất cả thông báo
                            </h1>
                        </div>

                        <div className="bg-white dark:bg-[#1c162e] rounded-xl shadow-sm border border-slate-200 dark:border-[#2d263d] overflow-hidden">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-[#2d263d]">
                                    {notifications.map((item) => (
                                        <div key={item.id} className={`p-6 hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors flex gap-4 ${item.unread ? 'bg-[#6324eb]/5' : ''}`}>
                                            <div className={`size-12 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
                                                <item.icon className={`w-6 h-6 ${item.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className={`text-base font-bold dark:text-white ${item.unread ? 'text-[#120e1b]' : 'text-slate-700'}`}>
                                                        {item.title}
                                                    </h3>
                                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">{item.time}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-[#a594c9] leading-relaxed">{item.desc}</p>
                                            </div>
                                            {item.unread && <div className="self-center"><div className="size-3 rounded-full bg-[#6324eb]"></div></div>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Không có thông báo</h3>
                                    <p className="text-slate-500">Bạn chưa có thông báo nào mới.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
