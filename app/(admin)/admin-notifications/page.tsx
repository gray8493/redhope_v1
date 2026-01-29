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

export default function NotificationsPage() {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // Expanded mock data
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'info', title: 'Người hiến mới đăng ký', desc: 'Có 5 người dùng vừa đăng ký hiến máu tại khu vực TP.HCM.', time: '5 phút trước', read: false },
        { id: 2, type: 'warning', title: 'Yêu cầu máu khẩn cấp', desc: 'Bệnh viện Chợ Rẫy cần gấp 50 đơn vị nhóm máu O- cho ca phẫu thuật.', time: '15 phút trước', read: false },
        { id: 3, type: 'success', title: 'Chiến dịch hoàn thành', desc: 'Chiến dịch "Giọt máu hồng" đã đạt 100% chỉ tiêu. Vui lòng duyệt báo cáo.', time: '1 giờ trước', read: false },
        { id: 4, type: 'info', title: 'Hệ thống bảo trì', desc: 'Hệ thống sẽ bảo trì định kỳ vào 02:00 AM ngày mai.', time: '3 giờ trước', read: true },
        { id: 5, type: 'success', title: 'Báo cáo tuần đã sẵn sàng', desc: 'Báo cáo tổng hợp hoạt động tuần qua đã được tạo tự động.', time: '1 ngày trước', read: true },
        { id: 6, type: 'warning', title: 'Cảnh báo tồn kho thấp', desc: 'Nhóm máu AB+ tại kho trung tâm đang dưới mức an toàn.', time: '2 ngày trước', read: true },
        { id: 7, type: 'info', title: 'Cập nhật chính sách', desc: 'Chính sách bảo mật người dùng đã được cập nhật phiên bản 2.1.', time: '3 ngày trước', read: true },
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
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-[#6324eb] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-[#1c162e] text-[#6324eb] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === 'unread' ? 'bg-white dark:bg-[#1c162e] text-[#6324eb] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1c162e] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent outline-none"
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
                                className={`group p-6 flex gap-5 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-[#251e36] ${!notif.read ? 'bg-purple-50/40 dark:bg-[#251e36]/40' : 'bg-white dark:bg-[#1c162e]'}`}
                            >
                                <div className="shrink-0 mt-1">
                                    {getIconByType(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-base font-bold truncate ${!notif.read ? 'text-[#1d1d1f] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {notif.title}
                                            {!notif.read && <span className="ml-2 inline-block w-2 h-2 bg-[#6324eb] rounded-full align-middle"></span>}
                                        </h3>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">{notif.time}</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${!notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                                        {notif.desc}
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
                        <button className="text-sm font-bold text-slate-500 hover:text-[#6324eb] transition-colors">
                            Tải thêm thông báo cũ hơn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
