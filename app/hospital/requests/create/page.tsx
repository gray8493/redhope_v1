"use client";

import { useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    MapPin,
    Send,
    Save,
    User,
    FileText,
    Activity,
    Clock
} from "lucide-react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { useRouter } from "next/navigation";
import { addCampaign, Campaign } from "@/app/utils/campaignStorage";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { CheckCircle, Zap, Sparkles, ChevronRight, AlertTriangle } from "lucide-react";

// Tải ReactQuill phía client
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-xl" />
});
import "react-quill-new/dist/quill.snow.css";

// --- Dữ liệu Mẫu (Templates) ---
const TEMPLATES = [
    {
        id: "spring",
        name: "Chiến dịch Mùa Xuân",
        icon: <Sparkles className="w-4 h-4" />,
        color: "bg-emerald-500",
        data: {
            name: "Lễ hội Xuân Hồng 2026",
            org: "Cộng đồng (Tất cả)",
            desc: "<h2>Lễ hội Xuân Hồng</h2><p>Hành trình kết nối những trái tim nhân ái, mang lại hy vọng cho những bệnh nhân cần máu trong dịp Tết Nguyên Đán.</p>",
            targetAmount: "250",
            location: "Bệnh viện Đa khoa Thành phố",
            isUrgent: false,
            startTime: "07:30",
            endTime: "16:30"
        }
    },
    {
        id: "emergency",
        name: "Cấp cứu Khẩn cấp",
        icon: <Zap className="w-4 h-4" />,
        color: "bg-red-500",
        data: {
            name: "Yêu cầu Máu Khẩn cấp - Tai nạn Liên hoàn",
            org: "Cộng đồng (Tất cả)",
            desc: "<h3>Tình trạng khẩn cấp!</h3><p>Cần gấp nhóm máu hiếm phục vụ cấp cứu các nạn nhân tai nạn giao thông tại quốc lộ. Rất mong sự hỗ trợ kịp thời từ cộng đồng.</p>",
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
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedBloodTypes, setSelectedBloodTypes] = useState<string[]>([]);
    const [isUrgent, setIsUrgent] = useState(false);
    // Form States
    const [mrn, setMrn] = useState("");
    const [campaignName, setCampaignName] = useState("");
    const [organization, setOrganization] = useState("Cộng đồng (Tất cả)");
    const [targetCount, setTargetCount] = useState(""); // Initialize as string
    const [targetAmount, setTargetAmount] = useState(""); // Initialize as string
    const [radius, setRadius] = useState("5km");
    const [location, setLocation] = useState("");
    const [department, setDepartment] = useState("");
    const [desc, setDesc] = useState("");
    const [startTime, setStartTime] = useState("07:30");
    const [endTime, setEndTime] = useState("16:30");
    const [lastChanged, setLastChanged] = useState<'amount' | 'count' | null>(null);

    // Logic tính toán thông minh hai chiều
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

    const applyTemplate = (templateData: any) => {
        setCampaignName(templateData.name);
        setOrganization(templateData.org);
        setDesc(templateData.desc);
        setTargetAmount(templateData.targetAmount);
        setLocation(templateData.location);
        setIsUrgent(templateData.isUrgent);
        if (templateData.startTime) setStartTime(templateData.startTime);
        if (templateData.endTime) setEndTime(templateData.endTime);
    };

    const handleCreate = (isDraft: boolean) => {
        // Parse numbers
        const pTargetAmount = parseFloat(targetAmount) || 0;
        const pTargetCount = parseInt(targetCount) || 1;

        // Validation for Publish
        if (!isDraft) {
            // Require campaign name and target amount > 0 if publishing
            if (!campaignName || !location || selectedBloodTypes.length === 0 || !selectedDate || pTargetAmount <= 0) {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm Mục tiêu đơn vị)!");
                return;
            }
        }

        const newCampaign: Campaign = {
            id: 0, // Will be generated
            name: campaignName.trim() || (isUrgent ? `Đợt Khẩn cấp ${mrn} ` : `Yêu cầu mới`),
            desc: desc || `Yêu cầu máu tại ${location} `,
            location: location,
            organization: organization,
            radius: organization === "Cộng đồng (Tất cả)" ? radius : undefined, // Only save radius for Community
            target: pTargetAmount, // Use the specific target amount
            bloodType: selectedBloodTypes.length === 1 ? selectedBloodTypes[0] : "Hỗn hợp",
            bloodTypes: selectedBloodTypes,
            bloodClass: "text-slate-600 bg-slate-100 dark:bg-slate-800", // Default logic
            status: isUrgent ? "Khẩn cấp" : "Tiêu chuẩn",
            statusClass: isUrgent ? "bg-red-600 text-white" : "bg-blue-600 text-white",
            operationalStatus: isDraft ? "Bản nháp" : "Đang hoạt động",
            isUrgent: isUrgent,
            timeLeft: isDraft ? "" : "Vừa đăng",
            progress: 0,
            current: 0,
            completedCount: 0,
            registeredCount: 0,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZiNSYWEy5ZAjxyaFcmn3iOyddBWPAo-t4t2XsfTJGxeJi9pEE3PcQvHukQOiZiZfZKJ_NqFXxSTeco2-MSerQKRL5_r53tmMnHyXvtxhRQzJ-vzOaZ2giorfxNjOUDLlGVHBskP1VPCvzakxwSAOsMZr4J8ReKbJJN6CCOy0gM-ah-B09uje6IwWuV197aU3UNyQYOKs0zvUVmjFBEd3wBkFq6J8WRnVolp_edDc9AwGCPjvU6M1HOqDmErPtLflVEa6odlYKvEr2", // Default Image
            date: selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "",
            staffCount: 5,
            startTime: startTime,
            endTime: endTime
        };

        addCampaign(newCampaign);
        router.push("/hospital/campaign");
    };

    const toggleBloodType = (type: string) => {
        setSelectedBloodTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Tạo Yêu cầu Máu Mới" />

                    <main className="flex flex-1 justify-center py-10 px-4">
                        <div className="flex flex-col max-w-[800px] w-full gap-8">
                            {/* Page Heading */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-[#120e1b] dark:text-white text-3xl font-black leading-tight">Tạo Yêu cầu Máu Mới</h1>
                                    <p className="text-slate-500 text-base font-normal">Điền thông tin yêu cầu để thông báo ngay lập tức cho người hiến phù hợp.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mẫu nhanh:</span>
                                    <div className="flex gap-2">
                                        {TEMPLATES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => applyTemplate(t.data)}
                                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-[#6324eb] hover:text-[#6324eb] transition-all shadow-sm"
                                            >
                                                <span className={`w-2 h-2 rounded-full ${t.color}`} />
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={`transition-all duration-500 rounded-xl border p-8 shadow-sm ${isUrgent
                                ? "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/10 border-red-200 dark:border-red-900/50"
                                : "bg-white dark:bg-[#1c162e] border-[#ebe7f3] dark:border-[#2d263d]"
                                }`}>
                                {isUrgent && (
                                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-800 rounded-xl flex items-center gap-3 animate-pulse">
                                        <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
                                        <p className="text-red-700 dark:text-red-300 font-bold text-sm">Chế độ Khẩn cấp đang được bật. Yêu cầu này sẽ được ưu tiên hiển thị hàng đầu!</p>
                                    </div>
                                )}
                                {/* Section 1: Organization & Campaign Information */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">1</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Thông tin Tổ chức / Chiến dịch</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[#120e1b] dark:text-white text-sm font-bold">Tên Chiến dịch <span className="text-red-500">*</span></label>
                                            <input
                                                className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all placeholder:text-slate-400"
                                                placeholder="VD: Hiến máu nhân đạo Mùa Xuân"
                                                type="text"
                                                value={campaignName}
                                                onChange={(e) => setCampaignName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[#120e1b] dark:text-white text-sm font-bold">Đơn vị tổ chức <span className="text-red-500">*</span></label>
                                            <select
                                                className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all"
                                                value={organization}
                                                onChange={(e) => setOrganization(e.target.value)}
                                            >
                                                <option value="Cộng đồng (Tất cả)">Cộng đồng (Công khai)</option>
                                                <option value="Đại học FPT">Đại học FPT</option>
                                                <option value="Công ty FVM">Công ty FVM</option>
                                                <option value="Doanh nghiệp khác">Doanh nghiệp khác</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[#120e1b] dark:text-white text-sm font-bold">Mã quản lý / Sự kiện (MRN)</label>
                                            <input
                                                className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all placeholder:text-slate-400"
                                                placeholder="MRN-123456 (Nếu có)"
                                                type="text"
                                                value={mrn}
                                                onChange={(e) => setMrn(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Requirements */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">2</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Yêu cầu về Máu</h2>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <p className="text-[#120e1b] dark:text-white text-sm font-bold mb-3">Chọn Nhóm máu</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => toggleBloodType(type)}
                                                        className={`flex h-12 items-center justify-center rounded-lg font-bold transition-all border-2 ${selectedBloodTypes.includes(type)
                                                            ? 'bg-[#6324eb] text-white border-[#6324eb] shadow-lg shadow-[#6324eb]/30 scale-105'
                                                            : 'bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white border-transparent hover:border-[#6324eb]/30 hover:bg-[#6324eb]/5'
                                                            } `}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Số lượng người hiến (Dự kiến)</label>
                                                <input
                                                    className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all"
                                                    placeholder="0"
                                                    type="text"
                                                    value={targetCount}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || /^[0-9\b]+$/.test(val)) {
                                                            setLastChanged('count');
                                                            setTargetCount(val);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Mục tiêu (Đơn vị máu) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all pr-12"
                                                        placeholder="0"
                                                        type="text"
                                                        value={targetAmount}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^[0-9\b]+$/.test(val)) {
                                                                setLastChanged('amount');
                                                                setTargetAmount(val);
                                                            }
                                                        }}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Đơn vị</span>
                                                </div>
                                            </div>

                                            {/* Smart Insight UI Block */}
                                            {(targetAmount || targetCount) && (
                                                <div className="md:col-span-2 p-4 bg-[#6324eb]/5 dark:bg-[#6324eb]/10 border border-[#6324eb]/20 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="size-10 rounded-full bg-[#6324eb] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#6324eb]/20">
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <h4 className="text-[#6324eb] dark:text-[#a881f3] text-sm font-bold">Dự báo Thông minh (Smart Insight)</h4>
                                                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                                                            Với tỉ lệ <span className="font-bold text-[#6324eb] dark:text-[#a881f3]">80%</span> người hiến đạt chỉ số sức khỏe tiêu chuẩn:
                                                        </p>
                                                        <div className="mt-2 grid grid-cols-2 gap-4">
                                                            <div className="bg-white dark:bg-[#1c162e] p-2 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] flex flex-col items-center justify-center text-center">
                                                                <span className="text-[10px] uppercase font-bold text-slate-400">Người hiến</span>
                                                                <span className="text-lg font-black text-[#6324eb] dark:text-white">{targetCount || "0"}</span>
                                                            </div>
                                                            <div className="bg-white dark:bg-[#1c162e] p-2 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] flex flex-col items-center justify-center text-center">
                                                                <span className="text-[10px] uppercase font-bold text-slate-400">Đơn vị máu</span>
                                                                <span className="text-lg font-black text-[#6324eb] dark:text-white">≈ {targetAmount || "0"}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-400 text-[10px] italic mt-2">
                                                            * Ví dụ: Nếu có <span className="font-bold">100</span> người đến, dự kiến thu được khoảng <span className="font-bold">80</span> đơn vị máu an toàn.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Mức độ Khẩn cấp</label>
                                                <div className="flex p-1 bg-slate-100 dark:bg-[#251e36] rounded-xl h-12">
                                                    <button
                                                        onClick={() => setIsUrgent(false)}
                                                        className={`flex-1 rounded-lg text-sm font-bold transition-all ${!isUrgent
                                                            ? 'bg-white dark:bg-[#1c162e] shadow-sm text-[#6324eb] dark:text-white border border-slate-200 dark:border-slate-700'
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                            } `}
                                                    >
                                                        Tiêu chuẩn
                                                    </button>
                                                    <button
                                                        onClick={() => setIsUrgent(true)}
                                                        className={`flex-1 rounded-lg text-sm font-bold transition-all ${isUrgent
                                                            ? 'bg-white dark:bg-[#1c162e] shadow-sm text-red-500 border border-slate-200 dark:border-slate-700'
                                                            : 'text-slate-500 hover:text-red-500/70 dark:text-slate-400'
                                                            } `}
                                                    >
                                                        Khẩn cấp
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Location & Logistics */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">3</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Địa điểm & Hậu cần</h2>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Điểm tiếp nhận (Bệnh viện/Trung tâm)</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                        <Search className="text-slate-400 w-5 h-5" />
                                                    </div>
                                                    <input
                                                        className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 pl-10 pr-4 text-base outline-none transition-all placeholder:text-slate-400"
                                                        placeholder="Tìm tên bệnh viện hoặc địa chỉ"
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Conditional Radius Selection */}
                                            {organization === "Cộng đồng (Tất cả)" && (
                                                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <label className="text-[#120e1b] dark:text-white text-sm font-bold">Phạm vi thông báo</label>
                                                    <select
                                                        className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all"
                                                        value={radius}
                                                        onChange={(e) => setRadius(e.target.value)}
                                                    >
                                                        <option value="5km">5km (Lân cận)</option>
                                                        <option value="10km">10km (Quận/Huyện)</option>
                                                        <option value="20km">20km (Thành phố)</option>
                                                        <option value="Toàn hệ thống">Toàn hệ thống</option>
                                                    </select>
                                                    <p className="text-slate-500 text-xs italic">Gửi thông báo cho người hiến trong phạm vi này.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Map Placeholder */}
                                        <div className="w-full h-48 rounded-xl overflow-hidden border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-200 dark:bg-slate-800 relative group">
                                            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/HCMC_map.png/640px-HCMC_map.png')" }}></div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <MapPin className="text-[#6324eb] w-12 h-12 drop-shadow-lg animate-bounce" />
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-[#1c162e]/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-medium shadow-lg border border-white/20">
                                                <p className="text-[#6324eb] font-bold">Bệnh viện Đa khoa Trung tâm</p>
                                                <p className="text-slate-500">452 Đường Nguyễn Y, Quận 1, TP.HCM</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Khoa / Phòng</label>
                                                <input
                                                    className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all placeholder:text-slate-400"
                                                    placeholder="Khoa Huyết học, Phòng 402"
                                                    type="text"
                                                    value={department}
                                                    onChange={(e) => setDepartment(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Ngày tiếp nhận / Thời hạn</label>
                                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                                    <PopoverTrigger asChild>
                                                        <button className="flex w-full items-center justify-between rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white hover:border-[#6324eb] focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all">
                                                            <span className={selectedDate ? "" : "text-slate-400"}>
                                                                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                                            </span>
                                                            <CalendarIcon className="text-slate-400 w-5 h-5" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
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
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Thời gian (Bắt đầu - Kết thúc)</label>
                                                <div className="flex items-center gap-3 h-12">
                                                    <div className="relative flex-1">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                            <Clock className="text-slate-400 w-4 h-4" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 pl-10 pr-4 text-sm font-medium outline-none transition-all"
                                                            placeholder="07:30"
                                                            value={startTime}
                                                            onChange={(e) => setStartTime(e.target.value)}
                                                            onFocus={(e) => (e.target.type = "time")}
                                                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                                        />
                                                    </div>
                                                    <div className="text-slate-400 font-bold"> - </div>
                                                    <div className="relative flex-1">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                            <Clock className="text-slate-400 w-4 h-4" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 pl-10 pr-4 text-sm font-medium outline-none transition-all"
                                                            placeholder="16:30"
                                                            value={endTime}
                                                            onChange={(e) => setEndTime(e.target.value)}
                                                            onFocus={(e) => (e.target.type = "time")}
                                                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Campaign Description */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">4</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Mô tả thông tin chiến dịch</h2>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[#120e1b] dark:text-white text-sm font-bold">Mô tả chi tiết</label>
                                            <div className="quill-container bg-slate-50 dark:bg-[#251e36] rounded-xl overflow-hidden border border-[#ebe7f3] dark:border-[#2d263d]">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={desc}
                                                    onChange={setDesc}
                                                    placeholder="Nhập nội dung chi tiết về chiến dịch của bạn..."
                                                    className="min-h-[200px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Footer Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                    <button
                                        className={`w-full sm:flex-1 h-14 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] ${isUrgent
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                                            : "bg-[#6324eb] hover:bg-[#501ac2] text-white shadow-[#6324eb]/20"
                                            }`}
                                        onClick={() => handleCreate(false)}
                                    >
                                        <Send className="w-5 h-5" />
                                        Đăng Yêu cầu {isUrgent && "KHẨN CẤP"}
                                    </button>
                                    <button
                                        className="w-full sm:w-auto px-8 h-14 bg-slate-100 dark:bg-[#251e36] text-slate-600 dark:text-slate-300 rounded-xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-[#2d263d] transition-all flex items-center justify-center gap-2"
                                        onClick={() => handleCreate(true)}
                                    >
                                        <Save className="w-5 h-5" />
                                        Lưu Nháp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            {/* Custom CSS for Quill fixes */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .quill-container {
                    width: 100% !important;
                }
                .quill-container .ql-toolbar {
                    border-top-left-radius: 12px !important;
                    border-top-right-radius: 12px !important;
                    border-color: #ebe7f3 !important;
                    background: #f8fafc !important;
                    width: 100% !important;
                }
                .quill-container .ql-container {
                    border-bottom-left-radius: 12px !important;
                    border-bottom-right-radius: 12px !important;
                    border-color: #ebe7f3 !important;
                    min-height: 200px !important;
                    font-size: 16px !important;
                    width: 100% !important;
                }
                .quill-container .ql-editor {
                    min-height: 200px !important;
                    padding: 16px !important;
                    line-height: 1.6 !important;
                }
                /* Fix placeholder overlap */
                .quill-container .ql-editor.ql-blank::before {
                    font-style: normal !important;
                    color: #94a3b8 !important;
                    left: 16px !important;
                    right: 16px !important;
                    pointer-events: none !important;
                }
                .quill-container .ql-editor:focus.ql-blank::before {
                    display: none !important;
                }
                /* Dark Mode fixes */
                .dark .quill-container .ql-toolbar {
                    border-color: #2d263d !important;
                    background: #1c162e !important;
                }
                .dark .quill-container .ql-container {
                    border-color: #2d263d !important;
                }
                .dark .quill-container .ql-editor.ql-blank::before {
                    color: #64748b !important;
                }
            ` }} />
        </div>
    );
}
