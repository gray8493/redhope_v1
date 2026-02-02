"use client";

import { useState, useEffect, Suspense } from "react";
import MiniFooter from "@/components/shared/MiniFooter";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Shield,
    Bell,
    Save,
    Camera,
    Image as ImageIcon,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    RefreshCw,
    LocateFixed,
    AlertCircle,
    UserCircle,
    Activity,
    Smartphone,
    Trash2,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

function SettingsContent() {
    const { profile } = useAuth();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);

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
    const [cover, setCover] = useState<string | null>("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop");

    // Notification State
    const [emailAlert, setEmailAlert] = useState(true);
    const [newDonorAlert, setNewDonorAlert] = useState(false);
    const [shortfallThreshold, setShortfallThreshold] = useState(20);

    // Security State
    const [showPassword, setShowPassword] = useState(false);

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
            if (data.cover) setCover(data.cover);

            if (data.notifications) {
                setEmailAlert(data.notifications.emailAlert ?? true);
                setNewDonorAlert(data.notifications.newDonorAlert ?? false);
                setShortfallThreshold(data.notifications.shortfallThreshold ?? 20);
            }
        } else if (profile) {
            setHospitalName(profile.hospital_name || "");
            setPhone(profile.phone || "");
            setAddress(profile.hospital_address || "");
            setLicense(profile.license_number || "");
            setEmail(profile.email || "");
        }
    }, [profile]);

    const handleSave = async (section: string) => {
        setIsSaving(true);
        const loadingToast = toast.loading(`Đang cập nhật cấu hình ${section}...`);

        try {
            const currentData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
            const updatedData = {
                ...currentData,
                name: hospitalName,
                desc: hospitalDesc,
                phone,
                address,
                license,
                email,
                logo,
                cover,
                notifications: {
                    emailAlert,
                    newDonorAlert,
                    shortfallThreshold
                }
            };

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
            window.dispatchEvent(new Event("hospitalProfileUpdated"));

            await new Promise(resolve => setTimeout(resolve, 800));

            toast.success("Thành công", {
                id: loadingToast,
                description: "Mọi thay đổi đã được áp dụng và lưu trữ.",
            });
        } catch (error: any) {
            toast.error("Lỗi", {
                id: loadingToast,
                description: "Không thể lưu cấu hình. Vui lòng thử lại.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') setLogo(reader.result as string);
                else setCover(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-6 md:p-10 text-left medical-gradient">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Quản trị Hệ thống</span>
                        <span className="size-1.5 bg-med-primary rounded-full animate-pulse"></span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight leading-none">Thiết lập <span className="text-med-primary underline decoration-emerald-200 decoration-8 underline-offset-4">Đơn vị</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl italic opacity-80">Chỉnh sửa hồ sơ năng lực, cấu hình thông báo và quản lý an ninh tài khoản.</p>
                </div>
            </header>

            <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-[24px] border border-slate-200/50 shadow-med mb-10 inline-flex">
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserCircle} label="Hồ sơ Bệnh viện" />
                <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={Bell} label="Thông báo" />
                <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Bảo mật" />
            </div>

            {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8 pb-20">
                    {/* Visual Branding Section */}
                    <section className="relative group/cover">
                        <div className="h-72 md:h-[400px] w-full rounded-[48px] overflow-hidden relative border border-slate-200 bg-slate-100 shadow-med">
                            {cover && <img src={cover} alt="Banner" className="w-full h-full object-cover transition-transform duration-1000 group-hover/cover:scale-105" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            <label className="absolute bottom-8 right-8 flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/30 cursor-pointer active:scale-95 shadow-2xl group/btn">
                                <Camera className="size-4 group-hover/btn:rotate-12 transition-transform" /> Thay đổi ảnh bìa
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
                            </label>

                            <div className="absolute bottom-10 left-10 md:left-56 space-y-2 hidden md:block">
                                <h3 className="text-3xl font-medical-header text-white drop-shadow-lg">{hospitalName || "Tên Bệnh viện"}</h3>
                                <p className="text-white/80 text-sm max-w-xl font-medium line-clamp-1 italic">{hospitalDesc}</p>
                            </div>
                        </div>

                        {/* Floating Logo */}
                        <div className="absolute -bottom-12 left-12 group/logo">
                            <div className="size-32 md:size-40 bg-white rounded-[40px] p-2 shadow-2xl border-8 border-slate-50 overflow-hidden relative">
                                <div className="size-full rounded-[32px] overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                                    {logo ? <img src={logo} alt="Logo" className="size-full object-cover" /> : <Building2 className="size-16 text-med-primary/30" />}
                                    <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer text-white gap-2">
                                        <Camera className="size-6" />
                                        <span className="text-[10px] font-black uppercase">Cập nhật</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Info Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card title="Thông tin Nhận diện" icon={Activity}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputBlock label="Tên Đơn vị Y tế" value={hospitalName} onChange={setHospitalName} placeholder="Ví dụ: Bệnh viện Đa khoa Quốc tế" />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 px-1">Mã Giấy phép (License)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                            <input className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 text-slate-400 font-mono text-sm cursor-not-allowed" value={license || "LC-RED-HOS-99"} readOnly />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 px-1">Sứ mệnh & Giới thiệu</label>
                                        <textarea
                                            value={hospitalDesc}
                                            onChange={(e) => setHospitalDesc(e.target.value)}
                                            rows={4}
                                            className="w-full px-8 py-5 rounded-[32px] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all text-sm font-medium resize-none shadow-inner"
                                            placeholder="Mô tả ngắn về bệnh viện..."
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card title="Liên hệ & Pháp lý" icon={Mail}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputBlock label="Email Đạt chuẩn" value={email} onChange={setEmail} placeholder="admin@hospital.com" icon={Mail} />
                                    <InputBlock label="Đường dây nóng" value={phone} onChange={setPhone} placeholder="028.XXXX.XXXX" icon={Phone} />
                                    <div className="md:col-span-2">
                                        <InputBlock label="Địa chỉ Trụ sở chính" value={address} onChange={setAddress} placeholder="Số 123, Đường ABC, TP.HCM" icon={MapPin} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Location Preview */}
                        <div className="space-y-8">
                            <Card title="Định vị Bản đồ" icon={MapPin}>
                                <div className="relative rounded-[32px] overflow-hidden group/map border border-slate-100 h-[480px] shadow-inner bg-slate-50">
                                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" className="size-full object-cover grayscale opacity-40 group-hover/map:opacity-60 group-hover/map:scale-105 transition-all duration-1000" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="size-16 bg-med-primary rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(13,148,136,0.4)] border-4 border-white animate-bounce">
                                            <MapPin className="size-8 fill-current" />
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6 right-6">
                                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[24px] border border-white shadow-2xl">
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <LocateFixed className="size-3 text-med-primary" /> Điểm thu nhận máu
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Vị trí này sẽ hiển thị trên ứng dụng của người hiến máu để hỗ trợ chỉ đường GPS.</p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 right-6">
                                        <Button className="bg-white/90 hover:bg-white text-med-primary rounded-2xl border border-slate-100 font-black text-[10px] uppercase h-12 px-6 shadow-xl">Ghim Vị Trí Mới</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end pt-10 border-t border-slate-200">
                        <Button
                            onClick={() => handleSave('Hồ sơ')}
                            disabled={isSaving}
                            className="h-16 px-12 bg-med-primary text-white rounded-3xl font-black text-sm uppercase tracking-[0.1em] shadow-xl shadow-med-primary/30 hover:shadow-med-primary/40 group gap-4 active:scale-95"
                        >
                            <Save className={`size-5 transition-transform ${isSaving ? 'animate-spin' : 'group-hover:rotate-12'}`} />
                            {isSaving ? "Đang xử lý..." : "Cập nhật Hồ sơ Bệnh viện"}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl space-y-8">
                    <Card title="Quản lý Cảnh báo" icon={Bell}>
                        <div className="space-y-6">
                            <ToggleItem
                                title="Hệ thống Cảnh báo Hiệu suất"
                                desc="Tự động phát hiện và thông báo khi tỉ lệ thu hồi máu đạt dưới mức tối thiểu."
                                active={emailAlert}
                                onToggle={() => setEmailAlert(!emailAlert)}
                                icon={Activity}
                            />

                            {emailAlert && (
                                <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 space-y-10 mt-6 animate-in slide-in-from-top-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Ngưỡng Báo động Khẩn cấp</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-7xl font-medical-header text-med-primary tracking-tighter">{shortfallThreshold}</span>
                                                <span className="text-2xl font-black text-slate-300">%</span>
                                            </div>
                                        </div>
                                        <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                                <AlertCircle className="size-4" /> Kích hoạt chế độ SOS
                                            </span>
                                        </div>
                                    </div>

                                    <input
                                        type="range" min="5" max="50" step="5"
                                        value={shortfallThreshold}
                                        onChange={(e) => setShortfallThreshold(Number(e.target.value))}
                                        className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-med-primary transition-all"
                                    />

                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium italic">
                                        <div className="size-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shrink-0">
                                            <CheckCircle2 className="size-5 text-emerald-500" />
                                        </div>
                                        <p>Hệ thống sẽ gửi yêu cầu huy động nguồn lực từ trung tâm điều phối khi đạt mốc <span className="text-med-primary font-black underline">{shortfallThreshold}%</span> thiếu hụt.</p>
                                    </div>
                                </div>
                            )}

                            <div className="h-px bg-slate-100 my-4"></div>

                            <ToggleItem
                                title="Thông báo Người hiến Thực tế"
                                desc="Gửi tin nhắn đẩy (Push Notifications) thời gian thực khi đơn vị có đăng ký mới."
                                active={newDonorAlert}
                                onToggle={() => setNewDonorAlert(!newDonorAlert)}
                                icon={Smartphone}
                            />
                        </div>
                    </Card>

                    <div className="flex justify-end pt-6">
                        <Button
                            onClick={() => handleSave('Thông báo')}
                            disabled={isSaving}
                            className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl group gap-3"
                        >
                            <RefreshCw className={`size-4 ${isSaving ? 'animate-spin' : ''}`} /> Lưu Cấu hình
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl space-y-8">
                    <Card title="Thay đổi Mật khẩu" icon={Shield}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mật khẩu Hiện tại</label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full px-8 py-4 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all font-bold group-hover:border-slate-200 shadow-inner"
                                            placeholder="••••••••"
                                        />
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-med-primary transition-colors">
                                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mật khẩu Mới</label>
                                    <input type="password" className="w-full px-8 py-4 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all font-bold shadow-inner" placeholder="Tối thiểu 8 ký tự" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Xác nhận Mật khẩu Mới</label>
                                    <input type="password" className="w-full px-8 py-4 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all font-bold shadow-inner" placeholder="Nhập lại mật khẩu" />
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-6 p-10 bg-amber-50 rounded-[40px] border border-amber-100 relative overflow-hidden group">
                                <Shield className="absolute -right-8 -bottom-8 size-48 text-amber-200/40 rotate-12 transition-transform group-hover:rotate-0" />
                                <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-xl border border-amber-50 relative z-10">
                                    <AlertCircle className="size-7" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h4 className="text-xl font-medical-header text-amber-900">An toàn Tài khoản</h4>
                                    <p className="text-xs text-amber-700/80 font-semibold leading-relaxed">Khi thay đổi mật khẩu, tất cả các phiên đăng nhập khác của bệnh viện sẽ được tự động đăng xuất để duy trì tính bảo mật cao nhất.</p>
                                </div>
                                <ul className="space-y-3 relative z-10">
                                    <li className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest"><CheckCircle2 className="size-3" /> Mã hóa đa tầng</li>
                                    <li className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest"><CheckCircle2 className="size-3" /> Nhật ký đăng nhập 24/7</li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <Card title="Quản lý Thiết bị" icon={Smartphone}>
                        <div className="space-y-4">
                            {[
                                { name: "MacBook Pro M2 - TP.HCM", status: "Đang hoạt động", current: true },
                                { name: "iPhone 15 Pro Max - Hà Nội", status: "Hoạt động 2 giờ trước", current: false }
                            ].map((dev, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-med-primary/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`size-12 rounded-2xl flex items-center justify-center ${dev.current ? 'bg-med-primary text-white shadow-lg shadow-med-primary/20' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                            <Smartphone className="size-6" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-900">{dev.name} {dev.current && <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Của bạn</span>}</h5>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{dev.status}</p>
                                        </div>
                                    </div>
                                    {!dev.current && (
                                        <button className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="size-4" /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex justify-end pt-6">
                        <Button className="h-14 px-10 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all">Cập nhật Bảo mật</Button>
                    </div>
                </div>
            )}

            <div className="mt-20">
                <MiniFooter />
            </div>
        </main>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active
                ? 'bg-med-primary text-white shadow-xl shadow-med-primary/20 scale-105'
                : 'text-slate-400 hover:text-slate-600'
                }`}
        >
            <Icon className={`size-4 ${active ? 'animate-pulse' : ''}`} />
            {label}
        </button>
    );
}

function Card({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[48px] border border-slate-100 shadow-med hover:shadow-med-hover transition-all group">
            <div className="flex items-center gap-4 mb-10">
                <div className="size-14 bg-med-primary/10 text-med-primary rounded-[24px] flex items-center justify-center border border-med-primary/5 group-hover:scale-110 transition-transform">
                    <Icon className="size-7" />
                </div>
                <h3 className="text-2xl font-medical-header text-slate-900 tracking-tight">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InputBlock({ label, value, onChange, placeholder, icon: Icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 px-1">{label}</label>
            <div className="relative group/input">
                {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/input:text-med-primary transition-colors" />}
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full ${Icon ? 'pl-14' : 'px-8'} pr-6 py-4.5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all text-sm font-bold shadow-inner group-hover/input:border-slate-200`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}

function ToggleItem({ title, desc, active, onToggle, icon: Icon }: any) {
    return (
        <div className="flex items-start justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:bg-white transition-all">
            <div className="flex items-start gap-6">
                <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-med-primary shadow-sm border border-slate-100">
                    <Icon className="size-7" />
                </div>
                <div>
                    <h4 className="text-lg font-medical-header text-slate-900 mb-1">{title}</h4>
                    <p className="text-xs text-slate-500 font-medium italic max-w-md">{desc}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative flex items-center w-16 h-8 transition duration-300 ease-in-out rounded-full px-1 ${active ? 'bg-med-primary' : 'bg-slate-300 shadow-inner'}`}
            >
                <div className={`size-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${active ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black animate-pulse text-med-primary">ĐANG TẢI CẤU HÌNH...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
