"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addCampaign, getCampaignById, updateCampaign, Campaign } from "@/lib/campaignStorage"; // Keep for types if needed, or remove later
import { campaignService } from "@/services/campaign.service";
import { useAuth } from "@/context/AuthContext";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { cn } from "@/lib/utils";

import {
    Sparkles,
    Zap,
    AlertTriangle,
    CheckCircle,
    Info,
    Clock,
    CalendarDays
} from "lucide-react";

// Tải ReactQuill phía client
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-3xl" />
});
import "react-quill-new/dist/quill.snow.css";

// Manual Time Input Component (Compact)
const TimeInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const parts = (value || "08:00").split(':');
    const [h, setH] = useState(parts[0] || "08");
    const [m, setM] = useState(parts[1] || "00");

    useEffect(() => {
        const p = (value || "08:00").split(':');
        setH(p[0] || "08");
        setM(p[1] || "00");
    }, [value]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== "" && parseInt(val) > 23) return;
        setH(val);
        if (val.length === 2) onChange(`${val}:${m || '00'}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== "" && parseInt(val) > 59) return;
        setM(val);
        if (val.length === 2) onChange(`${h || '00'}:${val}`);
    };

    const handleBlur = () => {
        const finalH = h.padStart(2, '0');
        const finalM = m.padStart(2, '0');
        setH(finalH);
        setM(finalM);
        onChange(`${finalH}:${finalM}`);
    };

    return (
        <div className="flex items-center justify-center gap-1.5 h-10 w-24 rounded-2xl border border-slate-300 bg-white focus-within:border-[#6D28D9] focus-within:ring-2 focus-within:ring-[#6D28D9]/5 transition-all outline-none">
            <input
                type="text"
                maxLength={2}
                value={h}
                onChange={handleHourChange}
                onBlur={handleBlur}
                className="w-7 bg-transparent text-sm font-bold text-center outline-none text-slate-900"
            />
            <span className="text-slate-300 font-bold text-xs opacity-50">:</span>
            <input
                type="text"
                maxLength={2}
                value={m}
                onChange={handleMinuteChange}
                onBlur={handleBlur}
                className="w-7 bg-transparent text-sm font-bold text-center outline-none text-slate-900"
            />
        </div>
    );
};

// --- Dữ liệu Mẫu (Templates) ---
const TEMPLATES = [
    {
        id: "emergency",
        name: "Khẩn cấp",
        color: "bg-indigo-500",
        data: {
            name: "Yêu cầu Máu Khẩn cấp - Tai nạn liên hoàn",
            org: "Bệnh viện Chợ Rẫy",
            desc: "<h3>Tình trạng khẩn cấp!</h3><p>Cần gấp nhóm máu hiếm phục vụ cấp cứu các nạn nhân tai nạn giao thông. Rất mong sự hỗ trợ kịp thời từ cộng đồng.</p>",
            targetAmount: "50",
            location: "Khoa Cấp cứu - BV Chợ Rẫy",
            isUrgent: true,
            startTime: "08:00",
            endTime: "23:00"
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
    const [organization, setOrganization] = useState("Bệnh viện Chợ Rẫy");
    const [targetCount, setTargetCount] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [radius, setRadius] = useState("5km (Lân cận)");
    const [location, setLocation] = useState("Khoa Cấp cứu - BV Chợ Rẫy");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [desc, setDesc] = useState("");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("21:00");
    const [image, setImage] = useState<string>("");
    const [imageError, setImageError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [lastChanged, setLastChanged] = useState<'amount' | 'count' | null>(null);

    // Initial Load for Edit Mode
    useEffect(() => {
        if (editId) {
            const campaignData = getCampaignById(Number(editId)) as any;
            if (campaignData) {
                setCampaignName(campaignData.name || "");
                setDesc(campaignData.desc || "");
                setLocation(campaignData.location || "");
                setOrganization(campaignData.organization || "Bệnh viện Chợ Rẫy");
                setTargetAmount(campaignData.target?.toString() || "");
                setTargetCount(campaignData.target ? Math.ceil(campaignData.target / 0.8).toString() : "");
                setIsUrgent(campaignData.isUrgent || false);
                setStartTime(campaignData.startTime || "08:00");
                setEndTime(campaignData.endTime || "21:00");
                setRadius(campaignData.radius || "5km (Lân cận)");
                setImage(campaignData.image || "");
                if (campaignData.city) setCity(campaignData.city);
                if (campaignData.district) setDistrict(campaignData.district);

                if (campaignData.bloodTypes && campaignData.bloodTypes.length > 0) {
                    setSelectedBloodTypes(campaignData.bloodTypes);
                }

                if (campaignData.date) {
                    try {
                        // Attempt to parse 'dd/MM/yyyy'
                        const parsedDate = parse(campaignData.date, 'dd/MM/yyyy', new Date());
                        if (!isNaN(parsedDate.getTime())) {
                            setSelectedDate(parsedDate);
                        }
                    } catch (e) {
                        console.error("Error parsing date", e);
                    }
                }
            }
        }
    }, [editId]);


    // Logic tính toán thông minh hai chiều (Smart Insight)
    useEffect(() => {
        if (lastChanged === 'amount') {
            const amount = parseFloat(targetAmount);
            if (!isNaN(amount) && amount > 0) {
                const suggestCount = Math.ceil(amount / 0.8);
                setTargetCount(suggestCount.toString());
            } else if (targetAmount === '') {
                setTargetCount('');
            }
        }
    }, [targetAmount, lastChanged]);

    useEffect(() => {
        if (lastChanged === 'count') {
            const count = parseInt(targetCount);
            if (!isNaN(count) && count > 0) {
                const expectedAmount = (count * 0.8).toFixed(1);
                setTargetAmount(expectedAmount.toString());
            } else if (targetCount === '') {
                setTargetAmount('');
            }
        }
    }, [targetCount, lastChanged]);

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
            processFile(file);
        } else if (file) {
            setImageError("Vui lòng chỉ tải lên file PNG hoặc JPG");
        }
    };

    const processFile = (file: File) => {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            setImageError("Kích thước ảnh quá lớn (tối đa 5MB)");
            return;
        }
        setImageError("");
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.readyState === FileReader.DONE && reader.result) {
                setImage(reader.result as string);
            }
        };
        reader.onerror = () => setImageError("Lỗi khi đọc file ảnh");
        reader.readAsDataURL(file);
    };

    const applyTemplate = (templateData: any) => {
        setCampaignName(templateData.name);
        setOrganization(templateData.org);
        setDesc(templateData.desc);
        setTargetAmount(templateData.targetAmount);
        setLocation(templateData.location);
        setIsUrgent(templateData.isUrgent);
        if (templateData.startTime) setStartTime(templateData.startTime);
        if (templateData.endTime) setEndTime(templateData.endTime);
        setLastChanged('amount'); // Trigger re-calc
    };

    const handleCreate = async (isDraft: boolean) => {
        // Parse float then round to integer because DB expects Integer
        const rawTargetAmount = parseFloat(targetAmount) || 0;
        const pTargetAmount = Math.round(rawTargetAmount); // Changed to round for better accuracy
        console.log("Processing target amount:", { raw: targetAmount, parsed: rawTargetAmount, rounded: pTargetAmount });

        if (!isDraft) {
            if (!campaignName || !location || !selectedDate || pTargetAmount <= 0) {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
                return;
            }
        }

        try {
            if (!user) {
                alert("Vui lòng đăng nhập tài khoản bệnh viện!");
                router.push('/login');
                return;
            }

            // Combine Date + Time
            const startDateTime = selectedDate ? new Date(selectedDate) : new Date();
            const [startH, startM] = startTime.split(':').map(Number);
            startDateTime.setHours(startH, startM, 0, 0);

            const endDateTime = selectedDate ? new Date(selectedDate) : new Date();
            const [endH, endM] = endTime.split(':').map(Number);
            endDateTime.setHours(endH, endM, 0, 0);

            // Construct payload for Supabase 'campaigns' table
            const payload = {
                hospital_id: user.id,
                name: campaignName || (isUrgent ? `Yêu cầu Khẩn cấp ${mrn}` : `Yêu cầu mới`),
                description: desc,
                location_name: location,
                city: city || profile?.city || "Hồ Chí Minh",
                district: district || profile?.district || "Quận 1",
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                target_units: pTargetAmount,
                status: isDraft ? "draft" : "active",
                target_blood_group: selectedBloodTypes // Gửi toàn bộ mảng nhóm máu đã chọn
            };

            // Sync with local storage for demo purposes
            const localStorageCampaign: Campaign = {
                id: editId ? Number(editId) : 0,
                name: campaignName,
                desc: desc,
                location: location,
                bloodType: selectedBloodTypes.length > 1 ? "Hỗn hợp" : selectedBloodTypes[0] || "Tất cả",
                bloodClass: isUrgent ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                status: isUrgent ? "KHẨN CẤP" : "TIÊU CHUẨN",
                statusClass: isUrgent ? "bg-red-600 text-white" : "bg-blue-500 text-white",
                operationalStatus: isDraft ? "Bản nháp" : "Đang hoạt động",
                isUrgent: isUrgent,
                timeLeft: "Hôm nay",
                progress: 0,
                target: pTargetAmount,
                current: 0,
                image: image || "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000",
                date: selectedDate ? format(selectedDate, "dd/MM/yyyy") : "",
                startTime: startTime,
                endTime: endTime,
                bloodTypes: selectedBloodTypes,
                organization: organization,
                radius: radius
            };

            console.log("Submitting campaign:", payload);

            if (editId) {
                await campaignService.updateCampaign(editId, payload);
                updateCampaign(localStorageCampaign);
                alert("Cập nhật chiến dịch thành công!");
            } else {
                await campaignService.createCampaign(payload);
                addCampaign(localStorageCampaign);
                alert("Tạo chiến dịch mới thành công!");
            }

            router.push("/hospital-campaign"); // Redirect to campaign list
        } catch (error: any) {
            console.error("Failed to create campaign:", error);
            alert(`Lỗi khi tạo chiến dịch: ${error.message || "Vui lòng thử lại"}`);
        }
    };

    const toggleBloodType = (type: string) => {
        setSelectedBloodTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <div className="flex flex-col w-full min-h-full font-sans text-slate-900 antialiased text-left">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <main className="flex flex-1 justify-center py-10 px-6">
                <div className="flex flex-col max-w-[840px] w-full gap-8">

                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-slate-900 text-3xl font-black tracking-tight">Tạo Yêu cầu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6]">Máu Mới</span></h1>
                            <p className="text-slate-500 text-sm font-medium">Hệ thống AI sẽ tự động điều phối tới người hiến tiềm năng nhất.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Mẫu nhanh:</span>
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => applyTemplate(t.data)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full text-[12px] font-bold text-slate-600 hover:border-[#6D28D9]/40 hover:text-[#6D28D9] transition-all shadow-sm"
                                >
                                    <span className={`size-2 rounded-full ${t.color}`}></span> {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className={`bg-white border rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 ${isUrgent ? 'border-indigo-300 shadow-indigo-500/10' : 'border-slate-200'}`}>

                        {/* Emergency Toggle Banner */}
                        <div className={`mb-10 rounded-2xl p-5 flex items-center justify-between border transition-all ${isUrgent ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200/60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isUrgent ? 'bg-indigo-500 animate-pulse shadow-indigo-200' : 'bg-indigo-500 shadow-indigo-200'}`}>
                                    <MaterialIcon name={isUrgent ? "priority_high" : "check"} className="font-black" />
                                </div>
                                <div className="flex flex-col">
                                    <p className={`text-sm font-black uppercase tracking-tight ${isUrgent ? 'text-indigo-600' : 'text-indigo-600'}`}>
                                        Chế độ {isUrgent ? 'Khẩn cấp' : 'Tiêu chuẩn'}
                                    </p>
                                    <p className="text-slate-500 text-[13px] font-medium">
                                        {isUrgent ? 'Ưu tiên cao nhất qua SMS & App Push.' : 'Thông báo bình thường tới cộng đồng.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsUrgent(!isUrgent)}
                                className={`px-6 py-2.5 rounded-full text-xs font-black transition-all border-2 active:scale-95 ${isUrgent
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                            >
                                {isUrgent ? 'Đang bật' : 'Bật KHẨN CẤP'}
                            </button>
                        </div>

                        {/* Section 1: Tổ chức */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white text-[12px] font-bold shadow-lg shrink-0">1</span>
                                <h2 className="text-slate-900 text-lg font-black tracking-tight">Thông tin Tổ chức</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 text-[13px] font-bold ml-4">Tên Chiến dịch <span className="text-indigo-500">*</span></label>
                                    <input
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                        className="rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 transition-all px-6 outline-none shadow-sm"
                                        placeholder="Yêu cầu Máu Khẩn cấp..."
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 text-[13px] font-bold ml-4">Mã Quản lý / Sự Kiện</label>
                                    <input
                                        value={mrn}
                                        onChange={(e) => setMrn(e.target.value)}
                                        className="rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 transition-all px-6 outline-none shadow-sm"
                                        placeholder="Vd: EV-2024-001"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-slate-700 text-[13px] font-bold ml-4">Đơn vị tiếp nhận <span className="text-indigo-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            className="w-full rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 transition-all px-6 outline-none appearance-none shadow-sm"
                                        >
                                            <option>Bệnh viện Chợ Rẫy</option>
                                            <option>Cộng đồng (Công khai)</option>
                                            <option>Hội Chữ Thập Đỏ</option>
                                            <option>Đại học FPT</option>
                                        </select>
                                        <MaterialIcon name="expand_more" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Blood Requirements */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="section-number flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white text-[12px] font-bold shadow-lg shrink-0">2</span>
                                <h2 className="text-slate-900 text-lg font-black tracking-tight">Yêu cầu về Máu</h2>
                            </div>
                            <div className="flex flex-col gap-8">
                                <div>
                                    <p className="text-slate-700 text-[13px] font-bold mb-4 ml-4">Nhóm máu cần thiết</p>
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => toggleBloodType(type)}
                                                className={`flex h-11 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${selectedBloodTypes.includes(type)
                                                    ? 'bg-[#F5F3FF] border-[#6D28D9] text-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 scale-105 border-2'
                                                    : 'bg-white border-slate-300 text-slate-500 hover:border-[#6D28D9]/30 hover:bg-[#F5F3FF]/30 hover:text-[#6D28D9]'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Smart Insight AI Block - Re-designed to avoid overlap */}
                                <div className="relative group overflow-hidden bg-gradient-to-br from-[#6D28D9] via-[#8B5CF6] to-[#7C3AED] rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200/50">
                                    {/* AI Pattern Overlay */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <MaterialIcon name="neurology" className="text-8xl" />
                                    </div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                                            <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-[#6D28D9] shadow-inner">
                                                <MaterialIcon name="psychology" className="text-[28px] fill-1" />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-black text-sm tracking-tight">AI PREDICT</h3>
                                                    <span className="flex size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                </div>
                                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Active Scan Optimized</p>
                                            </div>
                                        </div>

                                        <div className="hidden md:block h-12 w-px bg-white/20"></div>

                                        <div className="flex flex-1 gap-8 justify-around w-full">
                                            <div className="text-center md:text-left flex flex-col">
                                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1.5">Nhu cầu thực tế</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-white text-3xl font-black">{targetCount || "63"}</span>
                                                    <span className="text-[11px] font-bold text-white/50 uppercase">Donors</span>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-left flex flex-col">
                                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1.5">Hiệu suất kỳ vọng</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-white text-3xl font-black">92</span>
                                                    <span className="text-[11px] font-bold text-white/50 uppercase">%</span>
                                                </div>
                                            </div>
                                            <div className="hidden lg:flex text-center md:text-left flex flex-col">
                                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1.5">Trạng thái kho</p>
                                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 mt-1">
                                                    <div className="size-2 rounded-full bg-red-400 animate-pulse"></div>
                                                    <span className="text-[11px] font-bold text-white">SẮP CẠN KIỆT</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated Progress Bar at Bottom */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-2/3 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 text-[13px] font-bold ml-4">Số lượng người hiến dự kiến</label>
                                        <input
                                            type="number"
                                            value={targetCount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setLastChanged('count');
                                                setTargetCount(val);
                                            }}
                                            className="rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 px-6 outline-none shadow-sm"
                                            placeholder="Vd: 63"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 text-[13px] font-bold ml-4">Mục tiêu (Đơn vị) <span className="text-indigo-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={targetAmount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setLastChanged('amount');
                                                    setTargetAmount(val);
                                                }}
                                                className="w-full rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 pl-6 pr-16 outline-none shadow-sm"
                                                placeholder="50"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase tracking-widest">Đơn vị</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Logistics */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white text-[12px] font-bold shadow-lg shrink-0">3</span>
                                <h2 className="text-slate-900 text-lg font-black tracking-tight">Địa điểm & Hậu cần</h2>
                            </div>
                            <div className="flex flex-col gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="md:col-span-2">
                                        <LocationSelector
                                            defaultCity={city}
                                            defaultDistrict={district}
                                            onCityChange={setCity}
                                            onDistrictChange={setDistrict}
                                        />
                                    </div>
                                    <div className={`flex flex-col gap-2 ${organization !== "Cộng đồng (Công khai)" ? "md:col-span-2" : ""}`}>
                                        <label className="text-slate-700 text-[13px] font-bold ml-4">Điểm tiếp nhận</label>
                                        <div className="relative">
                                            <MaterialIcon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                                            <input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 pl-12 pr-6 outline-none shadow-sm"
                                                placeholder="Khoa Cấp cứu - BV Chợ Rẫy"
                                            />
                                        </div>
                                    </div>

                                    {organization === "Cộng đồng (Công khai)" && (
                                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-slate-700 text-[13px] font-bold ml-4">Phạm vi thông báo</label>
                                            <div className="relative">
                                                <select
                                                    value={radius}
                                                    onChange={(e) => setRadius(e.target.value)}
                                                    className="w-full rounded-full h-12 text-sm border border-slate-300 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 px-6 outline-none appearance-none shadow-sm"
                                                >
                                                    <option>5km (Lân cận)</option>
                                                    <option>10km (Toàn thành phố)</option>
                                                    <option>Toàn quốc</option>
                                                </select>
                                                <MaterialIcon name="expand_more" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Map Visualization - Fixed Layout to avoid overlap */}
                                <div className="w-full h-64 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50 relative group shadow-2xl">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')" }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>

                                    {/* Scan Effect Overlay */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(109,40,217,0.05)_100%)] pointer-events-none"></div>

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <span className="absolute -inset-8 bg-indigo-500/20 rounded-full animate-ping"></span>
                                            <MaterialIcon name="location_on" className="text-indigo-500 text-6xl drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] fill-1 z-10" />
                                        </div>
                                    </div>

                                    {/* Glass Info Card - Repositioned for visibility */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                                <MaterialIcon name="local_hospital" className="text-[22px] fill-1" />
                                            </div>
                                            <div className="overflow-hidden text-left">
                                                <p className="text-slate-900 font-extrabold text-[15px] truncate tracking-tight">{profile?.hospital_name || "Bệnh viện Đã Chọn"}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <MaterialIcon name="pin_drop" className="text-[12px] text-indigo-500" />
                                                    <p className="text-slate-500 text-[11px] font-bold truncate tracking-wide">
                                                        {district ? `${district}, ${city}` : "Vị trí tiếp nhận đã xác minh"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 text-[13px] font-bold ml-4">Ngày diễn ra</label>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <button className="flex w-full items-center justify-between rounded-full h-12 text-sm border border-slate-300/80 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 px-6 outline-none transition-all text-left shadow-sm">
                                                    <span className={selectedDate ? "font-bold" : "text-slate-400"}>
                                                        {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày..."}
                                                    </span>
                                                    <MaterialIcon name="calendar_month" className="text-slate-400 text-lg" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-slate-200" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={(date) => {
                                                        setSelectedDate(date);
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 text-[13px] font-bold ml-4">Thời gian tổ chức</label>
                                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl w-fit border border-slate-100 ml-4">
                                            <TimeInput
                                                value={startTime}
                                                onChange={setStartTime}
                                            />
                                            <span className="text-slate-300 font-bold opacity-30 select-none px-1">~</span>
                                            <TimeInput
                                                value={endTime}
                                                onChange={setEndTime}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Image */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white text-[12px] font-bold shadow-lg shrink-0">4</span>
                                <h2 className="text-slate-900 text-lg font-black tracking-tight">Hình ảnh hiển thị</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                <label className="text-slate-700 text-[13px] font-bold ml-4">Ảnh bìa chiến dịch</label>
                                <div className="w-full">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="campaign-image"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                processFile(file);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="campaign-image"
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                        onDrop={handleFileDrop}
                                        className={`w-full h-64 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${image ? 'border-transparent' : isDragging ? 'border-[#6D28D9] bg-[#F5F3FF]' : 'border-slate-300 hover:border-[#6D28D9] hover:bg-slate-50'}`}
                                    >
                                        {image ? (
                                            <>
                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }}></div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                                        <MaterialIcon name="edit" className="text-lg" /> Thay đổi ảnh
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <div className={`size-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-[#6D28D9]/10 text-[#6D28D9]' : 'bg-slate-100'}`}>
                                                    <MaterialIcon name="add_photo_alternate" className="text-3xl" />
                                                </div>
                                                <p className={`text-sm font-bold ${isDragging ? 'text-[#6D28D9]' : ''}`}>{isDragging ? 'Thả file để tải lên' : 'Nhấn để tải ảnh lên'}</p>
                                                <p className="text-xs">Hoặc kéo thả file vào đây (PNG, JPG)</p>
                                            </div>
                                        )}
                                    </label>
                                    {imageError && (
                                        <div className="mt-2 text-xs text-red-500 font-bold ml-4">
                                            {imageError}
                                        </div>
                                    )}
                                    <div className="flex justify-end mt-2">
                                        {image && (
                                            <button
                                                onClick={() => setImage("")}
                                                className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <MaterialIcon name="delete" className="text-sm" /> Xóa ảnh
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 5: Description */}
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white text-[12px] font-bold shadow-lg shrink-0">5</span>
                                <h2 className="text-slate-900 text-lg font-black tracking-tight">Chi tiết Chiến dịch</h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 text-[13px] font-bold ml-4 mb-2">Lời kêu gọi & Thông tin thêm</label>
                                <div className="quill-wrapper rounded-[2.5rem] overflow-hidden border border-slate-300 shadow-sm bg-white">
                                    <ReactQuill
                                        theme="snow"
                                        value={desc}
                                        onChange={setDesc}
                                        placeholder="Viết nội dung truyền cảm hứng tới người hiến..."
                                        className="min-h-[220px]"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
                            <button
                                onClick={() => handleCreate(false)}
                                className={`w-full sm:flex-[2] h-15 h-14 rounded-full font-black text-base shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-95 ${isUrgent
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'
                                    : 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'}`}
                            >
                                <MaterialIcon name="send" className="text-[20px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Đăng Yêu cầu {isUrgent ? 'KHẨN CẤP' : 'Công khai'}
                            </button>
                            <button
                                onClick={() => handleCreate(true)}
                                className="w-full sm:flex-1 h-14 bg-slate-100 text-slate-600 rounded-full font-black text-base hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <MaterialIcon name="drafts" className="text-[20px]" />
                                Lưu bản nháp
                            </button>
                        </div>
                    </div>

                    {/* Page Footer */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 pb-14 border-t border-slate-100 pt-8">
                        <p className="text-[11px] text-slate-400 font-bold tracking-wide">© 2024 REDHOPE HEALTH SYSTEMS. BẢO MẬT CHUẨN AES-256.</p>
                        <div className="flex gap-8">
                            <a className="text-[11px] text-slate-500 font-black hover:text-[#6D28D9] transition-all underline decoration-slate-200 underline-offset-4" href="#">Trung tâm Hướng dẫn</a>
                            <a className="text-[11px] text-slate-500 font-black hover:text-[#6D28D9] transition-all underline decoration-slate-200 underline-offset-4" href="#">Yêu cầu Hỗ trợ</a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Styled JSX for UI consistency */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .quill-wrapper .ql-toolbar {
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    padding: 12px 24px !important;
                    background: #fbfbfc !important;
                }
                .quill-wrapper .ql-container {
                    border: none !important;
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                    font-size: 14px !important;
                }
                .quill-wrapper .ql-editor {
                    padding: 24px !important;
                    min-height: 220px !important;
                }
                .quill-wrapper .ql-editor.ql-blank::before {
                    left: 24px !important;
                    font-style: normal !important;
                    color: #94a3b8 !important;
                }
                input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.5);
                    cursor: pointer;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
                }
                .fill-1 {
                    font-variation-settings: 'FILL' 1 !important;
                }
            `}} />
        </div>
    );
}
