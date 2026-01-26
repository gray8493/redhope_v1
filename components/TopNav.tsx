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
    AlertCircle,
    AlertTriangle,
    TrendingDown,
    Star,
    ShieldCheck,
    Users,
    CheckCircle2,
    MessageSquare,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";

interface TopNavProps {
    title?: string;
}

export function TopNav({ title = "Tổng quan" }: TopNavProps) {
    const { user, profile, signOut: contextSignOut } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    // Refs for click outside handling (optional but good UI)
    const notiRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    // Mock Data Definition
    // Mock Data Definition for Hospital/Admin
    const hospitalNotifications = [
        {
            id: Date.now() - 1000,
            title: "⚠️ Cảnh báo Tỷ lệ đăng ký thấp",
            desc: "Chiến dịch 'Hiến máu Mùa Xuân' diễn ra ngày mai nhưng chỉ đạt 15% lượt đăng ký.",
            time: "1 giờ trước",
            unread: true,
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            id: Date.now() - 2000,
            title: "📉 Cảnh báo Lệch Nhóm máu",
            desc: "Chiến dịch hiện tại đang thiếu hụt nhóm máu O (chỉ chiếm 5%). Hãy ưu tiên gọi người nhóm O.",
            time: "3 giờ trước",
            unread: true,
            icon: TrendingDown,
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            id: Date.now() - 3000,
            title: "🛠️ Hệ thống",
            desc: "Admin Hệ thống đã duyệt yêu cầu tạo chiến dịch mới của bạn.",
            time: "Vừa xong",
            unread: false,
            icon: ShieldCheck,
            color: "text-[#6324eb]",
            bg: "bg-[#6324eb]/5"
        }
    ];

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
            color: "text-[#6324eb]",
            bg: "bg-indigo-50"
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
                    const restored = parsed.map((n: any) => {
                        let Icon = n.type === 'alert' ? AlertTriangle :
                            n.type === 'goal' ? TrendingUp :
                                n.type === 'check' ? CheckCircle2 :
                                    n.type === 'feedback' ? Star :
                                        n.type === 'system' ? ShieldCheck :
                                            n.type === 'down' ? TrendingDown : Clock;

                        // Fallback to original icon map if type not found
                        if (!n.type) Icon = n.id % 2 === 0 ? AlertTriangle : CheckCircle;

                        return {
                            ...n,
                            icon: Icon
                        };
                    });
                    setNotifications(restored);
                } catch (error) {
                    console.error("Error parsing notifications", error);
                    setNotifications(profile?.role === 'hospital' ? hospitalNotifications : initialNotifications);
                }
            } else {
                setNotifications(profile?.role === 'hospital' ? hospitalNotifications : initialNotifications);
            }
            setIsLoaded(true);
        }
    }, [profile]);

    // Global Notification Listener
    useEffect(() => {
        const handleNewNotification = (event: any) => {
            const data = event.detail;
            const newNoti = {
                id: Date.now(),
                title: data.title,
                desc: data.desc,
                time: "Vừa xong",
                unread: true,
                type: data.type,
                icon: data.type === 'alert' ? AlertTriangle :
                    data.type === 'goal' ? TrendingUp :
                        data.type === 'check' ? CheckCircle2 :
                            data.type === 'feedback' ? Star :
                                data.type === 'system' ? ShieldCheck :
                                    data.type === 'down' ? TrendingDown : Clock,
                color: data.color || (profile?.role === 'hospital' ? "text-[#6324eb]" : "text-[#6324eb]"),
                bg: data.bg || (profile?.role === 'hospital' ? "bg-indigo-50" : "bg-[#6324eb]/5")
            };
            setNotifications(prev => [newNoti, ...prev]);

            // Auto open notifications if it's an alert (optional)
            // if (data.type === 'alert') setShowNotifications(true);
        };

        window.addEventListener('redhope:notification', handleNewNotification);
        return () => window.removeEventListener('redhope:notification', handleNewNotification);
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

    const handleLogout = async () => {
        console.log("Logout initiated...");
        try {
            // Clear hospital specific profile first
            localStorage.removeItem('redhope_hospital_profile');

            // Attempt to sign out via context
            await contextSignOut();

            console.log("Logout successful, redirecting...");
            // Force a full page reload to the login page to clear all states
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed during signOut call:", error);
            // Even if sign out fails (e.g. network/session error), force the redirect
            window.location.href = "/login";
        }
    };

    const [hospitalInfo, setHospitalInfo] = useState<{ name: string; email: string; logo: string | null } | null>(null);

    // Sync hospital profile data
    useEffect(() => {
        const loadHospitalInfo = () => {
            if (profile?.role === 'hospital') {
                const saved = localStorage.getItem("redhope_hospital_profile");
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        setHospitalInfo({
                            name: data.name,
                            email: data.email,
                            logo: data.logo
                        });
                    } catch (e) {
                        console.error("Error parsing hospital profile", e);
                    }
                }
            }
        };

        loadHospitalInfo();

        // Listen for internal updates within the app
        window.addEventListener("hospitalProfileUpdated", loadHospitalInfo);

        // Also listen for storage events (if multiple tabs are open)
        window.addEventListener("storage", (e) => {
            if (e.key === "redhope_hospital_profile") loadHospitalInfo();
        });

        return () => {
            window.removeEventListener("hospitalProfileUpdated", loadHospitalInfo);
            window.removeEventListener("storage", loadHospitalInfo);
        };
    }, [profile]);

    const displayRole = profile?.role === 'admin' ? "Quản trị viên" : profile?.role === 'hospital' ? "Bệnh viện" : profile?.blood_group ? `Nhóm máu ${profile.blood_group}` : "Thành viên";

    const displayName = profile?.role === 'hospital' && hospitalInfo?.name
        ? hospitalInfo.name
        : (profile?.full_name || user?.user_metadata?.full_name || "Alex Rivera");

    const userEmail = profile?.role === 'hospital' && hospitalInfo?.email
        ? hospitalInfo.email
        : (profile?.email || user?.email || "alex.rivera@example.com");

    const avatarUrl = profile?.role === 'hospital' && hospitalInfo?.logo
        ? hospitalInfo.logo
        : "https://lh3.googleusercontent.com/aida-public/AB6AXuAI4faTCJTkv8OO6MUFrzxQB3yJcWE7Zkm3Y9_WkORgcZUhg0mk8rv7geI97EgbgP3xfDraG1Oy9Psl47i83JoPayPQNpCHWNrSkQfnybH55NGY5MeYil6abA0jZHtNJmfXNyZTl8KPnYoPJdsSVNf-MVgxmvZSicOMuVKfMBGWKjOnheH0k_JUU5GhZRy0Go2cQ6u1xBc8VpgcwkOhb7P0b4kGQIcQ_8z8WaWBcp-2kVgx8l9LfAVeffjFZ8WyB63LgiErOcfK7o26";

    const settingsPath = profile?.role === 'hospital' ? "/hospital/settings" : "/settings";

    return (
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 sticky top-0 z-20 w-full">
            <div className="flex items-center gap-8 flex-1">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">{title}</h2>
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
                            <span className="absolute top-2 right-2 size-2 bg-[#6324eb] rounded-full ring-2 ring-white dark:ring-slate-900"></span>
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
                                        {item.unread && <div className={`size-2 rounded-full mt-1.5 ${profile?.role === 'hospital' ? 'bg-[#6324eb]' : 'bg-[#6324eb]'}`}></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 text-center border-t border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36]">
                                <Link href="/notifications" className={`text-sm font-bold ${profile?.role === 'hospital' ? 'text-[#6324eb]' : 'text-[#6324eb]'} hover:underline block w-full`}>Xem tất cả</Link>
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
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
                            <p className="text-xs text-slate-500">{displayRole}</p>
                        </div>
                        <div className={`size-10 rounded-full border-2 overflow-hidden transition-colors ${showUserMenu ? 'border-[#6324eb]' : 'border-emerald-500/20'}`}>
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-[#1c162e] rounded-xl shadow-2xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                            <div className="p-4 border-b border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50/50 dark:bg-[#251e36]/50">
                                <p className="text-sm font-bold text-[#120e1b] dark:text-white">{displayName}</p>
                                <p className="text-xs text-[#654d99] dark:text-[#a594c9] truncate">{userEmail}</p>
                            </div>
                            <div className="p-2">
                                <Link
                                    href={settingsPath}
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <User className="w-4 h-4 text-slate-500" /> Hồ sơ cá nhân
                                </Link>
                                <Link
                                    href={`${settingsPath}?tab=notifications`}
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <Bell className="w-4 h-4 text-slate-500" /> Cài đặt thông báo
                                </Link>
                                <Link
                                    href={`${settingsPath}?tab=security`}
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-slate-500" /> Bảo mật
                                </Link>
                            </div>
                            <div className="p-2 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
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
