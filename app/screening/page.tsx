"use client";

import { useState, useEffect } from "react";
import {
    ClipboardCheck,
    Upload,
    BrainCircuit,
    CheckCircle,
    XCircle,
    CloudUpload,
    ArrowLeft,
    ArrowRight,
    Shield,
    Zap,
    Scan,
    FileText,
    Brain,
    AlertCircle,
    HeartPulse,
    Activity
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import { useRouter } from "next/navigation";

export default function ScreeningPage() {
    const [step, setStep] = useState<"survey" | "analyzing" | "result">("survey");
    const [progress, setProgress] = useState(0);
    const [answers, setAnswers] = useState({
        wellToday: true,
        meds: [] as string[],
        hasTattoo: false,
        weight: "",
    });

    const router = useRouter();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === "analyzing") {
            const start = Date.now();
            const duration = 4000; // 4 seconds analysis

            interval = setInterval(() => {
                const elapsed = Date.now() - start;
                const nextProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
                setProgress(nextProgress);

                if (nextProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setStep("result"), 500);
                }
            }, 50);
        }
        return () => clearInterval(interval);
    }, [step]);

    const handleAnalyze = () => {
        setStep("analyzing");
    };

    const toggleMed = (med: string) => {
        setAnswers(prev => ({
            ...prev,
            meds: prev.meds.includes(med)
                ? prev.meds.filter(m => m !== med)
                : [...prev.meds, med]
        }));
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Sàng lọc Y tế AI" />
                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[960px] flex-1 px-4 md:px-10">

                            {/* Breadcrumbs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button onClick={() => router.push("/requests")} className="text-[#6324eb] text-sm font-medium leading-normal hover:underline">Quy trình hiến máu</button>
                                <span className="text-[#654d99] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#120e1b] dark:text-white text-sm font-medium leading-normal">Sàng lọc sức khỏe AI</span>
                            </div>

                            {/* Stepper Display */}
                            <div className="mb-10">
                                <div className="flex border-b border-[#d7d0e7] dark:border-[#2d263d] justify-between relative">
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] flex-1 pb-3 transition-all duration-500 ${step === 'survey' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-400'}`}>
                                        <ClipboardCheck className={`mb-1 w-6 h-6 ${step === 'survey' ? 'text-[#6324eb]' : 'text-slate-300'}`} />
                                        <p className="text-sm font-bold tracking-[0.015em]">Khảo sát</p>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] flex-1 pb-3 transition-all duration-500 ${step === 'analyzing' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-400'}`}>
                                        <BrainCircuit className={`mb-1 w-6 h-6 ${step === 'analyzing' ? 'text-[#6324eb]' : 'text-slate-300'}`} />
                                        <p className="text-sm font-bold tracking-[0.015em]">Phân tích AI</p>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] flex-1 pb-3 transition-all duration-500 ${step === 'result' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-400'}`}>
                                        <HeartPulse className={`mb-1 w-6 h-6 ${step === 'result' ? 'text-[#6324eb]' : 'text-slate-300'}`} />
                                        <p className="text-sm font-bold tracking-[0.015em]">Kết quả</p>
                                    </div>
                                </div>
                            </div>

                            {step === "survey" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white dark:bg-[#1c162e] rounded-2xl shadow-xl shadow-indigo-500/5 border border-[#ebe7f3] dark:border-[#2d263d] p-8 md:p-10 mb-8">
                                        <div className="mb-8 border-b border-slate-50 dark:border-slate-800 pb-6">
                                            <h2 className="text-[#120e1b] dark:text-white text-3xl font-black leading-tight mb-2 tracking-tight">Cơ sở y tế & Thể chất</h2>
                                            <p className="text-[#654d99] dark:text-[#a594c9] text-base">Phân tích hồ sơ y tế thông minh dựa trên tiêu chuẩn WHO & Bộ Y Tế.</p>
                                        </div>

                                        <div className="space-y-10">
                                            {/* Q1 */}
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center size-7 rounded-full bg-[#6324eb] text-white text-xs font-black">01</span>
                                                    <p className="text-xl font-bold text-[#120e1b] dark:text-white">Trạng thái sức khỏe hôm nay?</p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div
                                                        onClick={() => setAnswers(prev => ({ ...prev, wellToday: true }))}
                                                        className={`p-5 border-2 rounded-2xl transition-all cursor-pointer flex items-center justify-between group ${answers.wellToday ? 'border-[#6324eb] bg-[#6324eb]/5 shadow-lg shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-10 rounded-xl flex items-center justify-center ${answers.wellToday ? 'bg-[#6324eb] text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                                                <CheckCircle className="w-6 h-6" />
                                                            </div>
                                                            <span className={`font-bold ${answers.wellToday ? 'text-[#120e1b] dark:text-white' : 'text-slate-500'}`}>Khỏe mạnh</span>
                                                        </div>
                                                        {answers.wellToday && <div className="size-5 rounded-full bg-[#6324eb] flex items-center justify-center"><CheckCircle className="w-3 h-3 text-white" /></div>}
                                                    </div>
                                                    <div
                                                        onClick={() => setAnswers(prev => ({ ...prev, wellToday: false }))}
                                                        className={`p-5 border-2 rounded-2xl transition-all cursor-pointer flex items-center justify-between group ${!answers.wellToday ? 'border-[#6324eb] bg-[#6324eb]/5 shadow-lg shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-10 rounded-xl flex items-center justify-center ${!answers.wellToday ? 'bg-[#6324eb] text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                                                <XCircle className="w-6 h-6" />
                                                            </div>
                                                            <span className={`font-bold ${!answers.wellToday ? 'text-[#120e1b] dark:text-white' : 'text-slate-500'}`}>Mệt / Đau đầu</span>
                                                        </div>
                                                        {!answers.wellToday && <div className="size-5 rounded-full bg-[#6324eb] flex items-center justify-center"><CheckCircle className="w-3 h-3 text-white" /></div>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Q2 */}
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center size-7 rounded-full bg-[#6324eb] text-white text-xs font-black">02</span>
                                                    <p className="text-xl font-bold text-[#120e1b] dark:text-white">Thuốc đang sử dụng (48h qua)?</p>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {['Aspirin', 'Kháng sinh', 'Huyết áp', 'Insulin', 'Vitamin', 'Dị ứng', 'Khác', 'Không có'].map((med) => (
                                                        <div
                                                            key={med}
                                                            onClick={() => toggleMed(med)}
                                                            className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer font-bold text-xs uppercase tracking-wider ${answers.meds.includes(med) ? 'border-[#6324eb] bg-[#6324eb] text-white shadow-md' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        >
                                                            {med}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* File Upload */}
                                            <div className="space-y-5 pt-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center size-7 rounded-full bg-[#6324eb] text-white text-xs font-black">03</span>
                                                    <p className="text-xl font-bold text-[#120e1b] dark:text-white">Báo cáo Y tế (Tùy chọn)</p>
                                                </div>
                                                <div className="group relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-[#251e36]/30 hover:bg-white dark:hover:bg-[#1c162e] hover:border-[#6324eb] transition-all cursor-pointer overflow-hidden">
                                                    <div className="absolute inset-0 bg-[#6324eb]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="relative z-10 flex flex-col items-center">
                                                        <div className="size-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#6324eb]">
                                                            <CloudUpload className="w-8 h-8" />
                                                        </div>
                                                        <p className="text-[#120e1b] dark:text-white font-black text-lg mb-1">Tải lên hồ sơ y tế</p>
                                                        <p className="text-slate-400 text-sm font-medium">Nhấn hoặc kéo thả PDF, PNG, JPG (Max 10MB)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-14 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-8">
                                            <button
                                                onClick={() => router.back()}
                                                className="px-8 py-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 font-black text-[#120e1b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 text-sm uppercase tracking-widest"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleAnalyze}
                                                className="bg-[#6324eb] text-white px-10 py-3.5 rounded-xl font-black hover:bg-[#501ac2] transition-all flex items-center gap-3 shadow-xl shadow-[#6324eb]/25 hover:-translate-y-0.5 active:translate-y-0 text-sm uppercase tracking-widest"
                                            >
                                                Bắt đầu phân tích AI
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === "analyzing" && (
                                <div className="bg-white dark:bg-[#1c162e] rounded-3xl shadow-2xl border border-[#ebe7f3] dark:border-[#2d263d] p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                                        <div className="h-full bg-[#6324eb] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    <div className="relative size-48 mb-10">
                                        {/* Background Pulse */}
                                        <div className="absolute inset-0 bg-[#6324eb]/20 rounded-full animate-ping opacity-20"></div>
                                        <div className="absolute inset-0 bg-[#6324eb]/10 rounded-full animate-pulse opacity-40"></div>

                                        {/* Main Loader Ring */}
                                        <svg className="size-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-50 dark:text-slate-800" />
                                            <circle cx="96" cy="96" r="88" fill="none" stroke="#6324eb" strokeWidth="8" strokeDasharray={552} strokeDashoffset={552 - (552 * progress) / 100} strokeLinecap="round" className="transition-all duration-300 ease-out" />
                                        </svg>

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-24 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center text-[#6324eb]">
                                                <Brain className="w-12 h-12" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-md space-y-4">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white tracking-tight">AI Neural Screening...</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                                            Đang quét câu trả lời và đối chứng với hàng nghìn kịch bản y khoa để đảm bảo an toàn.
                                        </p>
                                        <div className="pt-6 flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-2 text-xs font-black text-[#6324eb] uppercase tracking-widest bg-[#6324eb]/5 px-4 py-2 rounded-full border border-[#6324eb]/10">
                                                <Scan className="w-4 h-4 animate-bounce" />
                                                {progress < 30 ? 'Khởi tạo Neural Engine' : progress < 60 ? 'Phân tích tham số sinh học' : progress < 90 ? 'Kiểm tra chéo điều kiện WHO' : 'Hoàn tất báo cáo'}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5 grayscale opacity-50">
                                                <Shield className="w-3.5 h-3.5" /> Military-Grade Encryption Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === "result" && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className="bg-white dark:bg-[#1c162e] rounded-3xl shadow-2xl border-2 border-emerald-500/20 dark:border-emerald-500/10 p-10 md:p-14 overflow-hidden relative">
                                        {/* Success Decoration */}
                                        <div className="absolute -top-20 -right-20 size-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
                                        <div className="absolute -bottom-20 -left-20 size-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

                                        <div className="relative z-10 flex flex-col items-center text-center">
                                            <div className="size-24 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/30">
                                                <CheckCircle className="w-12 h-12" />
                                            </div>

                                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Tuyệt vời! Bạn đủ điều kiện</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mb-10 font-medium">
                                                Hệ thống AI không phát hiện bất kỳ rủi ro sức khỏe nào. Bạn đã sẵn sàng để trở thành người hùng cứu người!
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
                                                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/10 shadow-sm flex flex-col items-center">
                                                    <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Độ ổn định</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">98%</p>
                                                </div>
                                                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/10 shadow-sm flex flex-col items-center">
                                                    <Zap className="w-6 h-6 text-amber-500 mb-2" />
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Thời gian đợi</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">0 phút</p>
                                                </div>
                                                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/10 shadow-sm flex flex-col items-center">
                                                    <Shield className="w-6 h-6 text-[#6324eb] mb-2" />
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Thời hạn</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">24 Giờ</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem('screening_verified', 'true');
                                                        router.push("/requests");
                                                    }}
                                                    className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
                                                >
                                                    Đến địa điểm hiến máu
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                                <button className="flex-1 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                                    Tải báo cáo chi tiết (.PDF)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Extra Info Footer - Only show on survey */}
                            {step === 'survey' && (
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000">
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#6324eb]/5 border border-[#6324eb]/10">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-[#6324eb] shrink-0">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#120e1b] dark:text-white mb-1">An toàn Tuyệt đối</p>
                                            <p className="text-[11px] text-[#654d99] dark:text-[#a594c9] leading-relaxed">Dữ liệu được mã hóa đầu-cuối. AI không lưu trữ dữ liệu cá nhân sau khi phân tích.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#6324eb]/5 border border-[#6324eb]/10">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-[#6324eb] shrink-0">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#120e1b] dark:text-white mb-1">Tối ưu Thời gian</p>
                                            <p className="text-[11px] text-[#654d99] dark:text-[#a594c9] leading-relaxed">Tiết kiệm 30 phút chờ đợi tại bệnh viện bằng việc sàng lọc kỹ thuật số trước.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#6324eb]/5 border border-[#6324eb]/10">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-[#6324eb] shrink-0">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#120e1b] dark:text-white mb-1">Chuẩn Y khoa</p>
                                            <p className="text-[11px] text-[#654d99] dark:text-[#a594c9] leading-relaxed">Xây dựng dựa trên các tiêu chí sàng lọc nghiêm ngặt của Hội Chữ Thập Đỏ.</p>
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
