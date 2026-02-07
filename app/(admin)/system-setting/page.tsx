"use client";
import React, { useState, useEffect } from 'react';
import { settingService, SystemSettings } from '@/services/setting.service';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
    const [donationIntervalMonths, setDonationIntervalMonths] = useState(3);
    const [apiKey, setApiKey] = useState("Loading...");

    // Load settings from DB on mount
    useEffect(() => {
        loadSettings();

        // Simulate fetching secure key
        setTimeout(() => {
            setApiKey("sk-live-•••••••••••qRw");
        }, 500);
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await settingService.getSettings();

            // Map DB snake_case to React camelCase state
            setLowStockAlert(data.low_stock_alert);
            setDonationReminder(data.donation_reminder);
            setEmergencyBroadcast(data.emergency_broadcast);

            setAiSensitivity(data.ai_sensitivity);
            setMinHemoglobin(data.min_hemoglobin);
            setMinWeight(data.min_weight);
            setQuestionVersion(data.question_version);

            setPointsPerDonation(data.points_per_donation);
            setReferralBonus(data.referral_bonus);
            setExchangeRate(data.exchange_rate);
            setPointsExpiry(data.points_expiry);

            setTwoFactorAuth(data.two_factor_auth);
            setDonationIntervalMonths(data.donation_interval_months || 3);

        } catch (error) {
            console.error("Failed to load settings", error);
            toast.error("Không thể tải cấu hình hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Map React camelCase back to snake_case for DB
            const settingsToSave: Partial<SystemSettings> = {
                low_stock_alert: lowStockAlert,
                donation_reminder: donationReminder,
                emergency_broadcast: emergencyBroadcast,

                ai_sensitivity: aiSensitivity,
                min_hemoglobin: minHemoglobin,
                min_weight: minWeight,
                question_version: questionVersion,

                points_per_donation: pointsPerDonation,
                referral_bonus: referralBonus,
                exchange_rate: exchangeRate,
                points_expiry: pointsExpiry,

                two_factor_auth: twoFactorAuth,
                donation_interval_months: donationIntervalMonths
            };

            await settingService.updateSettings(settingsToSave);
            toast.success("Lưu thay đổi thành công!");
        } catch (error: any) {
            console.error("Save failed:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            toast.error("Lưu thất bại: " + (error.message || 'Lỗi hệ thống'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("Bạn có chắc chắn muốn khôi phục tất cả cài đặt về mặc định không?")) return;

        setSaving(true);
        try {
            // Define defaults
            const defaults: Partial<SystemSettings> = {
                low_stock_alert: false,
                donation_reminder: true,
                emergency_broadcast: false,
                ai_sensitivity: 7,
                min_hemoglobin: 12.5,
                min_weight: 50,
                question_version: "V4.2 - Tiêu chuẩn Toàn cầu (Hoạt động)",
                points_per_donation: 1000,
                referral_bonus: 250,
                exchange_rate: 500,
                points_expiry: true,
                donation_interval_months: 3,
                two_factor_auth: "Bắt buộc cho tất cả Quản trị viên"
            };

            await settingService.updateSettings(defaults);

            // Reload state
            await loadSettings(); // This will refresh UI with defaults

            toast.success("Đã khôi phục cài đặt mặc định!");
        } catch (error: any) {
            console.error("Reset failed:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            toast.error("Khôi phục thất bại: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#6324eb]" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm bg-white/90">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Cài đặt Hệ thống</h2>
                    <p className="text-gray-500 text-sm">Cấu hình các tham số toàn cầu và nền tảng.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleReset}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#1f1f1f] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                        Khôi phục mặc định
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-[#6324eb] text-white text-sm font-bold rounded-lg hover:bg-opacity-90 shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                                <input
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6324eb]"
                                    max="10"
                                    min="1"
                                    type="range"
                                    value={aiSensitivity}
                                    onChange={(e) => setAiSensitivity(Number(e.target.value))}
                                />
                                <span className={`text-sm font-bold px-3 py-1 rounded-lg ${aiSensitivity >= 8 ? 'bg-[#6324eb]/10 text-[#6324eb]' :
                                    aiSensitivity >= 5 ? 'bg-orange-100 text-orange-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                    {aiSensitivity >= 8 ? 'Cao' : aiSensitivity >= 5 ? 'Trung bình' : 'Thấp'} ({aiSensitivity}/10)
                                </span>
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
                                    value={minHemoglobin || ''}
                                    onChange={(e) => setMinHemoglobin(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cân nặng Tối thiểu (kg)</label>
                                <input
                                    className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                    placeholder="50"
                                    min="30"
                                    type="number"
                                    value={minWeight || ''}
                                    onChange={(e) => setMinWeight(Math.max(30, parseFloat(e.target.value) || 30))}
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
                        <div className="border-t border-gray-50 pt-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khoảng cách giữa các lần hiến máu (Tháng)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all"
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={donationIntervalMonths}
                                    onChange={(e) => setDonationIntervalMonths(Number(e.target.value))}
                                />
                                <p className="text-xs text-gray-400 italic">Mặc định là 3 tháng theo quy định y tế.</p>
                            </div>
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
                                        onChange={(e) => setPointsPerDonation(Math.max(0, Number(e.target.value) || 0))}
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
                                        onChange={(e) => setReferralBonus(Math.max(0, Number(e.target.value) || 0))}
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
                                    onChange={(e) => setExchangeRate(Math.max(0, Number(e.target.value) || 0))}
                                />
                                <span className="text-sm text-gray-400">Điểm</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="pointsExpiry"
                                className="w-4 h-4 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]"
                                type="checkbox"
                                checked={pointsExpiry}
                                onChange={(e) => setPointsExpiry(e.target.checked)}
                            />
                            <label htmlFor="pointsExpiry" className="text-sm font-medium text-gray-700 cursor-pointer">Bật hết hạn điểm sau 12 tháng</label>
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
                                <input
                                    className="block flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] focus:border-transparent transition-all font-mono"
                                    readOnly
                                    type="text"
                                    value={apiKey}
                                />
                                <button
                                    onClick={() => alert("Secure copy requires server authentication")}
                                    className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                                >
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

        </div>
    );
};

export default SystemSettingsPage;
