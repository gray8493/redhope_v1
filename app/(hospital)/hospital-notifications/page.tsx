"use client";

import React, { useState } from 'react';
import {
    CheckCheck,
    Search,
    CheckCircle,
    AlertTriangle,
    Info,
    Filter
} from 'lucide-react';

export default function HospitalNotificationsPage() {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // Expanded mock data for hospital context
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'info', title: 'Người hiến mới đăng ký', desc: 'Có 5 người dùng vừa đăng ký hiến máu tại chiến dịch của đơn vị.', time: '5 phút trước', read: false },
        { id: 2, type: 'warning', title: 'Điều phối máu khẩn cấp', desc: 'Hệ thống yêu cầu xác nhận khả năng tiếp nhận 20 đơn vị nhóm máu B+.', time: '15 phút trước', read: false },
        { id: 3, type: 'success', title: 'Chiến dịch hoàn thành', desc: 'Chiến dịch "Chung tay vì cộng đồng" đã đạt 100% mục tiêu.', time: '1 giờ trước', read: false },
        { id: 4, type: 'info', title: 'Hệ thống bảo trì', desc: 'Hệ thống quản lý bệnh viện sẽ bảo trì vào 02:00 AM ngày mai.', time: '3 giờ trước', read: true },
        { id: 5, type: 'success', title: 'Báo cáo tháng đã sẵn sàng', desc: 'Báo cáo tổng hợp hiệu quả chiến dịch tháng trước đã được tạo.', time: '1 ngày trước', read: true },
        { id: 6, type: 'warning', title: 'Cảnh báo vật tư thấp', desc: 'Số lượng túi lấy máu loại 350ml tại kho đang ở mức thấp.', time: '2 ngày trước', read: true },
        { id: 7, type: 'info', title: 'Cập nhật giao diện', desc: 'Giao diện quản lý chiến dịch vừa được cập nhật tính năng lọc mới.', time: '3 ngày trước', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleMarkAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    const getIconByType = (type: string) => {
        switch (type) {
            case 'success': return <div className="p-3 bg-emerald-100 text-emerald-500 rounded-full"><CheckCircle className="w-6 h-6" /></div>;
            case 'warning': return <div className="p-3 bg-rose-100 text-rose-500 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
            case 'info': default: return <div className="p-3 bg-blue-100 text-blue-500 rounded-full"><Info className="w-6 h-6" /></div>;
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
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Notification List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleMarkAsRead(notif.id)}
                                className={`group p-6 flex gap-6 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-[#251e36] ${!notif.read ? 'bg-[#6324eb]/5 dark:bg-[#6324eb]/5' : 'bg-white dark:bg-transparent'}`}
                            >
                                <div className="shrink-0">
                                    {getIconByType(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className={`text-base font-bold tracking-tight ${!notif.read ? 'text-[#120e1b] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {notif.title}
                                            {!notif.read && <span className="ml-2 inline-block w-2 h-2 bg-[#6324eb] rounded-full align-middle animate-pulse"></span>}
                                        </h3>
                                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap ml-4">{notif.time}</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium ${!notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                                        {notif.desc}
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
                        <button className="text-xs font-black text-[#6324eb] uppercase tracking-widest hover:underline transition-all">
                            Tải thêm thông báo cũ hơn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
