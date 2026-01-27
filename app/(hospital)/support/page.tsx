"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Stethoscope,
    Users,
    Package,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowLeft,
    Timer,
    Send,
    Search,
    Filter,
    MapPin,
    Calendar,
    ChevronRight,
    Loader2,
    Activity,
    ArrowRight,
    Info,
    Moon,
    Sun,
    Bell
} from "lucide-react";
import { HospitalSidebar } from "@/components/shared/HospitalSidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { getSupportRequests, updateSupportRequest, subscribeToSupportUpdates, SupportRequest } from "@/app/utils/supportStorage";

export default function SupportManagementPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
    const [etaValue, setEtaValue] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processing" | "completed">("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        setRequests(getSupportRequests());
        const unsubscribe = subscribeToSupportUpdates(() => {
            setRequests(getSupportRequests());
        });

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // setDarkMode(true);
        }

        return () => unsubscribe();
    }, []);

    const handleProcess = (req: SupportRequest) => {
        setSelectedRequest(req);
        setEtaValue(req.eta || "");
    };

    const handleSubmitEta = () => {
        if (!selectedRequest || !etaValue) return;

        setIsSubmitting(true);

        setTimeout(() => {
            const updated: SupportRequest = {
                ...selectedRequest,
                status: "processing",
                eta: etaValue
            };
            updateSupportRequest(updated);
            setSelectedRequest(null);
            setEtaValue("");
            setIsSubmitting(false);
        }, 800);
    };

    const handleComplete = (req: SupportRequest) => {
        const updated: SupportRequest = {
            ...req,
            status: "completed"
        };
        updateSupportRequest(updated);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "doctor": return <Stethoscope className="w-8 h-8" />;
            case "staff": return <Users className="w-8 h-8" />;
            case "supply": return <Package className="w-8 h-8" />;
            case "emergency": return <AlertTriangle className="w-8 h-8" />;
            default: return <Activity className="w-8 h-8" />;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending": return { label: "Đang chờ", class: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" };
            case "processing": return { label: "Đang hỗ trợ", class: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" };
            case "completed": return { label: "Hoàn thành", class: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" };
            default: return { label: "Không xác định", class: "bg-slate-100 dark:bg-slate-800 text-slate-500" };
        }
    };

    const filteredRequests = requests.filter(r => filterStatus === "all" || r.status === filterStatus);

    return (
        <div className={`relative flex h-screen w-full flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .glass-effect {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.8);
                }
                .dark .glass-effect {
                    background: rgba(15, 23, 42, 0.8);
                }
            `}</style>

            <div className="flex h-full grow flex-row overflow-hidden">
                <HospitalSidebar />

                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                    {/* Refined Header */}
                    <header className="h-20 bg-white/80 dark:bg-slate-900/80 glass-effect border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40 transition-all">
                        <div className="flex items-center gap-8">
                            <h2 className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">Phòng Xử lý Yêu cầu Chi viện</h2>
                            <div className="relative hidden md:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    className="pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-[#6339F9] focus:ring-0 rounded-2xl w-[350px] text-sm font-medium transition-all outline-none"
                                    placeholder="Tìm bệnh viện hoặc điểm hiến máu..."
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className="relative w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-extrabold leading-none mb-1">Alex Rivera</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Trưởng kíp trực</p>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-[#6339F9] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#6339F9]/20">
                                    AR
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full">
                        <div className="mb-10 space-y-4">
                            <button
                                onClick={() => router.push('/hospital')}
                                className="flex items-center gap-2 text-slate-400 hover:text-[#6339F9] transition-all text-[11px] font-extrabold tracking-[0.2em] uppercase group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Quay lại Bảng điều khiển
                            </button>
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white">Điều phối Hỗ trợ Chiến dịch</h1>
                                {requests.filter(r => r.status === 'pending').length > 0 && (
                                    <span className="bg-indigo-500 text-white text-[11px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg shadow-indigo-500/20">
                                        {requests.filter(r => r.status === 'pending').length} Yêu cầu mới
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-2xl">
                                Hệ thống tiếp nhận và phản hồi nhân lực, vật tư y tế cho các điểm hiến máu đang vận hành cao điểm.
                            </p>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                {/* Filters Tabs */}
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] w-fit shadow-inner">
                                    {[
                                        { id: "all", label: "Tất cả" },
                                        { id: "pending", label: "Chờ xử lý" },
                                        { id: "processing", label: "Đang hỗ trợ" },
                                        { id: "completed", label: "Hoàn thành" }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setFilterStatus(tab.id as any)}
                                            className={`px-8 py-2.5 rounded-[18px] text-[13px] font-black uppercase tracking-wider transition-all ${filterStatus === tab.id
                                                ? "bg-white dark:bg-slate-700 text-[#6339F9] dark:text-white shadow-xl"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Requests List */}
                                <div className="space-y-4">
                                    {filteredRequests.length > 0 ? filteredRequests.map((req) => {
                                        const status = getStatusConfig(req.status);
                                        return (
                                            <div
                                                key={req.id}
                                                className={`group bg-white dark:bg-slate-900 border-2 transition-all duration-300 p-8 rounded-[40px] hover:shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-center ${req.status === 'pending'
                                                    ? 'border-indigo-100 dark:border-indigo-900/30 ring-1 ring-indigo-50 dark:ring-0 shadow-xl shadow-indigo-500/5'
                                                    : 'border-slate-50 dark:border-slate-800'
                                                    }`}
                                            >
                                                <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${req.status === 'pending' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}>
                                                    {getTypeIcon(req.type)}
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-[900] uppercase tracking-widest ${status.class}`}>
                                                            {status.label}
                                                        </span>
                                                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight">
                                                            {req.campaignName}
                                                        </h3>
                                                    </div>
                                                    <p className={`text-[15px] font-bold italic leading-relaxed ${req.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        "{req.message}"
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 tracking-tighter">
                                                            <Clock className="w-4 h-4" /> {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        {req.type === 'doctor' && req.status === 'pending' && (
                                                            <div className="flex items-center gap-2 text-[11px] font-black uppercase text-indigo-500 tracking-tighter">
                                                                <AlertTriangle className="w-4 h-4" /> Ưu tiên y tế cao
                                                            </div>
                                                        )}
                                                        {req.eta && (
                                                            <div className="flex items-center gap-2 text-[11px] font-black uppercase text-amber-500 tracking-tighter">
                                                                <Timer className="w-4 h-4" /> Dự kiến đến: {req.eta}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 self-stretch md:self-center flex flex-col justify-center">
                                                    {req.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleProcess(req)}
                                                            className="bg-[#6339F9] hover:bg-[#522ed9] text-white font-black px-8 py-4 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#6339F9]/30 hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-0"
                                                        >
                                                            <span>Xử lý ngay</span>
                                                            <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    ) : req.status === 'processing' ? (
                                                        <button
                                                            onClick={() => handleComplete(req)}
                                                            className="border-2 border-[#6339F9] text-[#6339F9] hover:bg-[#6339F9] hover:text-white font-black px-8 py-4 rounded-3xl transition-all"
                                                        >
                                                            Kết thúc hỗ trợ
                                                        </button>
                                                    ) : (
                                                        <div className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black rounded-3xl flex items-center gap-2 opacity-60 italic text-sm">
                                                            <CheckCircle2 className="w-5 h-5" /> Đã chi viện
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="py-24 bg-white dark:bg-slate-900 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                                <CheckCircle2 className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Mọi điểm vận hành ổn định</h3>
                                            <p className="text-slate-400 text-sm mt-2 italic font-medium">Hiện tại không có yêu cầu chi viện khẩn cấp nào.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Sidebar */}
                            <div className="col-span-12 lg:col-span-4 space-y-8">
                                {selectedRequest ? (
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border-2 border-[#6339F9]/30 shadow-2xl shadow-[#6339F9]/10 sticky top-28 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="space-y-2 text-center">
                                            <div className="w-20 h-20 bg-[#6339F9] text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#6339F9]/20">
                                                {getTypeIcon(selectedRequest.type)}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Thực thi Chi viện</h3>
                                            <p className="text-[10px] font-black text-[#6339F9] uppercase tracking-[0.2em]">{selectedRequest.campaignName}</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Tiếp nhận yêu cầu:</p>
                                                <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed tracking-tight">
                                                    "{selectedRequest.message}"
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 block">Thời gian tiếp cận (ETA):</label>
                                                <div className="relative group">
                                                    <Timer className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6339F9] transition-colors" />
                                                    <input
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#6339F9] rounded-3xl py-4.5 pl-14 pr-6 text-sm font-black placeholder:text-slate-300 outline-none transition-all shadow-inner"
                                                        placeholder="VD: 15 phút, 11:30..."
                                                        value={etaValue}
                                                        onChange={(e) => setEtaValue(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-4">
                                                <button
                                                    disabled={!etaValue || isSubmitting}
                                                    onClick={handleSubmitEta}
                                                    className="w-full py-5 bg-[#6339F9] text-white rounded-3xl font-black uppercase tracking-widest text-[13px] shadow-xl shadow-[#6339F9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                                    Xác nhận phản hồi
                                                </button>
                                                <button
                                                    onClick={() => setSelectedRequest(null)}
                                                    className="w-full py-5 text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-[11px] transition-all"
                                                >
                                                    Hủy thao tác
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 sticky top-28">
                                        <div className="bg-gradient-to-br from-[#6339F9] to-[#8844FF] p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-[#6339F9]/40">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>

                                            <div className="relative z-10 space-y-8">
                                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center">
                                                    <Clock className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-3xl font-[900] tracking-tight leading-tight uppercase">Quy trình<br />Phản hồi 5 Phút</h3>
                                                    <p className="text-white/80 text-[13px] font-medium leading-relaxed italic">
                                                        Mục tiêu phản hồi ETA trong vòng 120 giây. Sự hiện diện y tế kịp thời giúp tối ưu hóa công suất lấy máu thêm 25%.
                                                    </p>
                                                </div>
                                                <div className="pt-8 border-t border-white/10 space-y-4">
                                                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em] opacity-60">
                                                        <span>Tổng yêu cầu xử lý</span>
                                                        <span className="text-2xl font-black italic">{requests.length}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-[0.2em] opacity-60">
                                                        <span>Thời gian trung bình</span>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-black italic">~105</span>
                                                            <span className="ml-1 text-[10px]">GIÂY</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
                                            <h4 className="font-black text-xs uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
                                                <Info className="w-5 h-5 text-[#6339F9]" /> Hướng dẫn Vận hành
                                            </h4>
                                            <ul className="space-y-4">
                                                <li className="flex gap-4 items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6339F9] mt-2 shrink-0"></div>
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                                        Ưu tiên các yêu cầu y tế (Bác sĩ) tại điểm có lưu lượng &gt; 25 ca/giờ.
                                                    </p>
                                                </li>
                                                <li className="flex gap-4 items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6339F9] mt-2 shrink-0"></div>
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                                        Sử dụng hotline nội bộ khi đội chi viện không thể tiếp cận trong 30 phút.
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="fixed bottom-10 right-10 w-14 h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full shadow-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:scale-110 transition-all z-50 group hover:border-[#6339F9]"
            >
                {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 group-hover:text-[#6339F9]" />}
            </button>
        </div>
    );
}
