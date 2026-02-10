"use client";

import {
    User,
    Bell,
    Lock,
    Shield,
    Mail,
    Smartphone,
    Camera,
    MapPin,
    Droplet,
    Calendar,
    Activity,
    Info,
    Save,
    CheckCircle2,
    AlertTriangle,
    LogOut,
    Trash2,
    Eye,
    EyeOff
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { BLOOD_GROUPS } from "@/lib/database.types";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { PushNotificationToggle } from "@/components/shared/PushNotificationToggle";

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Initial tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'notifications' || tab === 'security' || tab === 'profile') {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Profile State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [address, setAddress] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [citizenId, setCitizenId] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("Nam");
    const [weight, setWeight] = useState("");
    const [lastDonationDate, setLastDonationDate] = useState("");
    const [healthHistory, setHealthHistory] = useState("");

    // Images
    const [avatar, setAvatar] = useState<string | null>(null);
    const [cover, setCover] = useState<string | null>("https://images.unsplash.com/photo-1615461168078-83e35f76d540?q=80&w=2669&auto=format&fit=crop");

    // Fetch real data from database on mount
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch fresh data directly from database
                const profile = await userService.getById(user.id);

                if (profile) {
                    setName(profile.full_name || "");
                    setPhone(profile.phone || "");
                    setEmail(profile.email || user.email || "");
                    setCity(profile.city || "");
                    setDistrict(profile.district || "");
                    setAddress(profile.address || "");
                    setBloodGroup(profile.blood_group || "");
                    setCitizenId(profile.citizen_id || "");
                    setDob(profile.dob || "");
                    setGender(profile.gender || "Nam");
                    setWeight(profile.weight ? profile.weight.toString() : "");
                    setHealthHistory(profile.health_history || "");
                    setAvatar(profile.avatar_url || user.user_metadata?.avatar_url || null);
                    setCover(profile.cover_image || null);
                } else {
                    // Fallback to auth user data details
                    setName(user.user_metadata?.full_name || "");
                    setEmail(user.email || "");
                }
            } catch (error: any) {
                console.error("Error fetching profile:", error);
                if (user) {
                    setName(user.user_metadata?.full_name || user.profile?.full_name || "");
                    setPhone(user.profile?.phone || "");
                    setEmail(user.email || "");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [user?.id]);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Handlers
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        const loadingToast = toast.loading("Đang lưu thông tin...");

        // Validate Age
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                toast.error("Không đủ điều kiện tuổi!", { id: loadingToast, description: "Bạn cần phải đủ 18 tuổi trở lên." });
                setIsSaving(false);
                return;
            }
        }

        try {
            const updateData: Record<string, any> = {
                full_name: name,
                phone: phone || null,
                email: email,
                city: city || null,
                district: district || null,
                address: address || null,
                blood_group: bloodGroup || null,
                citizen_id: citizenId || null,
                dob: dob || null,
                gender: gender || null,
                weight: weight ? parseFloat(weight) : null,
                health_history: healthHistory || null,
                avatar_url: avatar || null,
                cover_image: cover || null,
            };

            // Clean undefined
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) delete updateData[key];
            });

            await userService.upsert(user.id, updateData as any);
            if (refreshUser) await refreshUser();

            toast.success("Đã lưu thành công!", {
                id: loadingToast,
                description: "Hồ sơ cá nhân của bạn đã được cập nhật."
            });
        } catch (error: any) {
            toast.error("Lỗi cập nhật", {
                id: loadingToast,
                description: error.message || "Không thể lưu thông tin."
            });
        } finally {
            setIsSaving(false);
        }
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

        const loadingToast = toast.loading("Đang cập nhật mật khẩu...");
        try {
            const { error } = await authService.updatePassword(newPassword);
            if (error) throw error;

            toast.success("Thành công!", { id: loadingToast, description: "Đổi mật khẩu thành công." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error("Lỗi", { id: loadingToast, description: error.message });
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);

            // Upload in background
            setIsUploading(true);
            const loadingToast = toast.loading("Đang tải ảnh lên...");
            try {
                const url = await userService.uploadAvatar(file);
                setAvatar(url); // Update with real URL
                toast.success("Tải ảnh thành công", { id: loadingToast });
            } catch (error: any) {
                toast.error("Lỗi tải ảnh: " + error.message, { id: loadingToast });
            } finally {
                setIsUploading(false);
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

            // Upload in background
            setIsUploading(true);
            const loadingToast = toast.loading("Đang tải ảnh bìa...");
            try {
                const url = await userService.uploadImage(file, 'avatars'); // Reuse avatars bucket or create new one
                setCover(url);
                toast.success("Tải ảnh bìa thành công", { id: loadingToast });
            } catch (error: any) {
                toast.error("Lỗi tải ảnh: " + error.message, { id: loadingToast });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-row overflow-hidden bg-[#f6f6f8] dark:bg-[#120e1b] font-sans text-slate-900 dark:text-white">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <TopNav title="" />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-6 py-8 w-full">

                        {/* Tab Navigation */}
                        <div className="flex items-center space-x-6 md:space-x-8 mb-8 border-b border-slate-300 dark:border-slate-800 overflow-x-auto no-scrollbar whitespace-nowrap px-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`pb-4 text-[13px] md:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'profile' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-[#0052CC]'}`}
                            >
                                Hồ sơ Cá nhân
                                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`pb-4 text-[13px] md:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'notifications' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-[#0052CC]'}`}
                            >
                                Thông báo
                                {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`pb-4 text-[13px] md:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'security' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-[#0052CC]'}`}
                            >
                                Bảo mật
                                {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-full" />}
                            </button>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                                {/* Header Title */}
                                <div className="flex items-center mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#0065FF] to-blue-600 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg shadow-[#0065FF]/20">
                                        <User className="size-5" />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight">Hồ sơ & Thông tin</h1>
                                </div>

                                {/* Profile Header - Redesigned */}
                                <section className="flex flex-col items-center justify-center mb-12">
                                    <div className="relative group mb-6">
                                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-[#120e1b] rounded-full p-1.5 shadow-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                                                {avatar ? (
                                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl font-black text-[#0065FF] opacity-50">
                                                        {name ? name.charAt(0).toUpperCase() : 'U'}
                                                    </span>
                                                )}
                                                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity cursor-pointer">
                                                    <Camera className="text-white size-8" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 flex size-8 rounded-full bg-emerald-500 border-4 border-white dark:border-[#120e1b] items-center justify-center">
                                            <CheckCircle2 className="text-white size-4" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{name || "Người dùng"}</h2>
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            <span className="bg-[#0065FF]/10 text-[#0065FF] px-3 py-1 rounded-full text-xs font-bold border border-[#0065FF]/20">
                                                {user?.role === 'admin' ? "Quản trị viên" : "Người hiến máu"}
                                            </span>
                                            {bloodGroup && (
                                                <span className="bg-rose-500/10 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/20">
                                                    Nhóm máu: {bloodGroup}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Forms */}
                                <div className="space-y-6">
                                    {/* Personal Info */}
                                    <div className="bg-white dark:bg-[#1c162e] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-lg font-black mb-6 flex items-center text-slate-800 dark:text-white">
                                            <User className="text-[#0065FF] mr-2 size-5" />
                                            Thông tin cá nhân
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Họ và tên</label>
                                                <input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                    placeholder="Nhập họ tên đầy đủ"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Giới tính</label>
                                                <div className="relative">
                                                    <select
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm appearance-none"
                                                    >
                                                        <option value="Nam">Nam</option>
                                                        <option value="Nữ">Nữ</option>
                                                        <option value="Khác">Khác</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    value={dob}
                                                    onChange={(e) => setDob(e.target.value)}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">CCCD / CMND</label>
                                                <input
                                                    value={citizenId}
                                                    onChange={(e) => setCitizenId(e.target.value)}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                    placeholder="Số định danh cá nhân"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="bg-white dark:bg-[#1c162e] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-lg font-black mb-6 flex items-center text-slate-800 dark:text-white">
                                            <Smartphone className="text-[#0065FF] mr-2 size-5" />
                                            Liên hệ & Sức khỏe
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Điện thoại</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                        placeholder="0912..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Nhóm máu</label>
                                                <div className="relative">
                                                    <Droplet className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 size-4" />
                                                    <select
                                                        value={bloodGroup}
                                                        onChange={(e) => setBloodGroup(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm appearance-none"
                                                    >
                                                        <option value="">Chưa có thông tin</option>
                                                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Cân nặng (kg)</label>
                                                <div className="relative">
                                                    <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                    <input
                                                        type="number"
                                                        value={weight}
                                                        onChange={(e) => setWeight(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                        placeholder="KG"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Tiền sử bệnh lý</label>
                                                <textarea
                                                    value={healthHistory}
                                                    onChange={(e) => setHealthHistory(e.target.value)}
                                                    className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm resize-none"
                                                    rows={3}
                                                    placeholder="Ghi chú về tiền sử bệnh lý của bạn (nếu có)..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-white dark:bg-[#1c162e] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-lg font-black mb-6 flex items-center text-slate-800 dark:text-white">
                                            <MapPin className="text-[#0065FF] mr-2 size-5" />
                                            Địa chỉ liên lạc
                                        </h3>
                                        <div className="space-y-6">
                                            <LocationSelector
                                                defaultCity={city}
                                                defaultDistrict={district}
                                                onCityChange={setCity}
                                                onDistrictChange={setDistrict}
                                            // @ts-ignore: Custom styling if needed via props or class overriding
                                            />
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Địa chỉ chi tiết</label>
                                                <input
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                    placeholder="Số nhà, tên đường..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end pt-6">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || isUploading}
                                            className={`w-full md:w-auto bg-gradient-to-r from-[#0065FF] to-blue-600 text-white px-8 md:px-12 py-3.5 md:py-4 rounded-full font-black text-sm md:text-base flex items-center justify-center space-x-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95 ${isSaving || isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                        >
                                            <Save className={`size-5 ${isSaving || isUploading ? 'animate-spin' : ''}`} />
                                            <span>{isUploading ? "Đang tải ảnh..." : (isSaving ? "Đang lưu..." : "Lưu thay đổi hồ sơ")}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Content */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-[#0065FF] mr-4">
                                        <Bell className="size-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Cấu hình Thông báo</h2>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 dark:border-slate-800 shadow-sm space-y-6">
                                    {/* Push Notification Section */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-black mb-4 flex items-center text-slate-800 dark:text-white">
                                            <Bell className="text-[#0065FF] mr-2 size-5" />
                                            Thông báo đẩy (Push)
                                        </h3>
                                        <PushNotificationToggle />
                                    </div>

                                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-6"></div>

                                    <h3 className="text-lg font-black mb-4 flex items-center text-slate-800 dark:text-white">
                                        <Mail className="text-blue-500 mr-2 size-5" />
                                        Cài đặt Email & SMS
                                    </h3>

                                    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/20 rounded-2xl md:rounded-3xl border border-slate-300 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-5">
                                                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0065FF] shrink-0">
                                                    <Mail className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg mb-1">Email nhắc nhở</p>
                                                    <p className="text-sm text-slate-500 max-w-[450px] font-medium">Nhận email nhắc nhở khi đến lịch hiến máu hoặc đủ điều kiện hiến lại.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-[#0065FF]"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/20 rounded-2xl md:rounded-3xl border border-slate-300 dark:border-slate-800 group hover:border-amber-200 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-5">
                                                <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                                    <AlertTriangle className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg mb-1">Cảnh báo khẩn cấp</p>
                                                    <p className="text-sm text-slate-500 max-w-[450px] font-medium">Nhận thông báo ngay lập tức khi có bệnh viện cần nhóm máu của bạn gấp.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-[#0065FF]"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button className="w-full md:w-auto bg-[#0065FF] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-black text-sm md:text-base shadow-2xl shadow-[#0065FF]/20 active:scale-95 transition-all hover:-translate-y-1">
                                            Lưu cấu hình
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Content */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 mr-4">
                                        <Shield className="size-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Bảo mật tài khoản</h2>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 dark:border-slate-800 shadow-sm space-y-8">
                                    <div className="grid grid-cols-1 gap-8 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mật khẩu Hiện tại</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0065FF]"
                                                >
                                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                placeholder="Ít nhất 6 ký tự"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 ml-4">Xác nhận mật khẩu</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-6 py-3.5 rounded-full border border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-[#0065FF]/10 focus:border-[#0065FF] outline-none transition-all font-bold text-sm"
                                                placeholder="Gõ lại mật khẩu mới"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={handleChangePassword}
                                            className="w-full md:w-auto bg-emerald-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-black text-sm md:text-base shadow-xl shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-700"
                                        >
                                            Cập nhật bảo mật
                                        </button>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-rose-50 dark:bg-rose-900/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertTriangle className="text-rose-600 size-6" />
                                        <h3 className="text-lg font-black text-rose-700 dark:text-rose-400">Vùng nguy hiểm</h3>
                                    </div>
                                    <p className="text-sm text-rose-600/80 mb-6 font-medium leading-relaxed">
                                        Nếu bạn xóa tài khoản, toàn bộ dữ liệu hiến máu và lịch sử hoạt động sẽ bị xóa vĩnh viễn và không thể khôi phục.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 border border-rose-200 text-rose-600 font-bold rounded-full hover:bg-rose-50 transition-colors shadow-sm"
                                        >
                                            Đăng xuất
                                        </button>
                                        <button className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white font-bold rounded-full hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20">
                                            Xóa tài khoản
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

