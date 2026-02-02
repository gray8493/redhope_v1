"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { campaignService } from "@/services/campaign.service";
import { useAuth } from "@/context/AuthContext";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { toast } from "sonner";
import {
    Sparkles,
    Zap,
    AlertTriangle,
    CheckCircle,
    Info,
    ArrowLeft,
    Save,
    Calendar,
    Clock,
    Droplet,
    Users,
    MapPin,
    Search,
    BrainCircuit,
    Stethoscope,
    ChevronDown,
    Building2,
    ShieldAlert,
    LayoutGrid,
    Target
} from "lucide-react";
import MiniFooter from "@/components/shared/MiniFooter";
import { Button } from "@/components/ui/button";

// Tải ReactQuill phía client
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-3xl" />
});
import "react-quill-new/dist/quill.snow.css";

const TEMPLATES = [
    {
        id: "emergency",
        name: "Khẩn cấp",
        color: "bg-rose-500",
        data: {
            name: "Yêu cầu Máu Khẩn cấp - Tai nạn & Phẫu thuật",
            desc: "<h3>Tình trạng khẩn cấp!</h3><p>Đơn vị cần bổ sung nguồn máu dự trữ phục vụ các ca phẫu thuật phức tạp và cấp cứu tai nạn. Rất mong sự hỗ trợ từ cộng đồng.</p>",
            targetAmount: "50",
            isUrgent: true,
            startTime: "08:00",
            endTime: "21:00"
        }
    }
];

