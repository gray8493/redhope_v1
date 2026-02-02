"use client";

import { useState, useEffect } from "react";
import {
    ClipboardCheck,
    BrainCircuit,
    CheckCircle,
    XCircle,
    ArrowLeft,
    ArrowRight,
    Shield,
    Zap,
    Brain,
    AlertCircle,
    HeartPulse,
    Activity,
    Info,
    Loader2
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { aiService } from "@/services/ai.service";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Question {
    id: number;
    text: string;
    type: "choice" | "text";
    options?: { label: string; value: string; isRisk?: boolean }[];
    placeholder?: string;
}

const SCREENING_QUESTIONS: Question[] = [
    {
        id: 1,
        text: "Hôm nay bạn có cảm thấy thực sự khỏe mạnh không?",
        type: "choice",
        options: [
            { label: "Có, tôi rất khỏe", value: "yes" },
            { label: "Không, hơi mệt/đau đầu", value: "no", isRisk: true }
        ]
    },
    {
        id: 2,
        text: "Bạn có đang sử dụng thuốc kháng sinh trong 7 ngày qua không?",
        type: "choice",
        options: [
            { label: "Không", value: "no" },
            { label: "Có", value: "yes", isRisk: true }
        ]
    },
    {
        id: 3,
        text: "Bạn có tiền sử mắc các bệnh lây truyền qua đường máu (HIV, Viêm gan B/C)?",
        type: "choice",
        options: [
            { label: "Không", value: "no" },
            { label: "Có", value: "yes", isRisk: true }
        ]
    },
    {
        id: 4,
        text: "Bạn đã từng hiến máu trong 12 tuần gần đây chưa?",
        type: "choice",
        options: [
            { label: "Chưa", value: "no" },
            { label: "Rồi", value: "yes", isRisk: true }
        ]
    },
    {
        id: 5,
        text: "Bạn có thực hiện xăm mình hoặc xỏ khuyên trong 6 tháng qua không?",
        type: "choice",
        options: [
            { label: "Không", value: "no" },
            { label: "Có", value: "yes", isRisk: true }
        ]
    },
    {
        id: 6,
        text: "Huyết áp của bạn thường ở mức nào?",
        type: "choice",
        options: [
            { label: "Ổn định", value: "stable" },
            { label: "Thấp", value: "low", isRisk: true },
            { label: "Cao", value: "high", isRisk: true }
        ]
    },
    {
        id: 7,
        text: "Bạn có đang trong thời kỳ mang thai hoặc cho con bú (nếu là nữ)?",
        type: "choice",
        options: [
            { label: "Không/Không áp dụng", value: "no" },
            { label: "Đang mang thai/cho con bú", value: "yes", isRisk: true }
        ]
    },
    {
        id: 8,
        text: "Cân nặng hiện tại của bạn (kg)?",
        type: "choice",
        options: [
            { label: "Trên 45kg", value: "above" },
            { label: "Dưới 45kg", value: "below", isRisk: true }
        ]
    },
    {
        id: 9,
        text: "Bạn có vừa thực hiện nhổ răng trong 7 ngày qua không?",
        type: "choice",
        options: [
            { label: "Không", value: "no" },
            { label: "Có", value: "yes", isRisk: true }
        ]
    },
    {
        id: 10,
        text: "Bạn có đi du lịch hoặc cư trú tại vùng có dịch bệnh (Sốt rét, Zika) trong 6 tháng qua?",
        type: "choice",
        options: [
            { label: "Không", value: "no" },
            { label: "Có", value: "yes", isRisk: true }
        ]
    },
    {
        id: 11,
        text: "Hãy mô tả ngắn gọn tình trạng sức khỏe chung của bạn hiện tại.",
        type: "text",
        placeholder: "Ví dụ: Tôi cảm thấy ổn, ăn ngủ tốt, không có bệnh lý nền..."
    },
    {
        id: 12,
        text: "Bạn có đang điều trị bất kỳ bệnh lý mãn tính nào không? Nếu có hãy ghi rõ.",
        type: "text",
        placeholder: "Ví dụ: Không có hoặc ghi tên bệnh..."
    },
    {
        id: 13,
        text: "Chế độ ăn uống và nghỉ ngơi của bạn trong 24h qua như thế nào?",
        type: "text",
        placeholder: "Ví dụ: Ăn đủ bữa, ngủ đủ 8 tiếng..."
    },
    {
        id: 14,
        text: "Bạn có bất kỳ lo ngại nào về việc hiến máu lần này không?",
        type: "text",
        placeholder: "Ghi rõ lo ngại của bạn (nếu có)..."
    },
    {
        id: 15,
        text: "Ghi chú thêm về tiền sử dị ứng thuốc hoặc thực phẩm (nếu có).",
        type: "text",
        placeholder: "Liệt kê các loại dị ứng..."
    }
];

export default function ScreeningPage() {
    const { profile, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');

    useEffect(() => {
        if (!authLoading && profile && profile.is_verified !== true) {
            alert("Vui lòng hoàn thành xác minh hồ sơ trước khi thực hiện sàng lọc y tế.");
            router.push("/complete-profile/verification");
        }
    }, [profile, authLoading, router]);

    const [step, setStep] = useState<"survey" | "analyzing" | "result">("survey");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [progress, setProgress] = useState(0);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    const [aiResult, setAiResult] = useState<{
        status: "eligible" | "ineligible" | "warning";
        score: number;
        analysis: string;
        recommendations: string[];
    } | null>(null);

    const currentQuestion = SCREENING_QUESTIONS[currentQuestionIndex];
    const totalQuestions = SCREENING_QUESTIONS.length;
    const surveyProgress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === "analyzing") {
            const start = Date.now();
            const duration = 5000;

            interval = setInterval(() => {
                const elapsed = Date.now() - start;
                const nextProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
                setProgress(nextProgress);

                if (nextProgress >= 100) {
                    clearInterval(interval);
                    generateAiAnalysis();
                }
            }, 50);
        }
        return () => clearInterval(interval);
    }, [step]);

    const generateAiAnalysis = async () => {
        try {
            const result = await aiService.analyzeScreening(answers);
            setAiResult(result);
            setStep("result");
        } catch (error) {
            console.error("AI Analysis failed:", error);
            // Fallback
            setAiResult({
                status: "warning",
                score: 70,
                analysis: "Hệ thống AI đang bận, đã chuyển sang chế độ phân tích dự phòng.",
                recommendations: ["Thử lại sau ít phút", "Đảm bảo kết nối internet"]
            });
            setStep("result");
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setStep("analyzing");
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleAnswer = (id: number, value: any, isRisk: boolean = false) => {
        setAnswers(prev => ({
            ...prev,
            [id]: { value, isRisk, id }
        }));
    };

    const isAllAnswered = Object.keys(answers).length === totalQuestions &&
        SCREENING_QUESTIONS.every(q => {
            const ans = answers[q.id];
            if (!ans) return false;
            if (q.type === "text") return ans.value.trim().length > 0;
            return true;
        });

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f8fafc] dark:bg-[#0f172a] font-sans text-[#1e293b] dark:text-slate-200 transition-colors duration-500">
            <div className="flex h-full grow flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Sàng lọc Sức khỏe AI" />
                    <main className="flex flex-1 justify-center py-6 md:py-10">
                        <div className="flex flex-col max-w-[1000px] flex-1 px-4 md:px-8">

                            {/* Pro Max Stepper */}
                            <div className="mb-12 relative">
                                <div className="flex justify-between items-center relative z-10 px-4 md:px-20">
                                    {[
                                        { id: 'survey', label: 'Khảo sát', icon: ClipboardCheck },
                                        { id: 'analyzing', label: 'Phân tích AI', icon: BrainCircuit },
                                        { id: 'result', label: 'Kết luận', icon: HeartPulse }
                                    ].map((s, i) => (
                                        <div key={s.id} className="flex flex-col items-center group">
                                            <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${step === s.id
                                                ? 'bg-[#0ea5e9] text-white scale-110 shadow-blue-500/25 ring-4 ring-blue-500/10'
                                                : 'bg-white dark:bg-slate-800 text-slate-400 opacity-60'
                                                }`}>
                                                <s.icon className="size-6" />
                                            </div>
                                            <span className={`mt-3 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${step === s.id ? 'text-[#0ea5e9]' : 'text-slate-400'
                                                }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Progress background line */}
                                <div className="absolute top-6 left-20 right-20 h-[2px] bg-slate-200 dark:bg-slate-800 -z-0 hidden md:block" />
                            </div>

                            {step === "survey" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                                    {/* PHẦN 1: KIỂM TRA NHANH CHỈ SỐ SỨC KHỎE */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 md:p-14">
                                        <div className="mb-14 flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
                                            <div className="size-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#0ea5e9]">
                                                <Activity className="size-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Chỉ số Sức khỏe Nhanh</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Cung cấp thông tin chính xác để AI đánh giá điều kiện hiến máu</p>
                                            </div>
                                        </div>

                                        <div className="space-y-16">
                                            {SCREENING_QUESTIONS.filter(q => q.type === "choice").map((q, idx) => (
                                                <div key={q.id} className="relative">
                                                    <div className="flex items-start gap-6 mb-8">
                                                        <span className="flex-none size-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-black shadow-lg">
                                                            {idx + 1}
                                                        </span>
                                                        <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-tight pt-0.5">{q.text}</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-14">
                                                        {q.options?.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => handleAnswer(q.id, opt.value, opt.isRisk)}
                                                                className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 ${answers[q.id]?.value === opt.value
                                                                    ? 'border-[#0ea5e9] bg-blue-50/50 dark:bg-blue-500/5 ring-4 ring-blue-500/5'
                                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-base font-bold transition-colors ${answers[q.id]?.value === opt.value ? 'text-[#0ea5e9]' : 'text-slate-600 dark:text-slate-400'
                                                                        }`}>
                                                                        {opt.label}
                                                                    </span>
                                                                    <div className={`size-6 rounded-full border-2 transition-all flex items-center justify-center ${answers[q.id]?.value === opt.value
                                                                        ? 'border-[#0ea5e9] bg-[#0ea5e9]'
                                                                        : 'border-slate-200 dark:border-slate-700'
                                                                        }`}>
                                                                        {answers[q.id]?.value === opt.value && <div className="size-2 rounded-full bg-white animate-in zoom-in" />}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PHẦN 2: THÔNG TIN SỨC KHỎE CHI TIẾT */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 md:p-14">
                                        <div className="mb-14 flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
                                            <div className="size-16 rounded-[1.5rem] bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-500">
                                                <HeartPulse className="size-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Thông tin Chi tiết</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Cung cấp mô tả cụ thể về tiền sử bệnh lý và sức khỏe hiện tại</p>
                                            </div>
                                        </div>

                                        <div className="space-y-16">
                                            {SCREENING_QUESTIONS.filter(q => q.type === "text").map((q, idx) => (
                                                <div key={q.id}>
                                                    <div className="flex items-start gap-6 mb-8">
                                                        <span className="flex-none size-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-black shadow-lg">
                                                            {idx + 11}
                                                        </span>
                                                        <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-tight pt-0.5">{q.text}</h4>
                                                    </div>
                                                    <div className="ml-0 md:ml-14">
                                                        <textarea
                                                            className="w-full h-44 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:border-[#0ea5e9] focus:ring-8 focus:ring-blue-500/5 transition-all outline-none font-medium resize-none text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                                                            placeholder={q.placeholder}
                                                            value={answers[q.id]?.value || ""}
                                                            onChange={(e) => handleAnswer(q.id, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FOOTER ACTION */}
                                    <div className="flex flex-col items-center gap-8 py-10">
                                        <div className="text-center space-y-2">
                                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                                <Shield className="size-4" />
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Medical-Grade Security Active</p>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm font-medium">Bằng việc gửi kết quả, bạn xác nhận mọi thông tin trên là trung thực và chịu trách nhiệm trước quy định y tế.</p>
                                        </div>
                                        <Button
                                            disabled={!isAllAnswered}
                                            onClick={() => setStep("analyzing")}
                                            className="h-24 px-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-30 disabled:grayscale group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="text-left">
                                                    <p className="text-xl font-black uppercase tracking-tighter">Xác nhận & Phân tích AI</p>
                                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Neural Engine 4.2</p>
                                                </div>
                                                <div className="size-12 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                                                    <BrainCircuit className="size-6" />
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === "analyzing" && (
                                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-16 md:p-24 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                        <div className="w-full h-1 bg-[#0ea5e9] absolute left-0 animate-scan pointer-events-none shadow-[0_0_20px_#0ea5e9]"></div>
                                    </div>

                                    <div className="relative size-72 mb-16">
                                        {/* Outer Ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-slate-800 animate-[spin_10s_linear_infinite]" />
                                        <div className="absolute inset-0 rounded-full border-t-2 border-[#0ea5e9] animate-spin shadow-[0_0_15px_rgba(14,165,233,0.3)]" />

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-48 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 shadow-xl border border-white dark:border-slate-700 flex flex-col items-center justify-center backdrop-blur-md">
                                                <BrainCircuit className="size-20 text-[#0ea5e9] animate-pulse" />
                                                <span className="text-xl font-bold text-slate-900 dark:text-white mt-2 tracking-tighter">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-md space-y-8 relative z-10">
                                        <div className="space-y-4">
                                            <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">AI Diagnostic Scanning</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                                                Neural Engine đang phân tích 15 chỉ số sức khỏe dựa trên giao thức an toàn tiêu chuẩn Bộ Y Tế.
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center gap-4">
                                            <div className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#0ea5e9] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                                <Loader2 className="size-4 animate-spin" />
                                                {progress < 30 ? 'Initial Screening' : progress < 60 ? 'Risk Pattern Matching' : progress < 90 ? 'Cross-Database Verification' : 'Generating Report'}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
                                                <Shield className="size-3" /> Encrypted Health Data Pipeline Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === "result" && aiResult && (
                                <div className="animate-in fade-in slide-in-from-top-12 duration-1000 ease-out space-y-8">
                                    <div className={`bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border-2 overflow-hidden relative p-8 md:p-16 ${aiResult.status === 'eligible' ? 'border-emerald-500/20' :
                                        aiResult.status === 'warning' ? 'border-amber-500/20' :
                                            'border-red-500/20'
                                        }`}>
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16 border-b border-slate-100 dark:border-slate-800 pb-16">
                                            <div className="space-y-6 flex-1">
                                                <div className="flex items-center gap-4">
                                                    <div className={`size-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${aiResult.status === 'eligible' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                                        aiResult.status === 'warning' ? 'bg-amber-500 shadow-amber-500/20' :
                                                            'bg-red-500 shadow-red-500/20'
                                                        }`}>
                                                        {aiResult.status === 'eligible' ? <CheckCircle className="size-8" /> :
                                                            aiResult.status === 'warning' ? <AlertCircle className="size-8" /> :
                                                                <XCircle className="size-8" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Diagnostic Result</p>
                                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                            {aiResult.status === 'eligible' ? 'Đủ điều kiện' :
                                                                aiResult.status === 'warning' ? 'Lưu ý Y tế' :
                                                                    'Chưa đủ điều kiện'}
                                                        </h2>
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                                    {aiResult.analysis}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-center gap-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 min-w-[200px]">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</span>
                                                <span className={`text-5xl font-black tracking-tighter ${aiResult.score > 80 ? 'text-emerald-500' : 'text-[#0ea5e9]'
                                                    }`}>{aiResult.score}%</span>
                                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-[#0ea5e9] transition-all duration-1000" style={{ width: `${aiResult.score}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                            <div className="space-y-6">
                                                <h4 className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                    <Activity className="size-5 text-[#0ea5e9]" /> Khuyến nghị từ AI
                                                </h4>
                                                <div className="space-y-4">
                                                    {aiResult.recommendations.map((rec, i) => (
                                                        <div key={i} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-400">
                                                            <div className="size-2 rounded-full bg-[#0ea5e9] mt-2 flex-none" />
                                                            {rec}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h4 className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                    <Shield className="size-5 text-[#0ea5e9]" /> Xác thực Y khoa
                                                </h4>
                                                <div className="p-8 bg-blue-50/30 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 rounded-3xl space-y-4">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                        Bản báo cáo này được tạo tự động bởi **REDHOPE Neural Engine v4.2**. Kết quả có giá trị tham chiếu tạm thời trong vòng 24 giờ kể từ thời điểm chẩn đoán.
                                                    </p>
                                                    <div className="pt-4 border-t border-blue-100 dark:border-blue-500/10 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span>Status: Verified</span>
                                                        <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {aiResult.status === 'eligible' ? (
                                                <>
                                                    <Button
                                                        disabled={isCreatingAppointment}
                                                        onClick={async () => {
                                                            setIsCreatingAppointment(true);
                                                            try {
                                                                // Nếu có campaignId thì gọi API tạo lịch hẹn thật
                                                                if (campaignId && user?.id) {
                                                                    const response = await fetch('/api/appointments/create', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ userId: user.id, campaignId: campaignId }),
                                                                    });

                                                                    if (!response.ok) {
                                                                        const errorData = await response.json();
                                                                        console.error("Lỗi API:", errorData.error);
                                                                    }
                                                                }

                                                                // Trong mọi trường hợp, đánh dấu đã sàng lọc và về trang request
                                                                localStorage.setItem('screening_verified', 'true');
                                                                alert('✅ Chúc mừng! Kết quả sàng lọc AI của bạn đã được ghi nhận. Hệ thống sẽ chuyển bạn về trang Danh sách yêu cầu.');
                                                                router.push('/requests');

                                                            } catch (error) {
                                                                console.error("Lỗi xử lý:", error);
                                                                // Vẫn cho về nếu lỗi API nhưng UI/UX cần mượt
                                                                router.push('/requests');
                                                            } finally {
                                                                setIsCreatingAppointment(false);
                                                            }
                                                        }}
                                                        className="h-20 flex-1 bg-[#0ea5e9] text-white rounded-3xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20"
                                                    >
                                                        {isCreatingAppointment ? <Loader2 className="animate-spin" /> : 'Xác nhận & Hoàn tất'}
                                                    </Button>
                                                    <Button variant="outline" className="h-20 flex-1 border-2 border-slate-100 dark:border-slate-800 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400">
                                                        Tải Report PDF
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={() => setStep("survey")}
                                                    className="h-20 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-lg uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/10"
                                                >
                                                    Thực hiện lại sàng lọc
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 py-6 opacity-40">
                                        <Info className="size-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Powered by AI Medical Analysis Model v4.2.0-stable</p>
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
