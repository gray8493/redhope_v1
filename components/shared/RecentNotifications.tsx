"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertTriangle, Users, Droplet, LayoutGrid, CheckCheck, Loader2 } from "lucide-react";
import { notificationService } from "@/services";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface RecentNotificationsProps {
    userId: string;
    role: string;
    limit?: number;
}

export function RecentNotifications({ userId, role, limit = 5 }: RecentNotificationsProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const router = useRouter();

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            setIsLoading(true);
            const data = await notificationService.getNotifications(userId);
            setNotifications(data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Real-time subscription
        const channel = supabase
            .channel(`recent-notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const handleMarkAsRead = async (id: string, actionUrl?: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            if (actionUrl) router.push(actionUrl);
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const filtered = notifications
        .filter(n => filter === 'all' || !n.is_read)
        .slice(0, limit);

    const getIcon = (type: string, title: string) => {
        if (type === 'view_registrations' || title.includes('đăng ký')) return { Icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' };
        if (type === 'view_campaign' || title.includes('chiến dịch')) return { Icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50' };
        if (type === 'view_appointment' || title.includes('hẹn')) return { Icon: Droplet, color: 'text-rose-500', bg: 'bg-rose-50' };
        if (title.includes('Cảnh báo') || title.includes('⚠️')) return { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' };
        return { Icon: Bell, color: 'text-[#6324eb]', bg: 'bg-[#6324eb]/5' };
    };

    const viewAllPath = role === 'hospital' ? '/hospital-notifications' : '/notifications';

    return (
        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden flex flex-col h-full">
            <CardHeader className="p-5 flex flex-row items-center justify-between border-b border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50/50 dark:bg-[#251e36]/50">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#6324eb]" />
                    Thông báo mới nhất
                </CardTitle>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                        className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-[#6324eb] transition-colors"
                    >
                        {filter === 'all' ? 'Chỉ chưa đọc' : 'Xem tất cả'}
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-xs font-medium">Đang tải...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {filtered.map((n) => {
                            const { Icon, color, bg } = getIcon(n.action_type || '', n.title);
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleMarkAsRead(n.id, n.action_url)}
                                    className={`p-4 hover:bg-slate-50 dark:hover:bg-[#251e36] transition-all cursor-pointer flex gap-4 ${!n.is_read ? 'bg-[#6324eb]/5' : ''}`}
                                >
                                    <div className={`size-10 shrink-0 rounded-full ${bg} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm font-bold truncate ${!n.is_read ? 'text-[#120e1b] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {n.content}
                                        </p>
                                    </div>
                                    {!n.is_read && <div className="size-2 rounded-full bg-[#6324eb] mt-1.5 animate-pulse"></div>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">Bạn chưa có thông báo nào</p>
                    </div>
                )}
            </CardContent>
            {notifications.length > 0 && (
                <div className="p-3 border-t border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36]">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs font-bold text-[#6324eb] hover:bg-indigo-50 border-none"
                        onClick={() => router.push(viewAllPath)}
                    >
                        Xem tất cả thông báo
                    </Button>
                </div>
            )}
        </Card>
    );
}