export default function CreateRequestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const { user, profile } = useAuth();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedBloodTypes, setSelectedBloodTypes] = useState<string[]>(["AB+"]);
    const [isUrgent, setIsUrgent] = useState(false);

    // Form States
    const [campaignName, setCampaignName] = useState("");
    const [mrn, setMrn] = useState("");
    const [organization, setOrganization] = useState("");
    const [targetCount, setTargetCount] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [radius, setRadius] = useState("5km (Lân cận)");
    const [location, setLocation] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [desc, setDesc] = useState("");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("21:00");
    const [image, setImage] = useState<string>("https://images.unsplash.com/photo-1579154235602-3c2ae4762963?q=80&w=2070&auto=format&fit=crop");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile) {
            setOrganization(profile.hospital_name || "");
            setLocation(profile.hospital_address || "");
        }
    }, [profile]);

    const toggleBloodType = (type: string) => {
        setSelectedBloodTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const applyTemplate = (data: any) => {
        setCampaignName(data.name);
        setDesc(data.desc);
        setTargetAmount(data.targetAmount);
        setTargetCount(Math.ceil(Number(data.targetAmount) / 0.8).toString());
        setIsUrgent(data.isUrgent);
        setStartTime(data.startTime);
        setEndTime(data.endTime);
        toast.info("Đã áp dụng mẫu thiết lập");
    };

    const handleSubmit = async () => {
        if (!user?.id) return;
        if (!campaignName || !targetAmount || !selectedDate) {
            toast.error("Vui lòng điền đủ thông tin quan trọng");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                hospital_id: user.id,
                name: campaignName,
                description: desc,
                location: location,
                target_units: Number(targetAmount),
                blood_types: selectedBloodTypes,
                start_date: format(selectedDate, "yyyy-MM-dd"),
                start_time: startTime,
                end_time: endTime,
                urgency_level: isUrgent ? 'Emergency' : 'Standard',
                status: 'Open',
                district: district,
                city: city,
                image_url: image
            };

            await campaignService.createCampaign(payload);
            toast.success("Khởi tạo yêu cầu máu thành công");
            router.push("/hospital-requests");
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi khởi tạo");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-6 md:p-10 text-left medical-gradient min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-med-primary transition-colors mb-2">
                        <ArrowLeft className="size-3" /> Quay lại quản lý
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Trung tâm Điều phối</span>
                        <span className="size-1.5 bg-med-primary rounded-full animate-pulse"></span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight leading-none">Khởi tạo <span className="text-med-primary underline decoration-emerald-200 decoration-8 underline-offset-4">Huy động Máu</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl italic opacity-80">Thiết lập các thông số huy động đơn vị máu phục vụ y tế lâm sàng.</p>
                </div>

                <div className="flex bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-slate-200/50 shadow-sm items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mẫu nhanh:</p>
                    {TEMPLATES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => applyTemplate(t.data)}
                            className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-black text-slate-600 hover:text-med-primary hover:border-med-primary/40 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <span className={`size-1.5 rounded-full ${t.color}`}></span> {t.name}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-10">
                {/* Main Form Body */}
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    <section className="bg-white/80 backdrop-blur-xl rounded-[48px] border border-slate-100 p-10 shadow-med relative overflow-hidden transition-all duration-500">
                        {isUrgent && (
                            <div className="absolute top-0 right-0 p-8">
                                <span className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 animate-pulse">
                                    <Zap className="size-3" /> Chế độ Ưu tiên Cao
                                </span>
                            </div>
                        )}

                        <div className={`mb-12 rounded-[32px] p-6 flex items-center justify-between border transition-all ${isUrgent ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200/60'}`}>
                            <div className="flex items-center gap-5">
                                <div className={`size-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${isUrgent ? 'bg-rose-500' : 'bg-med-primary'}`}>
                                    {isUrgent ? <ShieldAlert className="size-7" /> : <Info className="size-7" />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className={`text-sm font-black uppercase tracking-widest ${isUrgent ? 'text-rose-600' : 'text-med-primary'}`}>
                                        Loại hình Huy động: {isUrgent ? 'KHẨN CẤP' : 'TIÊU CHUẨN'}
                                    </h4>
                                    <p className="text-slate-500 text-xs font-medium italic">
                                        {isUrgent ? 'Hệ thống sẽ gửi thông báo ưu tiên qua SMS & Push cho các tình nguyện viên.' : 'Thông báo hiển thị bình thường trên luồng tin tức công cộng.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsUrgent(!isUrgent)}
                                className={`px-8 h-12 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 border ${isUrgent
                                    ? 'bg-rose-600 text-white border-rose-400 shadow-xl shadow-rose-200'
                                    : 'bg-white text-slate-400 border-slate-200 hover:text-med-primary hover:border-med-primary/40'}`}
                            >
                                {isUrgent ? 'Đang bật' : 'Bật KHẨN CẤP'}
                            </button>
                        </div>

                        <div className="space-y-12">
                            {/* Section 1 */}
                            <div className="space-y-8">
                                <FormSectionHeader number="1" title="Chi tiết Huy động" icon={LayoutGrid} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputItem label="Tên Hoạt động Huy động" value={campaignName} onChange={setCampaignName} placeholder="Ví dụ: Cấp cứu Tai nạn liên hoàn..." />
                                    <InputItem label="Mã Hệ thống (MRN/Event ID)" value={mrn} onChange={setMrn} placeholder="Vd: EV-MED-2024-001" />
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Đơn vị tiếp nhận Công bố</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-med-primary transition-colors" />
                                            <select
                                                value={organization}
                                                onChange={(e) => setOrganization(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-3xl h-14 pl-14 pr-10 text-sm font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all cursor-pointer"
                                            >
                                                <option>{organization}</option>
                                                <option>Cơ chế Phân phối Liên viện</option>
                                                <option>Ngân hàng Máu Trung ương</option>
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="space-y-8">
                                <FormSectionHeader number="2" title="Chỉ tiêu & Loại máu" icon={Droplet} />
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nhóm máu Huy động</label>
                                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleBloodType(type)}
                                                    className={`h-12 rounded-2xl border text-xs font-black transition-all ${selectedBloodTypes.includes(type)
                                                        ? 'bg-med-primary text-white border-med-primary shadow-lg shadow-med-primary/20 scale-105'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-med-primary/30'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden bg-gradient-to-br from-med-primary via-emerald-600 to-teal-700 rounded-[40px] p-8 text-white shadow-2xl shadow-med-primary/30">
                                        <BrainCircuit className="absolute -right-10 -bottom-10 size-64 text-white/10 rotate-12" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                            <div className="flex items-center gap-5 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20">
                                                <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-med-primary shadow-inner">
                                                    <BrainCircuit className="size-8" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-black text-[10px] tracking-widest uppercase">Phân tích Hệ thống</span>
                                                        <span className="size-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                                                    </div>
                                                    <h3 className="text-xl font-medical-header leading-tight">AI Insights</h3>
                                                </div>
                                            </div>
                                            <div className="hidden md:block w-px h-16 bg-white/20"></div>
                                            <div className="flex gap-10">
                                                <AnalyticItem icon={Users} label="Lực lượng cần thiết" value={targetCount || "65"} unit="Donor" />
                                                <AnalyticItem icon={Target} label="Xác suất thành công" value="94" unit="%" />
                                                <div className="hidden lg:flex flex-col gap-1.5">
                                                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Ước tính thời gian</span>
                                                    <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-white/10">
                                                        <Clock className="size-3 text-emerald-300" />
                                                        <span className="text-[11px] font-black">6 - 8 GIỜ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputItem label="Số lượng Tình nguyện viên kỳ vọng" type="number" value={targetCount} onChange={setTargetCount} placeholder="Ví dụ: 65" />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mục tiêu Đơn vị Máu (đv)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={targetAmount}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setTargetAmount(val);
                                                        setTargetCount(Math.ceil(Number(val) / 0.8).toString());
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl h-14 px-8 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all"
                                                    placeholder="Vd: 50"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Blood Units</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="space-y-8">
                                <FormSectionHeader number="3" title="Thời gian & Địa điểm" icon={MapPin} />
                                <div className="space-y-8">
                                    <LocationSelector defaultCity={city} defaultDistrict={district} onCityChange={setCity} onDistrictChange={setDistrict} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2">
                                            <InputItem label="Điểm tiếp nhận cụ thể (Khoa/Phòng/Khu vực)" value={location} onChange={setLocation} icon={Search} placeholder="Vd: Tầng trệt, Tòa nhà A - Khoa Hiến máu..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ngày thực hiện</label>
                                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <button className="w-full h-14 px-8 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between text-sm font-bold group hover:border-med-primary/40 transition-all">
                                                        <span className={selectedDate ? "text-slate-900" : "text-slate-400"}>
                                                            {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày huy động"}
                                                        </span>
                                                        <Calendar className="size-4 text-slate-300 group-hover:text-med-primary transition-colors" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-[32px] overflow-hidden">
                                                    <CalendarComponent mode="single" selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setIsCalendarOpen(false); }} locale={vi} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Bắt đầu</label>
                                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-3xl px-6 text-sm font-bold focus:ring-4 focus:ring-med-primary/5 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Kết thúc</label>
                                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-3xl px-6 text-sm font-bold focus:ring-4 focus:ring-med-primary/5 outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Lời kêu gọi & Chi tiết (Nội dung hiển thị)</label>
                                        <div className="rounded-[32px] overflow-hidden border border-slate-100 bg-white">
                                            <ReactQuill theme="snow" value={desc} onChange={setDesc} className="bg-white min-h-[200px]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 flex justify-end gap-6 border-t border-slate-100 pt-10">
                            <Button onClick={() => router.back()} variant="ghost" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Huỷ bỏ</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="h-16 px-12 bg-med-primary text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-med-primary/30 hover:shadow-med-primary/40 group gap-4 active:scale-95"
                            >
                                <Save className={`size-5 ${isSubmitting ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                                {isSubmitting ? "Đang xử lý..." : "PHÁT ĐỘNG HUY ĐỘNG MÁU"}
                            </Button>
                        </div>
                    </section>
                </div>

                {/* Sidebar Stats / Preview */}
                <div className="col-span-12 lg:col-span-4 space-y-10">
                    <section className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(13,148,136,0.3)_0%,transparent_50%)]"></div>
                        <h3 className="text-xl font-medical-header mb-8 relative z-10 flex items-center gap-3">
                            <Stethoscope className="size-6 text-med-primary" /> Tổng quan Hồ sơ
                        </h3>

                        <div className="space-y-8 relative z-10">
                            <PreviewField label="Đơn vị đăng ký" value={organization} icon={Building2} />
                            <PreviewField label="Trạng thái Ưu tiên" value={isUrgent ? "KHẨN CẤP" : "TIÊU CHUẨN"} icon={Zap} active={isUrgent} />
                            <PreviewField label="Khu vực tác động" value={district ? `${district}, ${city}` : "Chưa chọn vùng"} icon={MapPin} />

                            <div className="pt-8 border-t border-white/10 mt-8">
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Nhóm máu tiếp nhận</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedBloodTypes.map(t => (
                                        <span key={t} className="px-3 py-1.5 bg-white/10 rounded-full text-[11px] font-black border border-white/10">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/80 backdrop-blur-xl rounded-[48px] border border-slate-100 p-10 shadow-med overflow-hidden group">
                        <div className="relative h-64 rounded-[32px] overflow-hidden border border-slate-100 mb-8">
                            <img src={image} className="size-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                            <label className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-xl text-white size-10 flex items-center justify-center rounded-xl cursor-pointer border border-white/20">
                                <Target className="size-4" />
                                <input type="file" className="hidden" />
                            </label>
                        </div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-4">Ghi chú vận hành</h4>
                        <div className="p-6 bg-slate-50 rounded-3xl text-xs text-slate-500 font-medium italic leading-relaxed border border-slate-100">
                            "Mọi yêu cầu máu sẽ được kiểm duyệt bởi Trung tâm Điều phối Khu vực trước khi hiển thị chính thức đến cộng đồng người hiến."
                        </div>
                    </section>
                </div>
            </div>

            <div className="mt-20">
                <MiniFooter />
            </div>
        </main>
    );
}

function FormSectionHeader({ number, title, icon: Icon }: any) {
    return (
        <div className="flex items-center gap-5">
            <div className="size-12 bg-med-primary text-white rounded-2xl flex items-center justify-center font-medical-header text-xl shadow-lg shadow-med-primary/20">{number}</div>
            <div className="flex items-center gap-3">
                <Icon className="size-6 text-med-primary" />
                <h3 className="text-xl font-medical-header text-slate-900 tracking-tight">{title}</h3>
            </div>
        </div>
    );
}

function InputItem({ label, value, onChange, placeholder, icon: Icon, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-med-primary transition-colors" />}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full ${Icon ? 'pl-14' : 'px-8'} pr-6 h-14 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-med-primary/5 focus:border-med-primary outline-none transition-all text-sm font-bold shadow-inner`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}

function AnalyticItem({ icon: Icon, label, value, unit }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase text-white/50 tracking-widest flex items-center gap-1.5">
                <Icon className="size-3" /> {label}
            </span>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">{value}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase">{unit}</span>
            </div>
        </div>
    );
}

function PreviewField({ label, value, icon: Icon, active }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className={`size-10 rounded-xl flex items-center justify-center ${active ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-white/40'}`}>
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">{label}</p>
                <p className={`text-xs font-bold ${active ? 'text-rose-400' : 'text-white/80'}`}>{value || "N/A"}</p>
            </div>
        </div>
    );
}
