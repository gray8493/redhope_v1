"use client";

import { useState, useEffect, Suspense } from "react";
import { HospitalSidebar } from "@/components/shared/HospitalSidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

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
    const [hospitalDesc, setHospitalDesc] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [license, setLicense] = useState("");
    const [email, setEmail] = useState("");
    const [logo, setLogo] = useState<string | null>(null);
    const [cover, setCover] = useState<string | null>(null);

    // Load data from Profile (DB Source of Truth)
    useEffect(() => {
        if (profile) {
            setHospitalName(profile.hospital_name || profile.full_name || "");
            setHospitalDesc(profile.health_history || "");
            setPhone(profile.phone || "");
            setAddress(profile.hospital_address || profile.address || "");
            setLicense(profile.license_number || "");
            setEmail(profile.email || "");
            setLogo(profile.avatar_url || null);
            setCover(profile.cover_image || null);
            // Load DB settings
            if (profile.email_notifications !== undefined) setEmailAlert(!!profile.email_notifications);
            if (profile.emergency_notifications !== undefined) setNewDonorAlert(!!profile.emergency_notifications);
        } else {
            // Fallback to local storage if profile is not yet loaded (rare case or disconnected)
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    setHospitalName(data.name || "");
                    setHospitalDesc(data.desc || "");
                    setPhone(data.phone || "");
                    setAddress(data.address || "");
                    setLicense(data.license || "");
                    setEmail(data.email || "");
                    setLogo(data.logo || null);
                    setCover(data.cover || null);
                } catch (e) {
                    // Ignore corrupted local data
                }
            }
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        const loadingToast = toast.loading("Đang lưu hồ sơ...");

        try {
            // 1. Save to Database (Supabase)
            const profileData = {
                hospital_name: hospitalName,
                full_name: hospitalName, // Required field
                health_history: hospitalDesc, // Storing description in health_history for now
                phone: phone,
                hospital_address: address,
                address: address, // Sync both
                license_number: license,
                email: email,
                avatar_url: logo,
                cover_image: cover,
                role: 'hospital' as const
            };

            await userService.upsert(user.id, profileData);

            // 2. Save to LocalStorage (Legacy/State preservation)
            try {
                // Ensure we don't crash if LocalStorage is full
                // Also: Do NOT save huge base64 strings if they are not URLs
                const isUrl = (str: string | null) => str && (str.startsWith('http') || str.startsWith('/'));

                const localData = {
                    name: hospitalName,
                    desc: hospitalDesc,
                    phone,
                    address,
                    license,
                    email,
                    logo: isUrl(logo) ? logo : null, // Only save if it's a URL
                    cover: isUrl(cover) ? cover : null // Only save if it's a URL
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData));
            } catch (storageError) {
                console.warn("LocalStorage quota exceeded or error:", storageError);
                // Swallow error here, as DB save is what matters
            }

            // Notify other components
            window.dispatchEvent(new Event("hospitalProfileUpdated"));
            await refreshUser(); // Refresh global auth context

            toast.success("Thành công", {
                id: loadingToast,
                description: "Hồ sơ bệnh viện đã được cập nhật vào hệ thống.",
            });
        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi", {
                id: loadingToast,
                description: "Không thể lưu hồ sơ: " + (error.message || "Lỗi hệ thống"),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const [emailAlert, setEmailAlert] = useState(true);
    const [newDonorAlert, setNewDonorAlert] = useState(false);
    const [shortfallThreshold, setShortfallThreshold] = useState(20);
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Password states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isStaffMode, setIsStaffMode] = useState(false);

    useEffect(() => {
        setIsStaffMode(localStorage.getItem('hospital_staff_mode') === 'true');
    }, []);

    const toggleStaffMode = () => {
        if (isStaffMode) {
            localStorage.removeItem('hospital_staff_mode');
        } else {
            localStorage.setItem('hospital_staff_mode', 'true');
        }
        window.location.reload();
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Thiếu thông tin", { description: "Vui lòng nhập mật khẩu mới và xác nhận." });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu không khớp", { description: "Vui lòng kiểm tra lại xác nhận mật khẩu." });
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Mật khẩu yếu", { description: "Mật khẩu phải có ít nhất 6 ký tự." });
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading("Đang cập nhật mật khẩu...");
        try {
            // Need to import authService or use the logic directly
            // For hospital, we'll assume authService is available or use the logic from donor settings
            const { authService } = await import("@/services/auth.service");
            const { error } = await authService.updatePassword(newPassword);
            if (error) throw error;

            toast.success("Thành công!", { id: loadingToast, description: "Đổi mật khẩu thành công." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error("Lỗi", { id: loadingToast, description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        if (!user) return;
        setIsSaving(true);
        const loadingToast = toast.loading("Đang lưu cấu hình...");

        try {
            // 1. Save to Database
            await userService.upsert(user.id, {
                email_notifications: emailAlert,
                emergency_notifications: newDonorAlert
                // shortfallThreshold could be added as well if we add the column
            } as any);

            toast.success("Thành công", {
                id: loadingToast,
                description: "Cấu hình thông báo đã được cập nhật.",
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

    const handleLogout = async () => {
        try {
            const { authService } = await import("@/services/auth.service");
            await authService.signOut();
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        const loadingToast = toast.loading("Đang xóa tài khoản...");
        setIsSaving(true);
        setIsDeleting(true);

        try {
            // 1. Delete user profile from DB
            await userService.delete(user.id);

            // 2. Sign out
            const { authService } = await import("@/services/auth.service");
            await authService.signOut();

            toast.success("Đã xóa tài khoản", { id: loadingToast });
            window.location.href = "/login";
        } catch (error: any) {
            toast.error("Lỗi xóa tài khoản", {
                id: loadingToast,
                description: error.message || "Đã xảy ra lỗi không xác định."
            });
        } finally {
            setIsSaving(false);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview immediately
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result as string);
            reader.readAsDataURL(file);

            // Upload
            const toastId = toast.loading("Đang tải logo...");
            try {
                const url = await userService.uploadImage(file, 'avatars');
                setLogo(url);
                toast.success("Tải logo thành công", { id: toastId });
            } catch (error) {
                toast.error("Lỗi tải logo", { id: toastId });
            }
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => setCover(reader.result as string);
            reader.readAsDataURL(file);

            // Upload
            const toastId = toast.loading("Đang tải ảnh bìa...");
            try {
                const url = await userService.uploadImage(file, 'avatars'); // Reuse or change folder
                setCover(url);
                toast.success("Tải ảnh bìa thành công", { id: toastId });
            } catch (error) {
                toast.error("Lỗi tải ảnh bìa", { id: toastId });
            }
        }
    };

    const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <>
            <main className="max-w-5xl mx-auto px-6 py-8 w-full">
                {/* Tab Navigation */}
                <div className="flex items-center space-x-8 mb-8 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                        Hồ sơ Bệnh viện
                        {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'notifications' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                        Thông báo
                        {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                        Bảo mật
                        {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-full" />}
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header Title */}
                        <div className="flex items-center mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#0065FF] to-blue-600 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-500/20">
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
                                                <MaterialIcon name="local_hospital" className="text-[#0065FF] text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500 fill-1" />
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
                                    <MaterialIcon name="info" className="text-[#0065FF] mr-2 text-xl fill-1" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Tên Bệnh viện</label>
                                        <input
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                            className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm shadow-sm"
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
                                                value={`HOS-${user?.id?.slice(0, 8).toUpperCase() || "PENDING"}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mô tả Tổ chức</label>
                                        <textarea
                                            value={hospitalDesc}
                                            onChange={(e) => setHospitalDesc(e.target.value)}
                                            className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-sm resize-none shadow-sm"
                                            rows={4}
                                            placeholder="Giới thiệu về sứ mệnh tổ chức..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                <h3 className="text-lg font-black mb-6 flex items-center text-slate-800 dark:text-white">
                                    <MaterialIcon name="contact_mail" className="text-[#0065FF] mr-2 text-xl fill-1" />
                                    Liên hệ & Vị trí
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Email Liên hệ</label>
                                        <div className="relative">
                                            <MaterialIcon name="alternate_email" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                            <input
                                                className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm shadow-sm"
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
                                                className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm shadow-sm"
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
                                                className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm shadow-sm"
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Map Preview */}
                                <div className="relative rounded-[2rem] overflow-hidden h-80 border border-slate-300 dark:border-slate-700 shadow-inner group/map">
                                    <img alt="Map Preview" className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30 group-hover/map:scale-105 transition-transform duration-1000" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop" />
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-14 h-14 bg-[#0065FF] rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce border-4 border-white/20">
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
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-black text-sm flex items-center shadow-2xl hover:scale-105 active:scale-95 transition-all gap-2 border border-white/10">
                                            <span>Ghim vị trí chính xác</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 pb-12">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`bg-gradient-to-r from-[#0065FF] to-blue-600 text-white px-12 py-4 rounded-full font-black text-base flex items-center space-x-3 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                >
                                    <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-8">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-[#0065FF] mr-4">
                                <MaterialIcon name="notifications" className="text-[22px] fill-1" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cấu hình Thông báo</h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-start gap-5">
                                        <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0065FF] shrink-0">
                                            <MaterialIcon name="warning" className="text-2xl fill-1" />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-slate-900 dark:text-white mb-1">Cảnh báo thiếu hụt chỉ tiêu</p>
                                            <p className="text-sm text-slate-500 max-w-[450px] font-medium">Tự động gửi thông báo khẩn cấp khi tốc độ thu thập không đạt kỳ vọng.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEmailAlert(!emailAlert)}
                                        className={`relative flex items-center w-14 h-7 transition duration-300 ease-in-out rounded-full cursor-pointer px-1 ${emailAlert ? 'bg-[#0065FF]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <span className={`bg-white w-5 h-5 rounded-full shadow-lg transition-transform duration-300 ${emailAlert ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>

                                <div className={`space-y-8 px-4 transition-all duration-500 ${!emailAlert ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Ngưỡng báo động</label>
                                            <span className="text-5xl font-black text-[#0065FF] dark:text-blue-400 tracking-tighter">{shortfallThreshold}%</span>
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
                                        className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#0065FF] focus:outline-none"
                                    />
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-center gap-2 text-[#0065FF] dark:text-blue-400 mb-2 font-black text-sm">
                                            <MaterialIcon name="check_circle" className="text-lg fill-1" />
                                            Kịch bản kích hoạt
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                            Gửi cảnh báo ngay khi chiến dịch đạt dưới <span className="text-[#0065FF] dark:text-blue-400 font-black underline decoration-2">{shortfallThreshold}%</span> mục tiêu trong 6 giờ đầu tiên.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 group hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-[#0065FF] shrink-0">
                                        <MaterialIcon name="person_add" className="text-2xl fill-1" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg text-slate-900 dark:text-white">Thông báo người hiến mới</p>
                                        <p className="text-sm text-slate-500 font-medium">Nhận thông báo thời gian thực khi có người đăng ký hiến máu.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNewDonorAlert(!newDonorAlert)}
                                    className={`relative flex items-center w-14 h-7 transition duration-300 ease-in-out rounded-full cursor-pointer px-1 ${newDonorAlert ? 'bg-[#0065FF]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${newDonorAlert ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                </button>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSaveNotifications}
                                    disabled={isSaving}
                                    className={`bg-[#0065FF] text-white px-10 py-4 rounded-full font-black text-base shadow-2xl shadow-blue-500/20 active:scale-95 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
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
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0065FF]"
                                        >
                                            <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                        placeholder="Ít nhất 8 ký tự"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
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
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isSaving}
                                    className="bg-emerald-600 text-white px-10 py-4 rounded-full font-black text-base shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    {isSaving ? "Đang lưu..." : "Cập nhật bảo mật"}
                                </button>
                            </div>
                        </div>

                        {/* Staff Mode Toggle */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20">
                            <div className="flex items-center gap-3 mb-4">
                                <MaterialIcon name="badge" className="text-indigo-600 text-2xl fill-1" />
                                <h3 className="text-lg font-black text-indigo-700 dark:text-indigo-400">Chế độ Nhân viên (Staff View)</h3>
                            </div>
                            <p className="text-sm text-indigo-600/80 mb-6 font-medium leading-relaxed">
                                Kích hoạt giao diện tối giản dành cho nhân viên tại điểm hiến máu. Các tính năng quản lý cấp cao (Dashboard, Báo cáo) sẽ bị ẩn đi để tập trung vào tác vụ chuyên môn.
                            </p>
                            <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${isStaffMode ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {isStaffMode ? "Đang bật chế độ Nhân viên" : "Đang ở chế độ Quản lý toàn quyền"}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleStaffMode}
                                    className={`px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95 ${isStaffMode
                                        ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                                        }`}
                                >
                                    {isStaffMode ? "Tắt chế độ nhân viên" : "Bật chế độ nhân viên"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
                            <div className="flex items-center gap-3 mb-4">
                                <MaterialIcon name="warning" className="text-rose-600 text-2xl fill-1" />
                                <h3 className="text-lg font-black text-rose-700 dark:text-rose-400">Vùng nguy hiểm</h3>
                            </div>
                            <p className="text-sm text-rose-600/80 mb-6 font-medium leading-relaxed">
                                Nếu bạn xóa tài khoản bệnh viện, toàn bộ dữ liệu chiến dịch, yêu cầu máu và lịch sử hoạt động sẽ bị xóa vĩnh viễn và không thể khôi phục.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 border border-rose-200 text-rose-600 font-bold rounded-full hover:bg-rose-50 transition-colors shadow-sm"
                                >
                                    Đăng xuất
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 text-white font-bold rounded-full hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20"
                                >
                                    Xóa tài khoản bệnh viện
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                    title="Xóa tài khoản bệnh viện?"
                    description="CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn toàn bộ chiến dịch, hồ sơ và dữ liệu liên quan. Bạn không thể khôi phục sau khi xóa."
                    onConfirm={handleDeleteAccount}
                    confirmText={isDeleting ? "Đang xử lý..." : "Xóa vĩnh viễn"}
                    cancelText="Hủy bỏ"
                    variant="destructive"
                />

                <MiniFooter />
            </main>

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
                    background: #0065FF;
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
        </>
    );
}

export default function SettingsPage() {
    return (
        <Suspense>
            <SettingsContent />
        </Suspense>
    );
}
