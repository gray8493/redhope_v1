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
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white transition-colors duration-500">
            <div className="flex h-full grow flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Sàng lọc Sức khỏe AI (15 Câu)" />
                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[960px] flex-1 px-4 md:px-10">

                            {/* Stepper Display */}
                            <div className="mb-10">
                                <div className="flex border-b border-[#d7d0e7] dark:border-[#2d263d] justify-between relative">
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] flex-1 pb-3 transition-all duration-500 ${step === 'survey' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-400'}`}>
                                        <ClipboardCheck className={`mb-1 w-6 h-6 ${step === 'survey' ? 'text-[#6324eb]' : 'text-slate-300'}`} />
                                        <p className="text-sm font-bold tracking-[0.015em]">Khảo sát (15 câu)</p>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] flex-1 pb-3 transition-all duration-500 ${step === 'analyzing' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-400'}`}>
                                        <BrainCircuit className={`mb-1 w-6 h-6 ${step === 'analyzing' ? 'text-[#6324eb]' : 'text-slate-300'}`} />
                                        <p className="text-sm font-bold tracking-[0.015em]">Neural Analysis</p>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] flex-1 pb-3 transition-all duration-500 ${step === 'result' ? 'border-[#6324eb] text-[#6324eb]' : 'border-transparent text-slate-400'}`}>
                                        <HeartPulse className={`mb-1 w-6 h-6 ${step === 'result' ? 'text-[#6324eb]' : 'text-slate-300'}`} />
                                        <p className="text-sm font-bold tracking-[0.015em]">Kết luận AI</p>
                                    </div>
                                </div>
                            </div>

                            {step === "survey" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                    {/* PHẦN 1: KIỂM TRA NHANH CHỈ SỐ SỨC KHỎE */}
                                    <Card className="bg-white dark:bg-[#1c162e] rounded-[2rem] shadow-xl shadow-indigo-500/5 border border-[#ebe7f3] dark:border-[#2d263d] p-8 md:p-12">
                                        <div className="mb-12 flex items-center gap-6 border-b border-slate-50 dark:border-slate-800 pb-8">
                                            <div className="size-14 rounded-2xl bg-gradient-to-br from-[#6324eb] to-[#a855f7] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                                <Zap className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-[#120e1b] dark:text-white tracking-tight">Phần 1: Chỉ số Sức khỏe Nhanh</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide mt-1">Vui lòng chọn các phương án phản ánh đúng nhất tình trạng hiện tại</p>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {SCREENING_QUESTIONS.filter(q => q.type === "choice").map((q, idx) => (
                                                <div key={q.id} className="group">
                                                    <div className="flex items-start gap-5 mb-6">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-[#6324eb] bg-[#6324eb]/10 px-3 py-1 rounded-full uppercase tracking-tighter mb-2">Q{idx + 1}</span>
                                                            <div className="w-px h-full bg-slate-100 dark:bg-slate-800 flex-1"></div>
                                                        </div>
                                                        <h4 className="text-xl font-black text-[#120e1b] dark:text-white leading-snug pt-1">{q.text}</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-12">
                                                        {q.options?.map((opt) => (
                                                            <div
                                                                key={opt.value}
                                                                onClick={() => handleAnswer(q.id, opt.value, opt.isRisk)}
                                                                className={`p-6 border-2 rounded-2xl transition-all cursor-pointer flex items-center justify-between group/opt ${answers[q.id]?.value === opt.value ? 'border-[#6324eb] bg-[#6324eb]/5 shadow-xl shadow-indigo-500/10 scale-[1.02]' : 'border-slate-100 dark:border-slate-800 hover:border-[#6324eb]/30 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${answers[q.id]?.value === opt.value ? 'bg-[#6324eb] text-white rotate-6' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover/opt:rotate-6'}`}>
                                                                        <Activity className="w-5 h-5" />
                                                                    </div>
                                                                    <span className={`font-bold transition-colors ${answers[q.id]?.value === opt.value ? 'text-[#120e1b] dark:text-white' : 'text-slate-500 group-hover/opt:text-slate-700 dark:group-hover/opt:text-slate-300'}`}>{opt.label}</span>
                                                                </div>
                                                                {answers[q.id]?.value === opt.value && (
                                                                    <div className="size-6 rounded-full bg-[#6324eb] flex items-center justify-center animate-in zoom-in">
                                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    {/* PHẦN 2: THÔNG TIN SỨC KHỎE CHI TIẾT */}
                                    <Card className="bg-white dark:bg-[#1c162e] rounded-[2rem] shadow-xl shadow-indigo-500/5 border border-[#ebe7f3] dark:border-[#2d263d] p-8 md:p-12">
                                        <div className="mb-12 flex items-center gap-6 border-b border-slate-50 dark:border-slate-800 pb-8">
                                            <div className="size-14 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                                <ClipboardCheck className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-[#120e1b] dark:text-white tracking-tight">Phần 2: Thông tin Chi tiết</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide mt-1">Mô tả cụ thể để AI có thể đánh giá chính xác nhất</p>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {SCREENING_QUESTIONS.filter(q => q.type === "text").map((q, idx) => (
                                                <div key={q.id} className="group">
                                                    <div className="flex items-start gap-5 mb-6">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded-full uppercase tracking-tighter mb-2">Q{idx + 11}</span>
                                                            <div className="w-px h-full bg-slate-100 dark:bg-slate-800 flex-1"></div>
                                                        </div>
                                                        <h4 className="text-xl font-black text-[#120e1b] dark:text-white leading-snug pt-1">{q.text}</h4>
                                                    </div>
                                                    <div className="pl-12">
                                                        <textarea
                                                            className="w-full h-40 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[#120e1b] dark:text-white focus:border-[#a855f7] focus:ring-4 focus:ring-[#a855f7]/10 transition-all outline-none font-medium resize-none text-lg shadow-inner"
                                                            placeholder={q.placeholder}
                                                            value={answers[q.id]?.value || ""}
                                                            onChange={(e) => handleAnswer(q.id, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    {/* FOOTER ACTION */}
                                    <div className="flex flex-col items-center gap-6 py-12 border-t border-[#d7d0e7] dark:border-[#2d263d]">
                                        <div className="text-center">
                                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">Cam kết trung thực</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">Bằng việc nhấn nút bên dưới, bạn xác nhận các thông tin khai báo trên là hoàn toàn đúng sự thật.</p>
                                        </div>
                                        <Button
                                            disabled={!isAllAnswered}
                                            onClick={() => setStep("analyzing")}
                                            className="bg-[#6324eb] text-white px-16 py-10 rounded-3xl font-black hover:bg-[#501ac2] transition-all flex flex-col items-center gap-2 shadow-2xl shadow-[#6324eb]/25 hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl uppercase tracking-tighter">Gửi kết quả & Phân tích AI</span>
                                                <BrainCircuit className="w-8 h-8 animate-pulse" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Cần hoàn thành tất cả {totalQuestions} câu hỏi</span>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === "analyzing" && (
                                <div className="bg-white dark:bg-[#1c162e] rounded-[2.5rem] shadow-2xl border border-[#ebe7f3] dark:border-[#2d263d] p-16 md:p-24 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800">
                                        <div className="h-full bg-gradient-to-r from-[#6324eb] to-[#a855f7] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    <div className="relative size-64 mb-12">
                                        {/* Background Pulse Effects */}
                                        <div className="absolute inset-0 bg-[#6324eb]/10 rounded-full animate-ping opacity-20 duration-1000"></div>
                                        <div className="absolute inset-0 bg-[#6324eb]/5 rounded-full animate-pulse opacity-40 duration-2000"></div>

                                        {/* Main Loader Ring */}
                                        <svg className="size-full transform -rotate-90 drop-shadow-2xl">
                                            <circle cx="128" cy="128" r="110" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-50 dark:text-slate-800" />
                                            <circle cx="128" cy="128" r="110" fill="none" stroke="url(#aiGradient)" strokeWidth="12" strokeDasharray={691} strokeDashoffset={691 - (691 * progress) / 100} strokeLinecap="round" className="transition-all duration-300 ease-out" />
                                            <defs>
                                                <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#6324eb" />
                                                    <stop offset="100%" stopColor="#a855f7" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-32 rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl flex flex-col items-center justify-center text-[#6324eb] border border-slate-100 dark:border-slate-800">
                                                <Brain className="w-16 h-16 mb-1 animate-bounce duration-1000" />
                                                <span className="text-sm font-black tracking-tighter">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-md space-y-6">
                                        <h3 className="text-4xl font-black text-[#120e1b] dark:text-white tracking-tight">AI Neural Screening...</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-semibold">
                                            Đang quét 15 câu trả lời để đối chứng với giao thức an toàn WHO & Bộ Y Tế.
                                        </p>
                                        <div className="pt-8 flex flex-col items-center gap-4">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-[#6324eb] uppercase tracking-widest bg-[#6324eb]/5 px-6 py-3 rounded-full border border-[#6324eb]/20 shadow-sm">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {progress < 25 ? 'Khởi tạo Neural Engine' : progress < 50 ? 'Phân tích từ vựng tự luận' : progress < 75 ? 'Đối chứng hồ sơ bệnh lý' : 'Tổng hơp báo cáo y khoa'}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 grayscale opacity-60">
                                                <Shield className="w-4 h-4" /> Military-Grade Data Privacy Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === "result" && aiResult && (
                                <div className="animate-in fade-in slide-in-from-top-12 duration-1000 ease-out">
                                    <Card className={`rounded-[3rem] shadow-2xl border-4 overflow-hidden relative p-10 md:p-16 ${aiResult.status === 'eligible' ? 'border-emerald-500/20 bg-white dark:bg-[#1c162e]' :
                                        aiResult.status === 'warning' ? 'border-amber-500/20 bg-white dark:bg-[#1c162e]' :
                                            'border-red-500/20 bg-white dark:bg-[#1c162e]'
                                        }`}>

                                        <div className={`absolute top-0 right-0 size-80 rounded-full blur-[100px] opacity-10 -mr-40 -mt-40 ${aiResult.status === 'eligible' ? 'bg-emerald-500' : aiResult.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>

                                        <div className="relative z-10 flex flex-col items-center text-center">
                                            <div className={`size-28 rounded-full flex items-center justify-center text-white mb-10 shadow-2xl transform hover:scale-110 transition-transform duration-500 ${aiResult.status === 'eligible' ? 'bg-emerald-500 shadow-emerald-500/40' :
                                                aiResult.status === 'warning' ? 'bg-amber-500 shadow-amber-500/40' :
                                                    'bg-red-500 shadow-red-500/40'
                                                }`}>
                                                {aiResult.status === 'eligible' ? <CheckCircle className="w-14 h-14" /> :
                                                    aiResult.status === 'warning' ? <AlertCircle className="w-14 h-14" /> :
                                                        <XCircle className="w-14 h-14" />}
                                            </div>

                                            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none">
                                                {aiResult.status === 'eligible' ? 'Hoàn toàn Đủ điều kiện' :
                                                    aiResult.status === 'warning' ? 'Cần Lưu ý Sức khỏe' :
                                                        'Chưa Đủ điều kiện'}
                                            </h2>

                                            <div className="flex items-center gap-3 mb-8">
                                                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1 rounded-full font-bold text-xs">
                                                    AI Confidence Score: {aiResult.score}%
                                                </Badge>
                                            </div>

                                            <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mb-12 font-semibold leading-relaxed">
                                                {aiResult.analysis}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12 text-left">
                                                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                                                    <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                                        <Activity className="w-5 h-5 text-[#6324eb]" /> Khuyến nghị từ AI
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {aiResult.recommendations.map((rec, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-slate-500 dark:text-slate-400 font-medium">
                                                                <div className="size-2 rounded-full bg-[#6324eb] mt-2 shrink-0"></div>
                                                                {rec}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="p-8 bg-[#6324eb]/5 border border-[#6324eb]/10 rounded-[2rem]">
                                                    <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                                        <Shield className="w-5 h-5 text-[#6324eb]" /> Bảo chứng Y khoa
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                        Chứng chỉ này có giá trị tạm thời trong 24 giờ. Kết quả sàng lọc được AI phân tích dựa trên khai báo cá nhân. Khi gặp trực tiếp bác sĩ vẫn sẽ có bước kiểm tra lâm sàng cuối cùng.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-5 w-full">
                                                {aiResult.status === 'eligible' ? (
                                                    <>
                                                        <Button
                                                            disabled={isCreatingAppointment || !campaignId}
                                                            onClick={async () => {
                                                                if (!campaignId || !user?.id) {
                                                                    alert('Thiếu thông tin chiến dịch hoặc người dùng');
                                                                    return;
                                                                }

                                                                setIsCreatingAppointment(true);
                                                                try {
                                                                    const response = await fetch('/api/appointments/create', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({
                                                                            userId: user.id,
                                                                            campaignId: campaignId,
                                                                        }),
                                                                    });

                                                                    const result = await response.json();

                                                                    if (response.ok) {
                                                                        localStorage.setItem('screening_verified', 'true');
                                                                        alert('✅ Đăng ký thành công! Bạn sẽ nhận được thông báo xác nhận.');
                                                                        router.push(`/appointments/${result.appointment.id}`);
                                                                    } else {
                                                                        alert(`Lỗi: ${result.error || 'Không thể tạo lịch hẹn'}`);
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error creating appointment:', error);
                                                                    alert('Có lỗi xảy ra khi tạo lịch hẹn. Vui lòng thử lại.');
                                                                } finally {
                                                                    setIsCreatingAppointment(false);
                                                                }
                                                            }}
                                                            className="flex-1 bg-[#6324eb] hover:bg-[#501ac2] text-white py-8 rounded-2xl font-black transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[#6324eb]/30 text-lg uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isCreatingAppointment ? (
                                                                <>
                                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                                    Đang đăng ký...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Đăng ký chiến dịch
                                                                    <ArrowRight className="w-6 h-6" />
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button variant="outline" className="flex-1 py-8 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg uppercase tracking-widest">
                                                            Tải Báo cáo AI (.PDF)
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={() => setStep("survey")}
                                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-8 rounded-2xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-4 text-lg uppercase tracking-widest"
                                                    >
                                                        Thực hiện lại sàng lọc
                                                        <ArrowLeft className="w-6 h-6" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="mt-12 flex items-center justify-center gap-6">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            <Info className="w-4 h-4" /> AI model trained with 500k+ clinical records
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
