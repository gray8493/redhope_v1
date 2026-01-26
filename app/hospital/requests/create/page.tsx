"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addCampaign, Campaign } from "@/app/utils/campaignStorage";
import {
    Sparkles,
    Zap,
    AlertTriangle,
    CheckCircle,
    Info
} from "lucide-react";

// Tải ReactQuill phía client
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-3xl" />
});
import "react-quill-new/dist/quill.snow.css";

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
    const [desc, setDesc] = useState("");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("21:00");
    const [lastChanged, setLastChanged] = useState<'amount' | 'count' | null>(null);

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

    const handleCreate = (isDraft: boolean) => {
        const pTargetAmount = parseFloat(targetAmount) || 0;
        if (!isDraft) {
            if (!campaignName || !location || selectedBloodTypes.length === 0 || !selectedDate || pTargetAmount <= 0) {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
                return;
            }
        }

        const newCampaign: Campaign = {
            id: Date.now(),
            name: campaignName || (isUrgent ? `Yêu cầu Khẩn cấp ${mrn}` : `Yêu cầu mới`),
            desc: desc,
            location: location,
            organization: organization,
            radius: radius,
            target: pTargetAmount,
            bloodType: selectedBloodTypes.length === 1 ? selectedBloodTypes[0] : "Hỗn hợp",
            bloodTypes: selectedBloodTypes,
            bloodClass: "text-slate-600 bg-slate-100",
            status: isUrgent ? "Khẩn cấp" : "Tiêu chuẩn",
            statusClass: isUrgent ? "bg-indigo-600 text-white" : "bg-blue-600 text-white",
            operationalStatus: isDraft ? "Bản nháp" : "Đang hoạt động",
            isUrgent: isUrgent,
            timeLeft: "Vừa đăng",
            progress: 0,
            current: 0,
            completedCount: 0,
            registeredCount: 0,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZiNSYWEy5ZAjxyaFcmn3iOyddBWPAo-t4t2XsfTJGxeJi9pEE3PcQvHukQOiZiZfZKJ_NqFXxSTeco2-MSerQKRL5_r53tmMnHyXvtxhRQzJ-vzOaZ2giorfxNjOUDLlGVHBskP1VPCvzakxwSAOsMZr4J8ReKbJJN6CCOy0gM-ah-B09uje6IwWuV197aU3UNyQYOKs0zvUVmjFBEd3wBkFq6J8WRnVolp_edDc9AwGCPjvU6M1HOqDmErPtLflVEa6odlYKvEr2",
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

    const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <div className="relative flex h-screen w-full flex-col bg-[#FDFCFE] font-sans text-slate-900 antialiased overflow-hidden text-left">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                    <TopNav title="Tạo Yêu cầu Máu" />

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

                                        {/* Smart Insight AI Block */}
                                        <div className="bg-gradient-to-r from-[#6D28D9]/5 to-[#A78BFA]/5 border border-[#6D28D9]/10 rounded-[1.5rem] p-5 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="size-10 bg-[#6D28D9]/10 rounded-2xl flex items-center justify-center text-[#6D28D9]">
                                                    <MaterialIcon name="psychology" className="text-[22px] fill-1" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-[#6D28D9] font-black text-xs tracking-tight">Dự báo thông minh</h3>
                                                    <p className="text-[10px] text-[#6D28D9]/60 font-black uppercase tracking-widest">IA Insight v2.8</p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-px bg-[#6D28D9]/10 hidden md:block"></div>
                                            <div className="flex flex-1 gap-6 justify-around w-full">
                                                <div className="text-center md:text-left">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Cần thiết</p>
                                                    <p className="text-[#6D28D9] text-xl font-black">~{targetCount || "63"} <span className="text-[10px] font-medium text-slate-400 uppercase">người</span></p>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Mục tiêu</p>
                                                    <p className="text-[#6D28D9] text-xl font-black">{targetAmount || "50"} <span className="text-[10px] font-medium text-slate-400 uppercase">đơn vị</span></p>
                                                </div>
                                                <div className="hidden sm:block text-center md:text-left">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Tỉ lệ đạt</p>
                                                    <p className="text-emerald-500 text-xl font-black">80%</p>
                                                </div>
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

                                        {/* Map Visualization */}
                                        <div className="w-full h-52 rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 relative group shadow-lg">
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByvIDTN70XMAX1SWdkUy-gnDtoZseAgFgvqS2YmQ00PVPjTgrdh8o_nKOOAvhyoPfE-CXmPNBnSs4fAy-VQbWTfU9TiEQURHVwxaIkd6CQQYUhYb4S1WPSUAPKfSu_D0fHbxdwl-61mVf5RnxQlUActS5U8abYPvFs2WrQooHfygaMcJHzHH5CDgSeQhTw-pMWRStIMirJq2ESCD4SU0TDuX7fPqVTsKfCId2ke717J1Z_VMXJH8CRbr8vGGnD-a_jBhrVbrr-xbI')" }}></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <MaterialIcon name="location_on" className="text-indigo-500 text-6xl drop-shadow-2xl fill-1 animate-bounce" />
                                            </div>
                                            <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white max-w-[320px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#F5F3FF] p-2.5 rounded-xl text-[#6D28D9] shrink-0">
                                                        <MaterialIcon name="local_hospital" className="text-[20px]" />
                                                    </div>
                                                    <div className="overflow-hidden text-left">
                                                        <p className="text-slate-900 font-black text-[13px] truncate">Bệnh viện Chợ Rẫy</p>
                                                        <p className="text-slate-500 text-[10px] font-bold truncate">201B Nguyễn Chí Thanh, Q5, TP.HCM</p>
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
                                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(e.target.value)}
                                                        className="rounded-full h-12 text-sm border border-slate-300/80 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 px-5 outline-none text-center shadow-sm"
                                                    />
                                                    <span className="text-slate-300 text-[11px] font-black italic px-1 uppercase">đến</span>
                                                    <input
                                                        type="time"
                                                        value={endTime}
                                                        onChange={(e) => setEndTime(e.target.value)}
                                                        className="rounded-full h-12 text-sm border border-slate-300/80 bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/5 px-5 outline-none text-center shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Description */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white text-[12px] font-bold shadow-lg shrink-0">4</span>
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
                </div>
            </div>

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
