"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/shared/AdminSidebar';

const Toggle = ({
    checked,
    onChange,
    label,
    description
}: {
    checked: boolean;
    onChange: (val: boolean) => void;
    label: string;
    description: string;
}) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <button
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6324eb] focus:ring-offset-2 ${checked ? 'bg-[#6324eb]' : 'bg-gray-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

const SystemSettingsPage = () => {
    // Notification Settings
    const [lowStockAlert, setLowStockAlert] = useState(false);
    const [donationReminder, setDonationReminder] = useState(true);
    const [emergencyBroadcast, setEmergencyBroadcast] = useState(false);

    // AI Screening Configuration
    const [aiSensitivity, setAiSensitivity] = useState(7);
    const [minHemoglobin, setMinHemoglobin] = useState(12.5);
    const [minWeight, setMinWeight] = useState(50);
    const [questionVersion, setQuestionVersion] = useState("V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)");

    // Rewards & Points
    const [pointsPerDonation, setPointsPerDonation] = useState(1000);
    const [referralBonus, setReferralBonus] = useState(250);
    const [exchangeRate, setExchangeRate] = useState(500);
    const [pointsExpiry, setPointsExpiry] = useState(true);

    // Platform Security
    const [twoFactorAuth, setTwoFactorAuth] = useState("Bắt buộc cho tất cả Quản trị viên");

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('system_settings_all');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                // Notifications
                setLowStockAlert(parsed.lowStockAlert ?? false);
                setDonationReminder(parsed.donationReminder ?? true);
                setEmergencyBroadcast(parsed.emergencyBroadcast ?? false);

                // AI Screening
                setAiSensitivity(parsed.aiSensitivity ?? 7);
                setMinHemoglobin(parsed.minHemoglobin ?? 12.5);
                setMinWeight(parsed.minWeight ?? 50);
                if (parsed.questionVersion) setQuestionVersion(parsed.questionVersion);

                // Rewards & Points
                setPointsPerDonation(parsed.pointsPerDonation ?? 1000);
                setReferralBonus(parsed.referralBonus ?? 250);
                setExchangeRate(parsed.exchangeRate ?? 500);
                setPointsExpiry(parsed.pointsExpiry ?? true);

                // Security
                if (parsed.twoFactorAuth) setTwoFactorAuth(parsed.twoFactorAuth);
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        } else {
            // Check for legacy settings key and migrate if needed
            const legacySettings = localStorage.getItem('system_settings_notifications');
            if (legacySettings) {
                try {
                    const parsed = JSON.parse(legacySettings);
                    setLowStockAlert(parsed.lowStockAlert ?? false);
                    setDonationReminder(parsed.donationReminder ?? true);
                    setEmergencyBroadcast(parsed.emergencyBroadcast ?? false);
                } catch (e) { console.error(e); }
            }
        }
    }, []);

    const handleSave = () => {
        // Save to localStorage
        const settings = {
            lowStockAlert,
            donationReminder,
            emergencyBroadcast,
            aiSensitivity,
            minHemoglobin,
            minWeight,
            questionVersion,
            pointsPerDonation,
            referralBonus,
            exchangeRate,
            pointsExpiry,
            twoFactorAuth
        };
        localStorage.setItem('system_settings_all', JSON.stringify(settings));

        // In a real app, you would also make an API call here.
        alert('Lưu thay đổi thành công!');
    };

    const handleReset = () => {
        if (window.confirm("Bạn có chắc chắn muốn khôi phục tất cả cài đặt về mặc định không?")) {
            // Define defaults
            const defaults = {
                lowStockAlert: false,
                donationReminder: true,
                emergencyBroadcast: false,
                aiSensitivity: 7,
                minHemoglobin: 12.5,
                minWeight: 50,
                questionVersion: "V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)",
                pointsPerDonation: 1000,
                referralBonus: 250,
                exchangeRate: 500,
                pointsExpiry: true,
                twoFactorAuth: "Bắt buộc cho tất cả Quản trị viên"
            };

            // Set state
            setLowStockAlert(defaults.lowStockAlert);
            setDonationReminder(defaults.donationReminder);
            setEmergencyBroadcast(defaults.emergencyBroadcast);
            setAiSensitivity(defaults.aiSensitivity);
            setMinHemoglobin(defaults.minHemoglobin);
            setMinWeight(defaults.minWeight);
            setQuestionVersion(defaults.questionVersion);
            setPointsPerDonation(defaults.pointsPerDonation);
            setReferralBonus(defaults.referralBonus);
            setExchangeRate(defaults.exchangeRate);
            setPointsExpiry(defaults.pointsExpiry);
            setTwoFactorAuth(defaults.twoFactorAuth);

            // Save defaults to localStorage
            localStorage.setItem('system_settings_all', JSON.stringify(defaults));

            alert('Đã khôi phục cài đặt mặc định!');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Cài đặt Hệ thống</h2>
                    <p className="text-gray-500 text-sm">Cấu hình các tham số toàn cầu và nền tảng.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleReset} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#1f1f1f] transition-colors">Khôi phục mặc định</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-[#6324eb] text-white text-sm font-bold rounded-lg hover:bg-opacity-90 shadow-sm transition-all">Lưu thay đổi</button>
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
                                <input
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6324eb]"
                                    max="10"
                                    min="1"
                                    type="range"
                                    value={aiSensitivity}
                                    onChange={(e) => setAiSensitivity(Number(e.target.value))}
                                />
                                <span className="text-sm font-bold text-[#6324eb] px-3 py-1 bg-[#6324eb]/10 rounded-lg">Cao ({aiSensitivity}/10)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hemoglobin Tối thiểu (g/dL)</label>
                                <input
                                    className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                    placeholder="12.5"
                                    step="0.1"
                                    min="0.1"
                                    type="number"
                                    value={minHemoglobin}
                                    onChange={(e) => setMinHemoglobin(Math.max(0.1, Number(e.target.value)))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cân nặng Tối thiểu (kg)</label>
                                <input
                                    className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                    placeholder="50"
                                    min="30"
                                    type="number"
                                    value={minWeight}
                                    onChange={(e) => setMinWeight(Math.max(30, Number(e.target.value)))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phiên bản Câu hỏi Sàng lọc</label>
                            <select
                                className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                value={questionVersion}
                                onChange={(e) => setQuestionVersion(e.target.value)}
                            >
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
                                    <input
                                        className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all pr-10"
                                        type="number"
                                        value={pointsPerDonation}
                                        onChange={(e) => setPointsPerDonation(Number(e.target.value))}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">pts</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thưởng giới thiệu</label>
                                <div className="relative">
                                    <input
                                        className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all pr-10"
                                        type="number"
                                        value={referralBonus}
                                        onChange={(e) => setReferralBonus(Number(e.target.value))}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">pts</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tỷ lệ quy đổi điểm (1 USD = ? Điểm)</label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">$1.00 = </span>
                                <input
                                    className="block w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                    type="number"
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                                />
                                <span className="text-sm text-gray-400">Điểm</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                className="w-4 h-4 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]"
                                type="checkbox"
                                checked={pointsExpiry}
                                onChange={(e) => setPointsExpiry(e.target.checked)}
                            />
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
                            <Toggle
                                checked={lowStockAlert}
                                onChange={setLowStockAlert}
                                label="Cảnh báo Kho thấp"
                                description="Thông báo cho bệnh viện khi lượng máu thấp"
                            />
                            <div className="border-t border-gray-50 pt-4">
                                <Toggle
                                    checked={donationReminder}
                                    onChange={setDonationReminder}
                                    label="Nhắc nhở Hiến máu"
                                    description="SMS/Email tự động mỗi 56 ngày"
                                />
                            </div>
                            <div className="border-t border-gray-50 pt-4">
                                <Toggle
                                    checked={emergencyBroadcast}
                                    onChange={setEmergencyBroadcast}
                                    label="Phát sóng Khẩn cấp"
                                    description="Thông báo đẩy khu vực về nhu cầu máu O-"
                                />
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
                            <select
                                className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                value={twoFactorAuth}
                                onChange={(e) => setTwoFactorAuth(e.target.value)}
                            >
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
        </div>
    );
};

export default SystemSettingsPage;
