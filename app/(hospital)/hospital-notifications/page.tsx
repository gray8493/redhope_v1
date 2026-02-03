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
    Calendar,
    Bell,
    MailOpen,
    Trash2,
    ArrowRight,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import MiniFooter from "@/components/shared/MiniFooter";

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

        // Bệnh viện xem thông báo từ Người hiến (Đăng ký chiến dịch hoặc Yêu cầu khẩn cấp)
        const fromDonor = n.action_type === 'view_registrations' || n.action_type === 'view_request';

        return matchesFilter && matchesSearch && fromDonor;
    });

    const getIconByType = (actionType: string) => {
        switch (actionType) {
            case 'view_registrations':
                return <div className="p-4 bg-med-primary/10 text-med-primary rounded-[20px] shadow-inner"><Users className="size-6" /></div>;
            case 'campaign_approved':
                return <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-[20px] shadow-inner"><CheckCircle className="size-6" /></div>;
            case 'campaign_rejected':
                return <div className="p-4 bg-rose-500/10 text-rose-500 rounded-[20px] shadow-inner"><AlertTriangle className="size-6" /></div>;
            default:
                return <div className="p-4 bg-med-blue/10 text-med-blue rounded-[20px] shadow-inner"><Info className="size-6" /></div>;
        }
    };

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-6 md:p-10 text-left medical-gradient">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Trung tâm Điều hành</span>
                        <span className="size-1.5 bg-med-primary rounded-full animate-pulse"></span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight leading-none">Thông báo <span className="text-med-primary underline decoration-emerald-200 decoration-8 underline-offset-4">Hệ thống</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl italic opacity-80">Theo dõi dòng chảy dữ liệu và các phản hồi từ cộng đồng trong thời gian thực.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-md text-med-primary border border-med-primary/20 rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:bg-med-primary hover:text-white transition-all group active:scale-95"
                    >
                        <CheckCheck className="size-4 group-hover:rotate-12 transition-transform" /> Đọc Tất cả
                    </button>
                )}
            </header>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-xl">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'all'
                            ? 'bg-white text-med-primary shadow-xl shadow-slate-300/10 scale-105'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${filter === 'unread'
                            ? 'bg-white text-med-primary shadow-xl shadow-slate-300/10 scale-105'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Chưa đọc
                        {unreadCount > 0 && <span className="bg-rose-500 text-white size-5 rounded-full flex items-center justify-center text-[9px] font-black animate-bounce">{unreadCount}</span>}
                    </button>
                </div>

                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-med-primary transition-colors" />
                    <input
                        className="w-full h-14 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl pl-14 pr-6 text-sm focus:ring-2 focus:ring-med-primary/20 focus:border-med-primary placeholder-slate-400 font-medium outline-none transition-all shadow-med"
                        placeholder="Tìm kiếm nội dung thông báo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-med overflow-hidden">
                <div className="divide-y divide-slate-100/50">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="size-12 animate-spin mb-4 text-med-primary" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">Đang đồng bộ dữ liệu...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleMarkAsRead(notif)}
                                className={`group p-8 flex gap-8 transition-all cursor-pointer hover:bg-white relative ${!notif.is_read ? 'bg-med-primary/5' : ''}`}
                            >
                                {!notif.is_read && <div className="absolute left-0 top-0 w-1.5 h-full bg-med-primary rounded-r-full shadow-[2px_0_10px_rgba(13,148,136,0.3)]"></div>}

                                <div className="shrink-0 relative">
                                    {getIconByType(notif.action_type || '')}
                                    {!notif.is_read && <div className="absolute -top-1 -right-1 size-3 bg-med-primary rounded-full border-2 border-white animate-pulse"></div>}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-lg font-medical-header tracking-tight transition-colors ${!notif.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap ml-6 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                            <Calendar className="size-3" /> {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium mb-4 ${!notif.is_read ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {notif.content}
                                    </p>

                                    <div className="flex items-center gap-6">
                                        <button className="text-[10px] font-black uppercase tracking-widest text-med-primary flex items-center gap-2 group/btn">
                                            Xem chi tiết <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors flex items-center gap-2">
                                            <Trash2 className="size-3" /> Gỡ bỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-32 text-center">
                            <div className="size-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-dashed border-slate-200 shadow-inner">
                                <MailOpen className="size-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-medical-header text-slate-900 mb-2">Hộp thư đang trống</h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm italic font-medium">
                                {filter === 'unread' ? 'Bạn đã xử lý hết các thông báo quan trọng.' : 'Hiện tại đơn vị chưa nhận được dữ liệu phản hồi mới.'}
                            </p>
                        </div>
                    )}
                </div>

                {filteredNotifications.length > 5 && (
                    <div className="p-8 border-t border-slate-100 bg-slate-50/30 text-center">
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-med-primary transition-colors flex items-center gap-3 mx-auto">
                            Tải thêm dữ liệu lịch sử <ChevronDown className="size-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-16">
                <MiniFooter />
            </div>
        </main>
    );
}
