"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Bell, Users, AlertTriangle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            const data = await notificationService.getNotifications(user.id);

            // Map to include icons and styling
            const mapped = data.map((n: any) => {
                let Icon = CheckCircle;
                let color = "text-green-500";
                let bg = "bg-green-50";

                if (n.action_type === 'view_campaign' || n.title.includes('chiến dịch')) {
                    Icon = AlertCircle;
                    color = "text-[#6324eb]";
                    bg = "bg-[#6324eb]/5";
                } else if (n.action_type === 'view_registrations' || n.title.includes('đăng ký')) {
                    Icon = Users;
                    color = "text-blue-500";
                    bg = "bg-blue-50";
                } else if (n.title.includes('Cảnh báo')) {
                    Icon = AlertTriangle;
                    color = "text-amber-500";
                    bg = "bg-amber-50";
                }

                return {
                    id: n.id,
                    title: n.title,
                    desc: n.content,
                    time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi }),
                    unread: !n.is_read,
                    icon: Icon,
                    color,
                    bg,
                    action_url: n.action_url,
                };
            });

            setNotifications(mapped);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchNotifications();
    }, [user?.id]);

    const handleNotificationClick = async (notification: any) => {
        try {
            if (notification.unread) {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
                );
            }

            if (notification.action_url) {
                router.push(notification.action_url);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const filteredNotifications = notifications
        .filter(n => {
            const matchesFilter = filter === 'all' || (filter === 'unread' && n.unread);
            const matchesSearch = searchQuery === '' ||
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.desc.toLowerCase().includes(searchQuery.toLowerCase());

            // LỌC CHỈ XEM THÔNG BÁO TỪ BỆNH VIỆN (Chiến dịch, lời mời hiến máu)
            // Dựa trên action_type hoặc logic Title liên quan đến Hospital
            const fromHospital = n.action_url?.includes('/campaigns/') ||
                n.title.includes('Chiến dịch') ||
                n.title.includes('Bệnh viện');

            return matchesFilter && matchesSearch && fromHospital;
        });

    return (
        <div className="flex h-screen w-full flex-row overflow-hidden bg-slate-50 dark:bg-[#0f0a19]">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
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

                    {/* Filters */}
                    <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-slate-200 dark:border-[#2d263d] p-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-[#1c162e] text-[#6324eb] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === 'unread' ? 'bg-white dark:bg-[#1c162e] text-[#6324eb] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Chưa đọc ({notifications.filter(n => n.unread).length})
                            </button>
                        </div>

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm thông báo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white dark:bg-[#1c162e] rounded-xl shadow-sm border border-slate-200 dark:border-[#2d263d] overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Bell className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500">Đang tải...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-[#2d263d]">
                                {filteredNotifications.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`p-6 hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors flex gap-4 cursor-pointer ${item.unread ? 'bg-[#6324eb]/5' : ''}`}
                                    >
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
                                <p className="text-slate-500">
                                    {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo!' : 'Bạn chưa có thông báo nào mới.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
