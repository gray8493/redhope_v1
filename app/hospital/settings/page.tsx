"use client";

import {
    User,
    Bell,
    Shield,
    Save,
    Hotel,
    Mail,
    Phone,
    MapPin,
    Lock,
    Upload,
    Image as ImageIcon,
    Info,
    CheckCircle,
    Eye,
    EyeOff
} from "lucide-react";
import { useState } from "react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [hospitalName, setHospitalName] = useState("Bệnh viện Đa khoa Trung tâm");
    const [hospitalDesc, setHospitalDesc] = useState("Hệ thống y tế tuyến đầu chuyên sâu về cấp cứu, phẫu thuật và chăm sóc sức khỏe cộng đồng. Chúng tôi cam kết mang lại dịch vụ hiến máu an toàn và hiện đại nhất.");
    const [emailAlert, setEmailAlert] = useState(true);
    const [newDonorAlert, setNewDonorAlert] = useState(false);
    const [shortfallThreshold, setShortfallThreshold] = useState(20);
    const [logo, setLogo] = useState<string | null>(null);
    const [cover, setCover] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCover(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white text-left">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0 text-left">
                    <TopNav title="Cài đặt Hệ thống" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1000px] flex-1 px-4 md:px-8 space-y-8">

                            {/* Tabs Navigation */}
                            <div className="flex border-b border-[#ebe7f3] dark:border-[#2d263d] space-x-8">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'profile' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    Hồ sơ Bệnh viện
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'notifications' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    Thông báo
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'security' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    Bảo mật
                                </button>
                            </div>

                            {/* TAB: HỒ SƠ BỆNH VIỆN */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Hotel className="w-5 h-5 text-slate-400" />
                                        Hồ sơ & Thương hiệu
                                    </h2>

                                    {/* Branding Card */}
                                    <div className="bg-white dark:bg-[#1c162e] rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden shadow-sm">
                                        <div className="h-48 bg-slate-100 dark:bg-slate-800 relative group overflow-hidden">
                                            {cover ? (
                                                <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                                                    <p className="text-xs font-medium">Chưa có ảnh bìa</p>
                                                </div>
                                            )}
                                            <label className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg text-xs font-bold text-[#6324eb] dark:text-white cursor-pointer shadow-lg transform translate-y-12 group-hover:translate-y-0 transition-all border border-white/20">
                                                <div className="flex items-center gap-2">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    Thay đổi Ảnh bìa
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                                            </label>
                                        </div>

                                        <div className="px-8 pb-8 -mt-12 relative flex items-end justify-between">
                                            <div className="flex items-end gap-6">
                                                <div className="size-28 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden relative group">
                                                    {logo ? (
                                                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-300">
                                                            <Hotel className="w-10 h-10" />
                                                        </div>
                                                    )}
                                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <Upload className="w-6 h-6 text-white" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                    </label>
                                                </div>
                                                <div className="pb-2">
                                                    <h3 className="text-2xl font-black text-[#120e1b] dark:text-white">{hospitalName}</h3>
                                                    <p className="text-sm text-slate-500 font-medium max-w-[500px] line-clamp-1">{hospitalDesc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Form */}
                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên Bệnh viện</label>
                                                <input
                                                    value={hospitalName}
                                                    onChange={(e) => setHospitalName(e.target.value)}
                                                    className="px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-all font-medium"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mã Định danh (Hospital ID)</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-mono text-sm outline-none cursor-not-allowed select-none"
                                                        defaultValue="HOS-8821-XC"
                                                        readOnly
                                                    />
                                                    <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap font-bold flex items-center gap-2 border border-white/10">
                                                        <Info className="w-3.5 h-3.5 text-blue-400" />
                                                        Mã này được hệ thống cấp và không thể chỉnh sửa.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mô tả Tổ chức</label>
                                                <textarea
                                                    value={hospitalDesc}
                                                    onChange={(e) => setHospitalDesc(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-all font-medium resize-none shadow-inner"
                                                    placeholder="Giới thiệu đôi nét về bệnh viện và sứ mệnh của bạn..."
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Liên hệ</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="admins@cityhospital.org" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Số Điện thoại</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="+84 28 3933 9999" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 md:col-span-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Địa chỉ Trụ sở & Ghim vị trí</label>
                                                <div className="flex flex-col gap-6">
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="452 Đường Nguyễn Y, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh" />
                                                    </div>

                                                    {/* Map Card */}
                                                    <div className="relative w-full h-[350px] rounded-2xl overflow-hidden border-2 border-[#ebe7f3] dark:border-[#2d263d] bg-slate-100 p-1 group/map">
                                                        <img
                                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/HCMC_map.png/1200px-HCMC_map.png"
                                                            alt="Map"
                                                            className="w-full h-full object-cover rounded-xl filter grayscale-[0.2] contrast-[1.05]"
                                                        />
                                                        <div className="absolute inset-0 bg-[#6324eb]/5 opacity-0 group-hover/map:opacity-100 transition-opacity pointer-events-none" />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="size-16 bg-[#6324eb]/20 rounded-full flex items-center justify-center animate-pulse">
                                                                <MapPin className="text-[#6324eb] w-10 h-10 fill-current drop-shadow-2xl" />
                                                            </div>
                                                        </div>
                                                        <button className="absolute bottom-6 right-6 px-6 py-3 bg-[#6324eb] text-white text-sm font-bold rounded-xl shadow-2xl hover:scale-105 hover:bg-[#501ac2] transition-all flex items-center gap-2 border border-white/20 active:scale-95">
                                                            <MapPin className="w-4 h-4" />
                                                            Ghim vị trí chính xác
                                                        </button>
                                                        <div className="absolute top-6 left-6 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl shadow-2xl border border-white/20 max-w-[240px]">
                                                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                                                <MapPin className="w-4 h-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Điểm hiến máu</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">Đặt ghim tại vị trí cổng đón người hiến máu để hỗ trợ chỉ đường chính xác cho tình nguyện viên.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <button className="flex items-center gap-2 px-10 py-4 bg-[#6324eb] text-white rounded-xl font-bold hover:bg-[#501ac2] transition-all shadow-xl shadow-[#6324eb]/30 active:scale-95">
                                                <Save className="w-5 h-5" />
                                                Lưu thay đổi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: THÔNG BÁO */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Bell className="w-5 h-5 text-slate-400" />
                                        Cấu hình Thông báo
                                    </h2>

                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm space-y-6">
                                        {/* Smart Shortfall Alert */}
                                        <div className="p-6 bg-slate-50 dark:bg-[#251e36] rounded-2xl border border-dashed border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-start gap-4">
                                                    <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 shrink-0">
                                                        <Info className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-lg text-[#120e1b] dark:text-white mb-1">Cảnh báo Thiếu hụt Chỉ tiêu Chiến dịch</p>
                                                        <p className="text-sm text-slate-500 max-w-[450px]">Tự động gửi thông báo khẩn cấp khi tốc độ thu thập không đạt kỳ vọng so với mục tiêu đề ra.</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`relative inline-block w-14 h-7 transition duration-200 ease-in-out rounded-full cursor-pointer shadow-inner ${emailAlert ? 'bg-[#6324eb]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                    onClick={() => setEmailAlert(!emailAlert)}
                                                >
                                                    <span className={`absolute top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform ${emailAlert ? 'left-8' : 'left-1'}`}></span>
                                                </div>
                                            </div>

                                            <div className={`space-y-6 px-4 transition-all duration-300 ${!emailAlert ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Ngưỡng báo động tùy chỉnh</label>
                                                        <span className="text-4xl font-black text-[#6324eb] dark:text-[#a881f3]">{shortfallThreshold}%</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 uppercase tracking-tighter">Ưu tiên thông báo khẩn</span>
                                                </div>
                                                <div className="relative h-6 flex items-center">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="5"
                                                        value={shortfallThreshold}
                                                        onChange={(e) => setShortfallThreshold(parseInt(e.target.value))}
                                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6324eb] focus:outline-none"
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                                                    <span>Duy trì ổn định (0%)</span>
                                                    <span>Báo động nguy cấp (100%)</span>
                                                </div>
                                                <div className="p-4 bg-[#6324eb]/5 dark:bg-[#6324eb]/10 rounded-xl border border-[#6324eb]/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                    <div className="flex items-center gap-2 text-[#6324eb] mb-1 font-bold">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Kịch bản: Ngưỡng báo động {shortfallThreshold}%
                                                    </div>
                                                    <span className="font-bold opacity-60">Thực tế:</span> Gửi cảnh báo ngay khi chiến dịch đạt dưới <span className="font-black text-[#6324eb] underline decoration-2">{shortfallThreshold}%</span> mục tiêu thu thập (tổng kiểm tra mỗi 6 giờ).
                                                </div>
                                            </div>
                                        </div>

                                        {/* Real-time Notification */}
                                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-[#251e36] rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#120e1b] dark:text-white">Thông báo Người hiến mới</p>
                                                    <p className="text-sm text-slate-400">Nhận thông báo thời gian thực khi có người đăng ký hiến máu.</p>
                                                </div>
                                            </div>
                                            <div
                                                className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer shadow-inner ${newDonorAlert ? 'bg-[#6324eb]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                onClick={() => setNewDonorAlert(!newDonorAlert)}
                                            >
                                                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${newDonorAlert ? 'left-7' : 'left-1'}`}></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button className="flex items-center gap-2 px-10 py-4 bg-[#6324eb] text-white rounded-xl font-bold hover:bg-[#501ac2] transition-colors shadow-xl shadow-[#6324eb]/20 active:scale-95">
                                            <Save className="w-5 h-5" />
                                            Lưu cấu hình
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB: BẢO MẬT */}
                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Shield className="w-5 h-5 text-slate-400" />
                                        Cài đặt Bảo mật
                                    </h2>

                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm space-y-8">
                                        <div className="grid grid-cols-1 gap-6 max-w-[500px]">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu Hiện tại</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="w-full px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-all font-medium"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu Mới</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-all font-medium"
                                                    placeholder="Nhập mật khẩu mới"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Xác nhận Mật khẩu Mới</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-all font-medium"
                                                    placeholder="Gõ lại mật khẩu mới"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                                            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                                                <span className="font-bold">Lưu ý:</span> Việc đổi mật khẩu sẽ đăng xuất tài khoản của bạn khỏi tất cả các thiết bị khác để đảm bảo an toàn.
                                            </p>
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <button className="flex items-center gap-2 px-10 py-4 bg-[#6324eb] text-white rounded-xl font-bold hover:bg-[#501ac2] transition-all shadow-xl shadow-[#6324eb]/20 active:scale-95">
                                                <Shield className="w-5 h-5" />
                                                Cập nhật Bảo mật
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>
        </div>
    );
}
