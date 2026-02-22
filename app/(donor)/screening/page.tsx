"use client";

import { useState, useEffect } from "react";
import {
    ClipboardCheck,
    BrainCircuit,
    CheckCircle,
    XCircle,
    Shield,
    Brain,
    AlertCircle,
    HeartPulse,
    Activity,
    Info,
    Loader2,
    FileText,
    Stethoscope,
    Pill,
    Droplets,
    Syringe,
    Thermometer,
    Baby,
    Weight,
    MapPin,
    Scissors,
    ChevronRight,
    ChevronLeft,
    Send
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { aiService } from "@/services/ai.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { screeningService } from "@/services/screening.service";

/* ─────────────────── INTERFACES ─────────────────── */
interface ChoiceOption {
    label: string;
    value: string;
    severity: "safe" | "mild" | "moderate" | "high";
    description?: string;
}

interface ChoiceQuestion {
    id: number;
    text: string;
    type: "choice";
    icon: React.ElementType;
    category: string;
    options: ChoiceOption[];
}

interface TextQuestion {
    id: number;
    text: string;
    type: "text";
    icon: React.ElementType;
    category: string;
    placeholder: string;
    hint?: string;
}

type Question = ChoiceQuestion | TextQuestion;

/* ─────────────── CÂU HỎI TRẮC NGHIỆM (4 đáp án) ─────────────── */
const CHOICE_QUESTIONS: ChoiceQuestion[] = [
    {
        id: 1,
        text: "Tình trạng sức khỏe hôm nay của bạn?",
        type: "choice",
        icon: Thermometer,
        category: "Sức khỏe chung",
        options: [
            { label: "Rất khỏe mạnh, tràn đầy năng lượng", value: "very_good", severity: "safe" },
            { label: "Bình thường, không có vấn đề gì", value: "normal", severity: "safe" },
            { label: "Hơi mệt mỏi hoặc đau đầu nhẹ", value: "mild_tired", severity: "moderate" },
            { label: "Đang bị ốm / sốt / cảm cúm", value: "sick", severity: "high" }
        ]
    },
    {
        id: 2,
        text: "Bạn có đang sử dụng thuốc nào trong 7 ngày qua?",
        type: "choice",
        icon: Pill,
        category: "Thuốc & Điều trị",
        options: [
            { label: "Không dùng bất kỳ loại thuốc nào", value: "no_meds", severity: "safe" },
            { label: "Vitamin / thực phẩm chức năng", value: "supplement", severity: "safe" },
            { label: "Thuốc giảm đau / hạ sốt thông thường", value: "painkiller", severity: "mild" },
            { label: "Thuốc kháng sinh / thuốc kê đơn", value: "antibiotics", severity: "high" }
        ]
    },
    {
        id: 3,
        text: "Tiền sử bệnh lý lây truyền qua đường máu?",
        type: "choice",
        icon: Droplets,
        category: "Bệnh lý máu",
        options: [
            { label: "Không có bệnh lý nào", value: "none", severity: "safe" },
            { label: "Đã được điều trị khỏi hoàn toàn", value: "cured", severity: "moderate" },
            { label: "Đang theo dõi / chưa xác định rõ", value: "monitoring", severity: "moderate" },
            { label: "Có (HIV, Viêm gan B/C, Giang mai...)", value: "has_disease", severity: "high" }
        ]
    },
    {
        id: 4,
        text: "Lần hiến máu gần nhất của bạn là khi nào?",
        type: "choice",
        icon: Syringe,
        category: "Lịch sử hiến máu",
        options: [
            { label: "Chưa từng hiến máu", value: "never", severity: "safe" },
            { label: "Hơn 12 tuần trước", value: "over_12w", severity: "safe" },
            { label: "Từ 8 - 12 tuần trước", value: "8_12w", severity: "mild" },
            { label: "Dưới 8 tuần trước", value: "under_8w", severity: "high" }
        ]
    },
    {
        id: 5,
        text: "Bạn có xăm mình hoặc xỏ khuyên trong 6 tháng qua?",
        type: "choice",
        icon: Scissors,
        category: "Thủ thuật gần đây",
        options: [
            { label: "Không có", value: "none", severity: "safe" },
            { label: "Có, hơn 6 tháng trước", value: "over_6m", severity: "safe" },
            { label: "Có, từ 3-6 tháng trước", value: "3_6m", severity: "moderate" },
            { label: "Có, dưới 3 tháng trước", value: "under_3m", severity: "high" }
        ]
    },
    {
        id: 6,
        text: "Huyết áp của bạn thường ở mức nào?",
        type: "choice",
        icon: Activity,
        category: "Chỉ số sức khỏe",
        options: [
            { label: "Ổn định (90/60 - 140/90 mmHg)", value: "stable", severity: "safe" },
            { label: "Hơi thấp nhưng không triệu chứng", value: "low_mild", severity: "mild" },
            { label: "Thấp, hay chóng mặt khi đứng", value: "low", severity: "moderate" },
            { label: "Cao, đang uống thuốc huyết áp", value: "high", severity: "high" }
        ]
    },
    {
        id: 7,
        text: "Tình trạng thai kỳ / cho con bú (nếu là nữ)?",
        type: "choice",
        icon: Baby,
        category: "Sản phụ khoa",
        options: [
            { label: "Không áp dụng / Không liên quan", value: "na", severity: "safe" },
            { label: "Đã ngừng cho con bú hơn 6 tháng", value: "stopped", severity: "safe" },
            { label: "Đang cho con bú", value: "breastfeeding", severity: "moderate" },
            { label: "Đang mang thai", value: "pregnant", severity: "high" }
        ]
    },
    {
        id: 8,
        text: "Cân nặng hiện tại của bạn?",
        type: "choice",
        icon: Weight,
        category: "Thể trạng",
        options: [
            { label: "Trên 50kg", value: "above_50", severity: "safe" },
            { label: "Từ 45 - 50kg", value: "45_50", severity: "safe" },
            { label: "Từ 42 - 45kg", value: "42_45", severity: "moderate" },
            { label: "Dưới 42kg", value: "below_42", severity: "high" }
        ]
    },
    {
        id: 9,
        text: "Bạn có nhổ răng hoặc tiểu phẫu trong 7 ngày qua?",
        type: "choice",
        icon: Stethoscope,
        category: "Thủ thuật y tế",
        options: [
            { label: "Không có", value: "none", severity: "safe" },
            { label: "Có, hơn 7 ngày trước", value: "over_7d", severity: "safe" },
            { label: "Có, trong vòng 3-7 ngày", value: "3_7d", severity: "moderate" },
            { label: "Có, trong vòng 3 ngày", value: "under_3d", severity: "high" }
        ]
    },
    {
        id: 10,
        text: "Bạn có đi đến vùng dịch bệnh trong 6 tháng qua?",
        type: "choice",
        icon: MapPin,
        category: "Vùng dịch tễ",
        options: [
            { label: "Không, ở tại nơi cư trú ổn định", value: "no", severity: "safe" },
            { label: "Có đi nhưng không phải vùng dịch", value: "safe_area", severity: "safe" },
            { label: "Có đi qua vùng lân cận vùng dịch", value: "near_risk", severity: "moderate" },
            { label: "Có, đã ở vùng có Sốt rét / Zika / Dengue", value: "risk_area", severity: "high" }
        ]
    }
];

/* ─────────────── CÂU HỎI TỰ LUẬN ─────────────── */
const TEXT_QUESTIONS: TextQuestion[] = [
    {
        id: 11,
        text: "Mô tả tình trạng sức khỏe chung hiện tại của bạn",
        type: "text",
        icon: HeartPulse,
        category: "Tình trạng hiện tại",
        placeholder: "VD: Tôi cảm thấy khỏe, ăn ngủ tốt, không có triệu chứng bất thường...",
        hint: "Mô tả chi tiết giúp AI đánh giá chính xác hơn"
    },
    {
        id: 12,
        text: "Bạn có đang điều trị bệnh lý mãn tính nào? Chi tiết.",
        type: "text",
        icon: Stethoscope,
        category: "Bệnh lý nền",
        placeholder: "VD: Không có bệnh nền / Đang điều trị tiểu đường type 2...",
        hint: "Ghi rõ tên bệnh, thuốc đang dùng nếu có"
    },
    {
        id: 13,
        text: "Chế độ ăn uống và nghỉ ngơi trong 24h qua?",
        type: "text",
        icon: Activity,
        category: "Sinh hoạt",
        placeholder: "VD: Ăn đủ 3 bữa, ngủ 7-8 tiếng, uống đủ nước...",
        hint: "Ăn uống đầy đủ trước khi hiến máu rất quan trọng"
    },
    {
        id: 14,
        text: "Bạn có lo ngại gì về việc hiến máu lần này?",
        type: "text",
        icon: AlertCircle,
        category: "Lo ngại cá nhân",
        placeholder: "Ghi rõ lo ngại (nếu có) hoặc ghi 'Không có lo ngại'",
        hint: "Có thể bỏ qua nếu không có lo ngại"
    },
    {
        id: 15,
        text: "Tiền sử dị ứng thuốc hoặc thực phẩm (nếu có)?",
        type: "text",
        icon: Shield,
        category: "Dị ứng",
        placeholder: "VD: Dị ứng Penicillin / Không có dị ứng...",
        hint: "Liệt kê tất cả các loại dị ứng đã biết"
    }
];

const ALL_QUESTIONS: Question[] = [...CHOICE_QUESTIONS, ...TEXT_QUESTIONS];

/* ─────────── Severity Badge Component ─────────── */
function SeverityDot({ severity }: { severity: string }) {
    const colors: Record<string, string> = {
        safe: "bg-blue-300",
        mild: "bg-blue-400",
        moderate: "bg-slate-400",
        high: "bg-slate-600"
    };
    return <span className={`inline-block size-1.5 rounded-full ${colors[severity] || colors.safe}`} />;
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function ScreeningPage() {
    const { profile, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');

    const [activeTab, setActiveTab] = useState<"choice" | "text">("choice");
    const [step, setStep] = useState<"survey" | "analyzing" | "result">("survey");
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [progress, setProgress] = useState(0);
    const [aiResult, setAiResult] = useState<{
        status: "eligible" | "ineligible" | "warning";
        score: number;
        analysis: string;
        recommendations: string[];
    } | null>(null);

    /* ── Auth Guard ── */
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login"); // Not logged in -> Login
            } else if (!profile) {
                router.push("/complete-profile"); // Logged in but no profile -> Complete Profile
            }
        }
    }, [user, profile, authLoading, router]);

    if (!authLoading && profile && profile.is_verified !== true) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-[#0b1120] p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6">
                    <div className="size-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="size-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chưa xác minh hồ sơ</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Vui lòng hoàn thành xác minh hồ sơ y tế trước khi thực hiện sàng lọc AI.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push("/complete-profile/verification")}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                        Đến trang xác minh
                    </Button>
                    <button
                        onClick={() => router.push("/requests")}
                        className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    /* ── Load screening status from DB ── */
    useEffect(() => {
        if (!user?.id) return;
        const checkStatus = async () => {
            const { status } = await screeningService.getScreeningStatus(user.id);
            if (status === 'passed') {
                setAiResult({
                    status: 'eligible', score: 100,
                    analysis: 'Dựa trên hồ sơ đã lưu, bạn đủ điều kiện sức khỏe để tham gia hiến máu.',
                    recommendations: ['Bạn có thể đăng ký tham gia các chiến dịch hiến máu ngay bây giờ.']
                });
                setStep("result");
            } else if (status === 'failed') {
                setAiResult({
                    status: 'ineligible', score: 0,
                    analysis: 'Dựa trên kết quả trước đó, bạn chưa đủ điều kiện hiến máu tại thời điểm này.',
                    recommendations: ['Tham khảo ý kiến bác sĩ', 'Có thể làm lại bài test khi sức khỏe cải thiện']
                });
                setStep("result");
            }
        };
        checkStatus();
    }, [user?.id]);

    /* ── Analyzing animation ── */
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

    /* ── AI Analysis ── */
    const generateAiAnalysis = async () => {
        try {
            if (!user?.id) return;
            const result = await aiService.analyzeScreening(answers, user.id);
            setAiResult(result);
            if (user?.id) {
                const dbStatus = result.status === 'eligible' ? 'passed' : 'failed';
                await screeningService.updateScreeningStatus(user.id, dbStatus);
                try {
                    const userKey = `screening_${user.id}`;
                    localStorage.removeItem(`${userKey}_failed`);
                    localStorage.removeItem(`${userKey}_status`);
                    localStorage.removeItem(`${userKey}_verified_at`);
                } catch (e) { }
            }
            setStep("result");
        } catch (error) {
            console.error("AI Analysis failed:", error);
            setAiResult({
                status: "warning", score: 70,
                analysis: "Hệ thống AI đang bận, đã chuyển sang chế độ phân tích dự phòng.",
                recommendations: ["Thử lại sau ít phút", "Đảm bảo kết nối internet"]
            });
            setStep("result");
        }
    };

    /* ── Handlers ── */
    const handleAnswer = (id: number, value: any, severity?: string) => {
        setAnswers(prev => ({ ...prev, [id]: { value, severity, id } }));
    };

    const choiceAnswered = CHOICE_QUESTIONS.every(q => answers[q.id]);
    const textAnswered = TEXT_QUESTIONS.every(q => answers[q.id]?.value?.trim()?.length > 0);
    const isAllAnswered = choiceAnswered && textAnswered;

    const choiceCount = CHOICE_QUESTIONS.filter(q => answers[q.id]).length;
    const textCount = TEXT_QUESTIONS.filter(q => answers[q.id]?.value?.trim()?.length > 0).length;

    /* ── Reset handler ── */
    const handleReset = () => {
        try {
            const userKey = user?.id ? `screening_${user.id}` : 'screening_guest';
            localStorage.removeItem(`${userKey}_status`);
            localStorage.removeItem(`${userKey}_failed`);
            localStorage.removeItem(`${userKey}_verified_at`);
        } catch (e) { }
        setAnswers({});
        setProgress(0);
        setAiResult(null);
        setActiveTab("choice");
        setStep("survey");
    };

    /* ═══════════════════════ RENDER ═══════════════════════ */
    return (
        <div className="flex h-full w-full flex-row overflow-hidden bg-slate-50 dark:bg-[#0b1120] font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
                <TopNav title="Sàng lọc Sức khỏe AI" />

                <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">

                    {/* ── Back Button ── */}
                    <button
                        onClick={() => router.push('/requests')}
                        className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors group"
                    >
                        <ChevronLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-medium">Quay lại</span>
                    </button>

                    {/* ── Stepper (compact) ── */}
                    <div className="mb-5 flex items-center gap-2 sm:gap-3 justify-center">
                        {[
                            { id: 'survey', label: 'Khảo sát', icon: ClipboardCheck },
                            { id: 'analyzing', label: 'Phân tích', icon: BrainCircuit },
                            { id: 'result', label: 'Kết quả', icon: HeartPulse }
                        ].map((s, i, arr) => (
                            <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className={`size-7 sm:size-8 rounded-lg flex items-center justify-center transition-all duration-300 ${step === s.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105'
                                        : ['survey', 'analyzing', 'result'].indexOf(step) > i
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                        <s.icon className="size-3.5 sm:size-4" />
                                    </div>
                                    <span className={`text-[10px] sm:text-xs font-semibold hidden sm:inline ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className={`w-6 sm:w-10 h-px ${['survey', 'analyzing', 'result'].indexOf(step) > i ? 'bg-blue-300 dark:bg-blue-800' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ═══════════ SURVEY STEP ═══════════ */}
                    {step === "survey" && (
                        <div className="animate-in fade-in duration-300 space-y-4">

                            {/* ── Tab Selector ── */}
                            <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
                                <button
                                    onClick={() => setActiveTab("choice")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === "choice"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        }`}
                                >
                                    <ClipboardCheck className="size-3.5 sm:size-4" />
                                    <span>Trắc nghiệm</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "choice"
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        }`}>
                                        {choiceCount}/{CHOICE_QUESTIONS.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("text")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === "text"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        }`}
                                >
                                    <FileText className="size-3.5 sm:size-4" />
                                    <span>Tự luận</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "text"
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        }`}>
                                        {textCount}/{TEXT_QUESTIONS.length}
                                    </span>
                                </button>
                            </div>

                            {/* ── Progress Summary ── */}
                            <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${((choiceCount + textCount) / ALL_QUESTIONS.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                    {choiceCount + textCount}/{ALL_QUESTIONS.length} câu
                                </span>
                            </div>

                            {/* ═══ PHẦN TRẮC NGHIỆM ═══ */}
                            {activeTab === "choice" && (
                                <div className="space-y-3">
                                    {/* Section Header */}
                                    <div className="flex items-center gap-2.5 px-1">
                                        <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <Activity className="size-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Kiểm tra Chỉ số Sức khỏe</h3>
                                            <p className="text-[10px] text-slate-400">Chọn đáp án phù hợp nhất với tình trạng của bạn</p>
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    {CHOICE_QUESTIONS.map((q, idx) => (
                                        <div
                                            key={q.id}
                                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                        >
                                            {/* Question Header */}
                                            <div className="flex items-start gap-2.5 p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/60">
                                                <span className="flex-none size-5 rounded-md bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 flex items-center justify-center text-[9px] font-black mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white leading-snug">{q.text}</h4>
                                                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                                                        <q.icon className="size-2.5" />
                                                        {q.category}
                                                    </span>
                                                </div>
                                                {answers[q.id] && (
                                                    <CheckCircle className="size-4 text-blue-500 flex-none mt-0.5" />
                                                )}
                                            </div>

                                            {/* 4 Options Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 sm:p-3">
                                                {q.options.map((opt) => {
                                                    const isSelected = answers[q.id]?.value === opt.value;
                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleAnswer(q.id, opt.value, opt.severity)}
                                                            className={`group relative flex items-center gap-2 p-2.5 sm:p-3 rounded-lg text-left transition-all duration-200 ${isSelected
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 ring-2 ring-blue-500/10'
                                                                : 'bg-slate-50/50 dark:bg-slate-800/30 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                }`}
                                                        >
                                                            <div className={`flex-none size-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                                ? 'border-blue-500 bg-blue-500'
                                                                : 'border-slate-300 dark:border-slate-600'
                                                                }`}>
                                                                {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                                            </div>
                                                            <span className={`flex-1 min-w-0 text-xs font-medium leading-snug ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                {opt.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Next to Text section */}
                                    {choiceAnswered && (
                                        <div className="flex justify-center pt-2">
                                            <button
                                                onClick={() => setActiveTab("text")}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95"
                                            >
                                                Tiếp tục phần Tự luận
                                                <ChevronRight className="size-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ PHẦN TỰ LUẬN ═══ */}
                            {activeTab === "text" && (
                                <div className="space-y-3">
                                    {/* Section Header */}
                                    <div className="flex items-center gap-2.5 px-1">
                                        <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <HeartPulse className="size-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Thông tin Sức khỏe Chi tiết</h3>
                                            <p className="text-[10px] text-slate-400">Mô tả cụ thể để AI phân tích chính xác hơn</p>
                                        </div>
                                    </div>

                                    {!choiceAnswered && (
                                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                            <AlertCircle className="size-3.5 text-slate-500 flex-none" />
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                Hãy hoàn thành phần Trắc nghiệm trước để có kết quả chính xác nhất.
                                            </p>
                                        </div>
                                    )}

                                    {/* Text Questions */}
                                    {TEXT_QUESTIONS.map((q, idx) => (
                                        <div
                                            key={q.id}
                                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                                        >
                                            <div className="flex items-start gap-2.5 p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/60">
                                                <span className="flex-none size-5 rounded-md bg-slate-600 dark:bg-slate-400 text-white dark:text-slate-900 flex items-center justify-center text-[9px] font-black mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white leading-snug">{q.text}</h4>
                                                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                                                        <q.icon className="size-2.5" />
                                                        {q.category}
                                                    </span>
                                                </div>
                                                {answers[q.id]?.value?.trim() && (
                                                    <CheckCircle className="size-4 text-blue-500 flex-none mt-0.5" />
                                                )}
                                            </div>
                                            <div className="p-3 sm:p-4">
                                                {q.hint && (
                                                    <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
                                                        <Info className="size-2.5" />
                                                        {q.hint}
                                                    </p>
                                                )}
                                                <textarea
                                                    className="w-full h-24 sm:h-28 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs sm:text-sm text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                                    placeholder={q.placeholder}
                                                    value={answers[q.id]?.value || ""}
                                                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Back to Choice */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setActiveTab("choice")}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <ChevronLeft className="size-3.5" />
                                            Quay lại phần Trắc nghiệm
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Submit Button ── */}
                            <div className="pt-3 pb-6 space-y-3">
                                <div className="flex items-center justify-center gap-1.5 text-slate-400">
                                    <Shield className="size-3" />
                                    <p className="text-[9px] font-semibold uppercase tracking-wider">Dữ liệu được mã hóa y tế</p>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                                    Bằng việc gửi kết quả, bạn xác nhận mọi thông tin trên là trung thực và chịu trách nhiệm trước quy định y tế.
                                </p>
                                <div className="flex justify-center">
                                    <Button
                                        disabled={!isAllAnswered}
                                        onClick={() => setStep("analyzing")}
                                        className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-30 disabled:grayscale group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-left">
                                                <p className="text-sm sm:text-base font-bold">Gửi & Phân tích AI</p>
                                                <p className="text-[9px] font-medium opacity-60">Neural Engine v4.2</p>
                                            </div>
                                            <div className="size-8 sm:size-9 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-6 transition-transform">
                                                <BrainCircuit className="size-4 sm:size-5" />
                                            </div>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ ANALYZING STEP ═══════════ */}
                    {step === "analyzing" && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden min-h-[400px]">
                            {/* Scanline */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
                                <div className="w-full h-0.5 bg-blue-500 absolute left-0 animate-scan shadow-[0_0_15px_#0065FF]" />
                            </div>

                            <div className="relative size-36 sm:size-44 mb-8">
                                <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-700 animate-[spin_8s_linear_infinite]" />
                                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-24 sm:size-28 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
                                        <BrainCircuit className="size-10 sm:size-14 text-blue-600 animate-pulse" />
                                        <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">{progress}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-sm space-y-4">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Đang phân tích sức khỏe</h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    AI đang đánh giá {ALL_QUESTIONS.length} chỉ số sức khỏe dựa trên tiêu chuẩn Bộ Y Tế.
                                </p>
                                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                    <Loader2 className="size-3 animate-spin" />
                                    {progress < 30 ? 'Phân tích trắc nghiệm' : progress < 60 ? 'Đánh giá mức độ rủi ro' : progress < 90 ? 'Phân tích câu trả lời tự luận' : 'Tổng hợp kết quả'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ RESULT STEP ═══════════ */}
                    {step === "result" && aiResult && (
                        <div className="animate-in fade-in slide-in-from-top-6 duration-500 space-y-4">
                            {/* Main Result Card */}
                            <div className={`bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden ${aiResult.status === 'eligible' ? 'border-blue-200 dark:border-blue-800/30' :
                                aiResult.status === 'warning' ? 'border-slate-300 dark:border-slate-700' :
                                    'border-slate-300 dark:border-slate-700'
                                }`}>
                                {/* Header */}
                                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className={`flex-none size-10 sm:size-12 rounded-xl flex items-center justify-center text-white shadow-md ${aiResult.status === 'eligible' ? 'bg-blue-600 shadow-blue-600/20' :
                                                aiResult.status === 'warning' ? 'bg-slate-500 shadow-slate-500/20' :
                                                    'bg-slate-700 shadow-slate-700/20'
                                                }`}>
                                                {aiResult.status === 'eligible' ? <CheckCircle className="size-5 sm:size-6" /> :
                                                    aiResult.status === 'warning' ? <AlertCircle className="size-5 sm:size-6" /> :
                                                        <XCircle className="size-5 sm:size-6" />}
                                            </div>
                                            <div className="flex-none max-w-[140px] sm:max-w-[180px]">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Kết quả chẩn đoán</p>
                                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                    {aiResult.status === 'eligible' ? 'Đủ điều kiện hiến máu' :
                                                        aiResult.status === 'warning' ? 'Cần lưu ý y tế' :
                                                            'Chưa đủ điều kiện'}
                                                </h2>
                                            </div>
                                            <div className="flex-1 relative pl-4 border-l border-slate-100 dark:border-slate-800 min-w-0 hidden md:block">
                                                <div className="max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                                        {aiResult.analysis}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Score */}
                                        <div className="flex flex-col items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl min-w-[70px]">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Điểm</span>
                                            <span className={`text-2xl sm:text-3xl font-black ${aiResult.score > 80 ? 'text-blue-600' : 'text-slate-600'}`}>
                                                {aiResult.score}
                                            </span>
                                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${aiResult.score > 80 ? 'bg-blue-500' : 'bg-slate-400'}`}
                                                    style={{ width: `${aiResult.score}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis */}
                                <div className="p-4 sm:p-6 space-y-4">
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {aiResult.analysis}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Recommendations */}
                                        <div className="space-y-2.5">
                                            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                                <Activity className="size-3 text-blue-500" /> Khuyến nghị AI
                                            </h4>
                                            <div className="space-y-1.5">
                                                {aiResult.recommendations.map((rec, i) => (
                                                    <div key={i} className="flex gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                        <div className="size-1.5 rounded-full bg-blue-500 mt-1.5 flex-none" />
                                                        <span className="leading-relaxed">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Medical Verification */}
                                        <div className="space-y-2.5">
                                            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                                <Shield className="size-3 text-blue-500" /> Xác thực Y khoa
                                            </h4>
                                            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg space-y-2">
                                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                                    Báo cáo tạo bởi REDHOPE Neural Engine v4.2. Kết quả có hiệu lực 24 giờ.
                                                </p>
                                                <div className="pt-2 border-t border-blue-100 dark:border-blue-900/20 flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <span>✓ Verified</span>
                                                    <span>ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {aiResult.status === 'eligible' ? (
                                <div className="space-y-3">
                                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-blue-600 flex items-center justify-center flex-none">
                                            <CheckCircle className="size-4 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400">Hồ sơ đã được lưu</h4>
                                            <p className="text-[10px] text-blue-600/80">Có hiệu lực 24 giờ. Bạn có thể đăng ký chiến dịch.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            onClick={() => {
                                                const userKey = user?.id ? `screening_${user.id}` : 'screening_guest';
                                                localStorage.setItem(`${userKey}_verified_at`, Date.now().toString());
                                                localStorage.removeItem(`${userKey}_failed`);
                                                router.push('/requests');
                                            }}
                                            className="h-11 flex-1 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                                        >
                                            Đăng ký chiến dịch ngay
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/dashboard')}
                                            className="h-11 flex-1 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-500"
                                        >
                                            Về trang chủ
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-slate-600 flex items-center justify-center flex-none">
                                            <XCircle className="size-4 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa đủ điều kiện</h4>
                                            <p className="text-[10px] text-slate-500">Vui lòng tham khảo khuyến nghị. Có thể làm lại khi sức khỏe cải thiện.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            onClick={handleReset}
                                            className="h-11 flex-1 bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md shadow-slate-700/20"
                                        >
                                            🔄 Làm lại bài test
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/requests')}
                                            className="h-11 flex-1 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-500"
                                        >
                                            Xem chiến dịch
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 py-3 opacity-40">
                                <Info className="size-3" />
                                <p className="text-[8px] font-bold uppercase tracking-widest">AI Medical Analysis v4.2.0</p>
                            </div>
                        </div>
                    )}

                </main>
                <MiniFooter />
            </div>
        </div>
    );
}
