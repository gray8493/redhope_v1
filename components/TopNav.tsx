"use client";

import { useState, useRef, useEffect } from "react";
import {
    Search,
    Bell,
    User,
    LogOut,
    Settings,
    CheckCircle,
    Clock,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopNavProps {
    title?: string;
}

export function TopNav({ title = "Tổng quan" }: TopNavProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    // Refs for click outside handling (optional but good UI)
    const notiRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    // Mock Data Definition
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

    // Load from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notifications_state');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Re-attach icons because JSON.stringify removes functions/components
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

    // Save to localStorage
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem('notifications_state', JSON.stringify(notifications));
        }
    }, [notifications, isLoaded]);

    // Mark all as read handler
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    // Toggle handlers
    const toggleNoti = () => {
        setShowNotifications(!showNotifications);
        if (showUserMenu) setShowUserMenu(false);
    };

    const toggleUser = () => {
        setShowUserMenu(!showUserMenu);
        if (showNotifications) setShowNotifications(false);
    };

    const handleLogout = () => {
        router.push("/login");
    };

    return (
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 sticky top-0 z-20 w-full">
            <div className="flex items-center gap-8 flex-1">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">{title}</h2>
                <div className="hidden md:flex flex-1 max-w-md items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 border border-transparent focus-within:border-[#6324eb]/50 transition-all">
                    <Search className="text-slate-400 w-5 h-5" />
                    <input
                        className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-500 px-2 outline-none"
                        placeholder="Tìm bệnh viện hoặc điểm hiến máu..."
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">

                {/* Notifications */}
                <div className="relative" ref={notiRef}>
                    <button
                        onClick={toggleNoti}
                        className={`relative p-2 rounded-lg transition-all ${showNotifications ? 'bg-[#6324eb]/10 text-[#6324eb]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.some(n => n.unread) && (
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-4 w-80 sm:w-96 bg-white dark:bg-[#1c162e] rounded-xl shadow-2xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                            <div className="p-4 border-b border-[#ebe7f3] dark:border-[#2d263d] flex justify-between items-center bg-slate-50/50 dark:bg-[#251e36]/50">
                                <h3 className="font-bold text-[#120e1b] dark:text-white">Thông báo</h3>
                                <button onClick={markAllAsRead} className="text-xs font-bold text-[#6324eb] hover:underline">Đánh dấu đã đọc</button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.map((item) => (
                                    <div key={item.id} className={`p-4 border-b border-[#ebe7f3] dark:border-[#2d263d] hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors cursor-pointer flex gap-3 ${item.unread ? 'bg-[#6324eb]/5' : ''}`}>
                                        <div className={`size-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-[#120e1b] dark:text-white mb-1">{item.title}</p>
                                            <p className="text-xs text-[#654d99] dark:text-[#a594c9] leading-relaxed mb-1">{item.desc}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{item.time}</p>
                                        </div>
                                        {item.unread && <div className="size-2 rounded-full bg-[#6324eb] mt-1.5"></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 text-center border-t border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36]">
                                <Link href="/notifications" className="text-sm font-bold text-[#6324eb] hover:underline block w-full">Xem tất cả</Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>

                {/* User Menu */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={toggleUser}
                        className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-full pl-3 transition-colors text-left"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Alex Rivera</p>
                            <p className="text-xs text-slate-500">Nhóm máu O+</p>
                        </div>
                        <div className={`size-10 rounded-full border-2 overflow-hidden transition-colors ${showUserMenu ? 'border-[#6324eb]' : 'border-emerald-500/20'}`}>
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI4faTCJTkv8OO6MUFrzxQB3yJcWE7Zkm3Y9_WkORgcZUhg0mk8rv7geI97EgbgP3xfDraG1Oy9Psl47i83JoPayPQNpCHWNrSkQfnybH55NGY5MeYil6abA0jZHtNJmfXNyZTl8KPnYoPJdsSVNf-MVgxmvZSicOMuVKfMBGWKjOnheH0k_JUU5GhZRy0Go2cQ6u1xBc8VpgcwkOhb7P0b4kGQIcQ_8z8WaWBcp-2kVgx8l9LfAVeffjFZ8WyB63LgiErOcfK7o26"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-[#1c162e] rounded-xl shadow-2xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                            <div className="p-4 border-b border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50/50 dark:bg-[#251e36]/50">
                                <p className="text-sm font-bold text-[#120e1b] dark:text-white">Alex Rivera</p>
                                <p className="text-xs text-[#654d99] dark:text-[#a594c9]">alex.rivera@example.com</p>
                            </div>
                            <div className="p-2">
                                <Link
                                    href="/settings"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <User className="w-4 h-4 text-slate-500" /> Hồ sơ cá nhân
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <Bell className="w-4 h-4 text-slate-500" /> Cài đặt thông báo
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-slate-500" /> Cài đặt & Quyền riêng tư
                                </Link>
                            </div>
                            <div className="p-2 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
