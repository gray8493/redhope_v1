"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';

const SystemSettingsPage = () => {
    const [lowStockWarning, setLowStockWarning] = useState(true);
    const [donationReminder, setDonationReminder] = useState(true);
    const [emergencyBroadcast, setEmergencyBroadcast] = useState(true);
    const [showToast, setShowToast] = useState(false);

    const handleSave = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Cài đặt Hệ thống</h2>
                    <p className="text-gray-500 text-sm">Cấu hình các tham số toàn cầu và nền tảng.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#1f1f1f] transition-colors">Khôi phục mặc định</button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#6324eb] text-white text-sm font-bold rounded-lg hover:bg-opacity-90 shadow-sm transition-all"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Screening Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#6324eb]">psychology</span>
                        <h3 className="font-bold text-[#1f1f1f]">Cấu hình Sàng lọc AI</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Độ nhạy Khảo sát Sức khỏe</label>
                            <div className="flex items-center gap-4">
                                <input className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6324eb]" max="10" min="1" type="range" defaultValue="7" />
                                <span className="text-sm font-bold text-[#6324eb] px-3 py-1 bg-[#6324eb]/10 rounded-lg">Cao (0.7)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hemoglobin Tối thiểu (g/dL)</label>
                                <input className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all" placeholder="12.5" step="0.1" type="number" defaultValue="12.5" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cân nặng Tối thiểu (kg)</label>
                                <input className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all" placeholder="50" type="number" defaultValue="50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phiên bản Câu hỏi Sàng lọc</label>
                            <select className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all">
                                <option>V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)</option>
                                <option>V4.1 - Cũ</option>
                                <option>V5.0-Beta - Sàng lọc Mở rộng</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* Rewards & Points */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <span className="material-symbols-outlined text-orange-500">card_giftcard</span>
                        <h3 className="font-bold text-[#1f1f1f]">Thưởng & Điểm</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Điểm cho mỗi lần hiến máu</label>
                                <div className="relative">
                                    <input className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all pr-10" type="number" defaultValue="1000" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">pts</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thưởng giới thiệu</label>
                                <div className="relative">
                                    <input className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all pr-10" type="number" defaultValue="250" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">pts</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tỷ lệ quy đổi điểm (1 USD = ? Điểm)</label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">$1.00 = </span>
                                <input className="block w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all" type="number" defaultValue="500" />
                                <span className="text-sm text-gray-400">Điểm</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input defaultChecked className="w-4 h-4 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]" type="checkbox" />
                            <label className="text-sm font-medium text-gray-700">Bật hết hạn điểm sau 12 tháng</label>
                        </div>
                    </div>
                </div>
                {/* Notification Settings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-500">notifications_active</span>
                        <h3 className="font-bold text-[#1f1f1f]">Cài đặt Thông báo</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">Cảnh báo Kho thấp</p>
                                    <p className="text-xs text-gray-500">Thông báo cho bệnh viện khi lượng máu thấp</p>
                                </div>
                                <div
                                    onClick={() => setLowStockWarning(!lowStockWarning)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${lowStockWarning ? 'bg-[#6324eb]' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${lowStockWarning ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <div>
                                    <p className="text-sm font-semibold">Nhắc nhở Hiến máu</p>
                                    <p className="text-xs text-gray-500">SMS/Email tự động mỗi 56 ngày</p>
                                </div>
                                <div
                                    onClick={() => setDonationReminder(!donationReminder)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${donationReminder ? 'bg-[#6324eb]' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${donationReminder ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <div>
                                    <p className="text-sm font-semibold">Phát sóng Khẩn cấp</p>
                                    <p className="text-xs text-gray-500">Thông báo đẩy khu vực về nhu cầu máu O-</p>
                                </div>
                                <div
                                    onClick={() => setEmergencyBroadcast(!emergencyBroadcast)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${emergencyBroadcast ? 'bg-[#6324eb]' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${emergencyBroadcast ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Platform Security */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500">security</span>
                        <h3 className="font-bold text-[#1f1f1f]">Bảo mật Nền tảng</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khóa API (Đọc/Ghi)</label>
                            <div className="flex gap-2">
                                <input className="block flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all font-mono" readOnly type="password" defaultValue="sk-live-51Mz2vjKxL1oP9qRw" />
                                <button className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                                    <span className="material-symbols-outlined text-lg">content_copy</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chính sách 2FA</label>
                            <select className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all">
                                <option>Bắt buộc cho tất cả Quản trị viên</option>
                                <option>Chỉ bắt buộc cho Super Admin</option>
                                <option>Tùy chọn</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phân cấp Vai trò Quản trị</label>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-[#6324eb]/10 text-[#6324eb] rounded text-[10px] font-bold">QUẢN TRỊ VIÊN CẤP CAO</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">QUẢN TRỊ VIÊN KHU VỰC</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">QUẢN LÝ BỆNH VIỆN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#6324eb]/5 rounded-xl border border-[#6324eb]/10">
                <div className="flex items-center gap-4 text-[#6324eb]">
                    <span className="material-symbols-outlined text-2xl">info</span>
                    <p className="text-sm font-medium">Mọi thay đổi được thực hiện tại đây sẽ được ghi lại và kiểm toán để tuân thủ bảo mật. Những thay đổi ngưỡng đáng kể có thể yêu cầu xem xét thủ công.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        className="px-10 py-2.5 bg-[#6324eb] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#6324eb]/20 transition-all"
                    >
                        Lưu tất cả thay đổi
                    </button>
                </div>
            </div>

            {/* Success Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-[#6324eb] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 z-50">
                    <span className="material-symbols-outlined">check_circle</span>
                    <div>
                        <h4 className="font-bold text-sm">Thành công</h4>
                        <p className="text-xs opacity-90">Đã lưu tất cả thay đổi hệ thống.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettingsPage;
