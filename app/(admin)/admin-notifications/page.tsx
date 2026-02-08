"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCheck,
    Search,
    CheckCircle,
    AlertTriangle,
    Info,
    Filter,
    Loader2,
    LayoutGrid,
    Droplet,
    Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function NotificationsPage() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user?.id) return;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await notificationService.getNotifications(user.id);
                setNotifications(data || []);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                toast.error('Không thể tải thông báo');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.id]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAllRead = async () => {
        if (!user?.id) return;
        try {
            await notificationService.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleMarkAsRead = async (notif: any) => {
        if (notif.is_read) return;
        try {
            await notificationService.markAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'unread' ? !n.is_read : true;
        const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getIconByType = (actionType: string) => {
        // Hoạt động của NGƯỜI HIẾN (Đăng ký, xác nhận lịch hẹn)
        if (['view_registrations', 'view_appointment'].includes(actionType)) {
            return <div className="p-3 bg-rose-100 text-rose-500 rounded-full"><Droplet className="w-6 h-6" /></div>;
        }
        // Hoạt động của BỆNH VIỆN (Phát yêu cầu, tạo chiến dịch, duyệt/từ chối)
        if (['view_campaign', 'campaign_approved', 'campaign_rejected'].includes(actionType)) {
            return <div className="p-3 bg-blue-100 text-[#0065FF] rounded-full"><LayoutGrid className="w-6 h-6" /></div>;
        }

        // Mặc định cho hệ thống
        return <div className="p-3 bg-blue-100 text-blue-500 rounded-full"><Info className="w-6 h-6" /></div>;
    };

    const getCategoryBadge = (actionType: string) => {
        // Gắn nhãn dựa trên CHỦ THỂ gây ra hành động
        if (['view_registrations', 'view_appointment'].includes(actionType)) {
            return <span className="px-2 py-0.5 bg-rose-100 text-rose-500 text-[10px] font-bold rounded uppercase tracking-wider">Người hiến</span>;
        }
        if (['view_campaign', 'campaign_approved', 'campaign_rejected'].includes(actionType)) {
            return <span className="px-2 py-0.5 bg-blue-100 text-[#0065FF] text-[10px] font-bold rounded uppercase tracking-wider">Bệnh viện</span>;
        }
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">Hệ thống</span>;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quản lý và cập nhật các thông tin quan trọng của hệ thống.</p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-[#0065FF] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Filters & Toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-[#251e36]/50">
                    <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-[#1c162e] text-[#0065FF] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === 'unread' ? 'bg-white dark:bg-[#1c162e] text-[#0065FF] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-[#0065FF] focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Notification List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0065FF]" />
                            <p className="font-medium">Đang tải thông báo...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleMarkAsRead(notif)}
                                className={`group p-6 flex gap-5 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-[#251e36] ${!notif.is_read ? 'bg-blue-50/40 dark:bg-[#251e36]/40' : 'bg-white dark:bg-[#1c162e]'}`}
                            >
                                <div className="shrink-0 mt-1">
                                    {getIconByType(notif.action_type || '')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col gap-1">
                                            {getCategoryBadge(notif.action_type || '')}
                                            <h3 className={`text-base font-bold truncate ${!notif.is_read ? 'text-[#1d1d1f] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {notif.title}
                                                {!notif.is_read && <span className="ml-2 inline-block w-2 h-2 bg-[#0065FF] rounded-full align-middle"></span>}
                                            </h3>
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                                        {notif.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 mb-4">
                                <Filter className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Không có thông báo nào</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo!' : 'Hiện chưa có thông báo mới trong hệ thống.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination / Footer */}
                {filteredNotifications.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#251e36]/50 text-center">
                        <button className="text-sm font-bold text-slate-500 hover:text-[#0065FF] transition-colors">
                            Tải thêm thông báo cũ hơn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
