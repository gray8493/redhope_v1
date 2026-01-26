"use client";

import { useState, useEffect, Suspense } from "react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
    const { user, profile, refreshUser } = useAuth();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);

    // Initial tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'notifications' || tab === 'security' || tab === 'profile') {
            setActiveTab(tab as any);
        }
    }, [searchParams]);
    const LOCAL_STORAGE_KEY = "redhope_hospital_profile";

    // Profile State
    const [hospitalName, setHospitalName] = useState("");
    const [hospitalDesc, setHospitalDesc] = useState("Hệ thống y tế tuyến đầu chuyên sâu về cấp cứu, phẫu thuật và chăm sóc sức khỏe cộng đồng.");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [license, setLicense] = useState("");
    const [email, setEmail] = useState("");
    const [logo, setLogo] = useState<string | null>(null);
    const [cover, setCover] = useState<string | null>("https://lh3.googleusercontent.com/aida-public/AB6AXuB-pYSYh0nrFR9EHffBQeBIH5xosCZYGDX5BCz4F8coCgtRu4kG6rneHOzMavlAEAhCLLhsIPW4Zr8d-mdT7zRz_7_dZGzo7RaaOIAlwIsRmwLyIhmuf5Gr9OTUNGMtpvXLtejG42cMiJASTDeWyxZ6RdUzdu0e3CY05W1RGUjdSrabS7GoI882qtaXJ6lK-Jbn-GMBpayfdILyfA7_guOESZWU91gqgzwwV-DMnVMLbupel25a7M96j3ZIjVpp7eoO77BkS2pK5A");

    // Load data from LocalStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            setHospitalName(data.name || "");
            setHospitalDesc(data.desc || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");
            setLicense(data.license || "");
            setEmail(data.email || "");
            setLogo(data.logo || null);
            setCover(data.cover || null);

            // Notification settings
            if (data.notifications) {
                setEmailAlert(data.notifications.emailAlert ?? true);
                setNewDonorAlert(data.notifications.newDonorAlert ?? false);
                setShortfallThreshold(data.notifications.shortfallThreshold ?? 20);
            }
        } else if (profile) {
            // Fallback to auth profile if no local data
            setHospitalName(profile.hospital_name || "");
            setPhone(profile.phone || "");
            setAddress(profile.hospital_address || "");
            setLicense(profile.license_number || "");
            setEmail(profile.email || "");
        }
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        const loadingToast = toast.loading("Đang lưu vào trình duyệt...");

        try {
            // Save to LocalStorage (FE Only)
            const profileData = {
                name: hospitalName,
                desc: hospitalDesc,
                phone: phone,
                address: address,
                license: license,
                email: email,
                logo: logo,
                cover: cover
            };

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profileData));

            // Notify other components (like TopNav) that the profile has changed
            window.dispatchEvent(new Event("hospitalProfileUpdated"));

            // Simulate a short delay for feel
            await new Promise(resolve => setTimeout(resolve, 500));

            toast.success("Thành công", {
                id: loadingToast,
                description: "Hồ sơ đã được lưu tạm thời trên trình duyệt này.",
            });
        } catch (error: any) {
            toast.error("Lỗi", {
                id: loadingToast,
                description: "Không thể lưu hồ sơ.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const [emailAlert, setEmailAlert] = useState(true);
    const [newDonorAlert, setNewDonorAlert] = useState(false);
    const [shortfallThreshold, setShortfallThreshold] = useState(20);
    const [showPassword, setShowPassword] = useState(false);

    const handleSaveNotifications = async () => {
        setIsSaving(true);
        const loadingToast = toast.loading("Đang lưu cấu hình...");

        try {
            const currentData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
            const updatedData = {
                ...currentData,
                notifications: {
                    emailAlert,
                    newDonorAlert,
                    shortfallThreshold
                }
            };

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
            await new Promise(resolve => setTimeout(resolve, 500));

            toast.success("Thành công", {
                id: loadingToast,
                description: "Cấu hình thông báo đã được lưu.",
            });
        } catch (error) {
            toast.error("Lỗi", {
                id: loadingToast,
                description: "Không thể lưu cấu hình.",
            });
        } finally {
            setIsSaving(false);
        }
    };

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

    const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#F8FAFC] dark:bg-[#0F172A] font-sans text-slate-800 dark:text-slate-200 antialiased overflow-x-hidden text-left transition-colors duration-300">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Hồ sơ & Thương hiệu" />

                    <main className="max-w-5xl mx-auto px-6 py-8 w-full">
                        {/* Tab Navigation */}
                        <div className="flex items-center space-x-8 mb-8 border-b border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-[#501ac2]'}`}
                            >
                                Hồ sơ Bệnh viện
                                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'notifications' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-[#501ac2]'}`}
                            >
                                Thông báo
                                {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-[#501ac2]'}`}
                            >
                                Bảo mật
                                {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-full" />}
                            </button>
                        </div>

                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Header Title */}
                                <div className="flex items-center mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#6324eb] to-indigo-600 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg shadow-[#6324eb]/20">
                                        <MaterialIcon name="business" className="text-[22px] fill-1" />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hồ sơ & Thương hiệu</h1>
                                </div>

                                {/* Banner & Logo Section */}
                                <section className="relative mb-16">
                                    <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative group border border-slate-200 dark:border-slate-800 shadow-sm">
                                        {cover ? (
                                            <img src={cover} alt="Hospital cover" className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <MaterialIcon name="image" className="text-6xl opacity-20 mb-2" />
                                                <p className="text-sm font-bold">Chưa có ảnh bìa</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-6 right-6">
                                            <label className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border border-white/30 cursor-pointer active:scale-95 shadow-lg">
                                                <MaterialIcon name="photo_camera" className="text-sm" />
                                                <span>Thay đổi ảnh bìa</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                                            </label>
                                        </div>
                                        <div className="absolute bottom-8 left-52 hidden md:block">
                                            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-md">{hospitalName}</h2>
                                            <p className="text-white/80 text-sm max-w-lg font-medium drop-shadow-sm line-clamp-2 leading-relaxed">{hospitalDesc}</p>
                                        </div>
                                    </div>

                                    {/* Logo Floating */}
                                    <div className="absolute -bottom-10 left-10">
                                        <div className="relative group">
                                            <div className="w-32 h-32 md:w-36 md:h-36 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-2xl border-4 border-white dark:border-slate-900 overflow-hidden">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative">
                                                    {logo ? (
                                                        <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MaterialIcon name="local_hospital" className="text-[#6324eb] text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500 fill-1" />
                                                    )}
                                                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity cursor-pointer">
                                                        <MaterialIcon name="edit" className="text-white text-2xl" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Form Sections */}
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-lg font-black mb-6 flex items-center text-slate-800 dark:text-white">
                                            <MaterialIcon name="info" className="text-[#6324eb] mr-2 text-xl fill-1" />
                                            Thông tin cơ bản
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Tên Bệnh viện</label>
                                                <input
                                                    value={hospitalName}
                                                    onChange={(e) => setHospitalName(e.target.value)}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm shadow-sm"
                                                    placeholder="Nhập tên bệnh viện"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mã Định danh (Hospital ID)</label>
                                                <div className="relative">
                                                    <MaterialIcon name="lock" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                                    <input
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed font-mono text-sm"
                                                        readOnly
                                                        type="text"
                                                        value="HOS-8821-XC"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mô tả Tổ chức</label>
                                                <textarea
                                                    value={hospitalDesc}
                                                    onChange={(e) => setHospitalDesc(e.target.value)}
                                                    className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-sm resize-none shadow-sm"
                                                    rows={4}
                                                    placeholder="Giới thiệu về sứ mệnh tổ chức..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact & Location */}
                                    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-lg font-black mb-6 flex items-center text-slate-800 dark:text-white">
                                            <MaterialIcon name="contact_mail" className="text-[#6324eb] mr-2 text-xl fill-1" />
                                            Liên hệ & Vị trí
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Email Liên hệ</label>
                                                <div className="relative">
                                                    <MaterialIcon name="alternate_email" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                                    <input
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm shadow-sm"
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Số Điện thoại</label>
                                                <div className="relative">
                                                    <MaterialIcon name="call" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                                    <input
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm shadow-sm"
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Địa chỉ Trụ sở & Ghim vị trí</label>
                                                <div className="relative">
                                                    <MaterialIcon name="location_on" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                                    <input
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm shadow-sm"
                                                        type="text"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Map Preview */}
                                        <div className="relative rounded-[2rem] overflow-hidden h-80 border border-slate-300 dark:border-slate-700 shadow-inner group/map">
                                            <img alt="Map Preview" className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30 group-hover/map:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHmSY9vfRml7HHti-HeQSDGGSKqDVpN2NmW4IV6HsJJbMULsRGeKa56XvKtECTlJqFjuL7gxl3mTpCoa-hebF584-rkJ8es8ddM3OFv5oiG2y-dQyI5Qxei0gUF4-e4VM1dA1ADZhKNRRb6LvgcYo2dbbDlbnSIJpUTbIPrbnAhJkKTxNS3tm5Nv0erjFx8c2Hb8mLPHz3JmUe_trIjUVdgp_aZiVE35dqMDjJW-DBLjwiHCrGbRGa81oKpvxnkpgVa-mY2Ctp8pw" />
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                <div className="w-14 h-14 bg-[#6324eb] rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce border-4 border-white/20">
                                                    <MaterialIcon name="location_on" className="text-3xl fill-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-6 left-6 max-w-[280px]">
                                                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white dark:border-slate-800">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <MaterialIcon name="stars" className="text-orange-500 text-sm fill-1" />
                                                        <span className="text-orange-600 text-[10px] font-black uppercase tracking-widest">Điểm Hiến Máu</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                                        Đặt ghim tại vị trí cổng đón để hỗ trợ chỉ đường chính xác cho tình nguyện viên.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-6 right-6">
                                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-black text-sm flex items-center shadow-2xl hover:scale-105 active:scale-95 transition-all gap-2 border border-white/10">
                                                    <MaterialIcon name="gps_fixed" className="text-lg" />
                                                    <span>Ghim vị trí chính xác</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 pb-12">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className={`bg-gradient-to-r from-[#6324eb] to-indigo-600 text-white px-12 py-4 rounded-full font-black text-base flex items-center space-x-3 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                        >
                                            <MaterialIcon name={isSaving ? "sync" : "save"} className={`text-xl ${isSaving ? 'animate-spin' : ''}`} />
                                            <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-[#6324eb] mr-4">
                                        <MaterialIcon name="notifications" className="text-[22px] fill-1" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cấu hình Thông báo</h2>
                                </div>

                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-start gap-5">
                                                <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[#6324eb] shrink-0">
                                                    <MaterialIcon name="warning" className="text-2xl fill-1" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg text-slate-900 dark:text-white mb-1">Cảnh báo thiếu hụt chỉ tiêu</p>
                                                    <p className="text-sm text-slate-500 max-w-[450px] font-medium">Tự động gửi thông báo khẩn cấp khi tốc độ thu thập không đạt kỳ vọng.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEmailAlert(!emailAlert)}
                                                className={`relative flex items-center w-14 h-7 transition duration-300 ease-in-out rounded-full cursor-pointer px-1 ${emailAlert ? 'bg-[#6324eb]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                            >
                                                <span className={`bg-white w-5 h-5 rounded-full shadow-lg transition-transform duration-300 ${emailAlert ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                            </button>
                                        </div>

                                        <div className={`space-y-8 px-4 transition-all duration-500 ${!emailAlert ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Ngưỡng báo động</label>
                                                    <span className="text-5xl font-black text-[#6324eb] dark:text-indigo-400 tracking-tighter">{shortfallThreshold}%</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 uppercase tracking-tight">Thông báo khẩn cấp</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={shortfallThreshold}
                                                onChange={(e) => setShortfallThreshold(parseInt(e.target.value))}
                                                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#6324eb] focus:outline-none"
                                            />
                                            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                                                <div className="flex items-center gap-2 text-[#6324eb] dark:text-indigo-400 mb-2 font-black text-sm">
                                                    <MaterialIcon name="check_circle" className="text-lg fill-1" />
                                                    Kịch bản kích hoạt
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                                    Gửi cảnh báo ngay khi chiến dịch đạt dưới <span className="text-[#6324eb] dark:text-indigo-400 font-black underline decoration-2">{shortfallThreshold}%</span> mục tiêu trong 6 giờ đầu tiên.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-[#6324eb] shrink-0">
                                                <MaterialIcon name="person_add" className="text-2xl fill-1" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg text-slate-900 dark:text-white">Thông báo người hiến mới</p>
                                                <p className="text-sm text-slate-500 font-medium">Nhận thông báo thời gian thực khi có người đăng ký hiến máu.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNewDonorAlert(!newDonorAlert)}
                                            className={`relative flex items-center w-14 h-7 transition duration-300 ease-in-out rounded-full cursor-pointer px-1 ${newDonorAlert ? 'bg-[#6324eb]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${newDonorAlert ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                        </button>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSaveNotifications}
                                            disabled={isSaving}
                                            className={`bg-[#6324eb] text-white px-10 py-4 rounded-full font-black text-base shadow-2xl shadow-[#6324eb]/20 active:scale-95 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                        >
                                            {isSaving ? "Đang lưu..." : "Lưu cấu hình thông báo"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 mr-4">
                                        <MaterialIcon name="shield" className="text-[22px] fill-1" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bảo mật tài khoản</h2>
                                </div>

                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                                    <div className="grid grid-cols-1 gap-8 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mật khẩu Hiện tại</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6324eb]"
                                                >
                                                    <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm"
                                                placeholder="Ít nhất 8 ký tự"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Xác nhận mật khẩu</label>
                                            <input
                                                type="password"
                                                className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-[#6324eb]/5 focus:border-[#6324eb] outline-none transition-all font-bold text-sm"
                                                placeholder="Gõ lại mật khẩu mới"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30 flex items-start gap-4">
                                        <MaterialIcon name="info" className="text-amber-600 mt-0.5 text-xl fill-1" />
                                        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-bold">
                                            Việc đổi mật khẩu sẽ đăng xuất tài khoản của bạn khỏi tất cả các thiết bị khác để đảm bảo an toàn tối đa.
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <button className="bg-emerald-600 text-white px-10 py-4 rounded-full font-black text-base shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                                            Cập nhật bảo mật
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    <MiniFooter />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
                }
                .fill-1 {
                    font-variation-settings: 'FILL' 1 !important;
                }
                input[type="range"]::-webkit-slider-thumb {
                    width: 24px;
                    height: 24px;
                    background: #6324eb;
                    border: 4px solid #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    appearance: none;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    transition: transform 0.2s;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                .dark input[type="range"]::-webkit-slider-thumb {
                    border-color: #1E293B;
                }
            `}} />
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense>
            <SettingsContent />
        </Suspense>
    );
}
