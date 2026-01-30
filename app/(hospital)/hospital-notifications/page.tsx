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
    Users,
    LayoutGrid,
    Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function HospitalNotificationsPage() {
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
        const matchesFilter = filter === 'all' || (filter === 'unread' && !n.is_read);
        const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content?.toLowerCase().includes(searchQuery.toLowerCase());

        // NGHIÊM NGẶT: Bệnh viện chỉ xem thông báo từ Người hiến (Đăng ký mới)
        const fromDonor = n.action_type === 'view_registrations';

        return matchesFilter && matchesSearch && fromDonor;
    });

    const getIconByType = (actionType: string) => {
        switch (actionType) {
            case 'view_registrations':
                return <div className="p-3 bg-indigo-100 text-[#6324eb] rounded-full"><Users className="w-6 h-6" /></div>;
            case 'campaign_approved':
                return <div className="p-3 bg-emerald-100 text-emerald-500 rounded-full"><CheckCircle className="w-6 h-6" /></div>;
            case 'campaign_rejected':
                return <div className="p-3 bg-rose-100 text-rose-500 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
            default:
                return <div className="p-3 bg-blue-100 text-blue-500 rounded-full"><Info className="w-6 h-6" /></div>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-6 pb-20 px-4 md:px-0 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Thông báo</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Theo dõi và quản lý các hoạt động quan trọng tại bệnh viện.</p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-[#6324eb] uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-[#1c162e]/50 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Filters & Toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-[#251e36]/50">
                    <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white dark:bg-[#1c162e] text-[#6324eb] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-white dark:bg-[#1c162e] text-[#6324eb] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Notification List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#6324eb]" />
                            <p className="font-bold">Đang tải thông báo...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleMarkAsRead(notif)}
                                className={`group p-6 flex gap-6 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-[#251e36] ${!notif.is_read ? 'bg-[#6324eb]/5 dark:bg-[#6324eb]/5' : 'bg-white dark:bg-transparent'}`}
                            >
                                <div className="shrink-0">
                                    {getIconByType(notif.action_type || '')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className={`text-base font-bold tracking-tight ${!notif.is_read ? 'text-[#120e1b] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {notif.title}
                                            {!notif.is_read && <span className="ml-2 inline-block w-2 h-2 bg-[#6324eb] rounded-full align-middle animate-pulse"></span>}
                                        </h3>
                                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap ml-4">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium ${!notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                                        {notif.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-200 mb-6 border border-dashed border-slate-200 dark:border-slate-700">
                                <Filter className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không có thông báo nào</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium">
                                {filter === 'unread' ? 'Tuyệt vời! Bạn đã xử lý xong mọi thông báo.' : 'Hiện đơn vị chưa có thông báo mới nào.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination / Footer */}
                {filteredNotifications.length > 0 && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-[#251e36]/30 text-center">
                        <button className="text-sm font-bold text-slate-500 hover:text-[#6324eb] transition-colors">
                            Tải thêm thông báo cũ hơn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
