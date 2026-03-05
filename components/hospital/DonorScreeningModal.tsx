"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    BrainCircuit,
    CheckCircle,
    XCircle,
    AlertCircle,
    Activity,
    Loader2,
    FileText,
    User,
    Calendar,
    Shield
} from "lucide-react";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ScreeningLog {
    id: string;
    user_id: string;
    campaign_id: string | null;
    appointment_id: string | null;
    ai_result: boolean;
    health_details: {
        score: number;
        status: string;
        analysis: string;
        recommendations: string[];
        answers: Record<string, any>;
        analyzed_at: string;
    };
    created_at: string;
}

interface DonorInfo {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    blood_group: string;
    dob: string;
    gender: string;
    weight: number;
    height: number;
    health_history: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    campaignId?: string;
}

// Question labels for displaying answers
const QUESTION_LABELS: Record<string, string> = {
    "1": "Tình trạng sức khỏe hôm nay",
    "2": "Sử dụng thuốc trong 7 ngày qua",
    "3": "Tiền sử bệnh lý lây truyền qua đường máu",
    "4": "Lần hiến máu gần nhất",
    "5": "Xăm mình / xỏ khuyên trong 6 tháng qua",
    "6": "Huyết áp",
    "7": "Tình trạng thai kỳ / cho con bú",
    "8": "Cân nặng hiện tại",
    "9": "Nhổ răng / tiểu phẫu trong 7 ngày qua",
    "10": "Đi đến vùng dịch bệnh trong 6 tháng qua",
    "11": "Tình trạng sức khỏe chung",
    "12": "Bệnh lý mãn tính đang điều trị",
    "13": "Chế độ ăn uống / nghỉ ngơi 24h qua",
    "14": "Lo ngại về hiến máu",
    "15": "Tiền sử dị ứng",
};

// Mapping value code → Vietnamese label for choice answers (question 1-10)
const ANSWER_VALUE_LABELS: Record<string, Record<string, string>> = {
    "1": { very_good: "Rất khỏe mạnh, tràn đầy năng lượng", normal: "Bình thường, không có vấn đề gì", mild_tired: "Hơi mệt mỏi hoặc đau đầu nhẹ", sick: "Đang bị ốm / sốt / cảm cúm" },
    "2": { no_meds: "Không dùng bất kỳ loại thuốc nào", supplement: "Vitamin / thực phẩm chức năng", painkiller: "Thuốc giảm đau / hạ sốt thông thường", antibiotics: "Thuốc kháng sinh / thuốc kê đơn" },
    "3": { none: "Không có bệnh lý nào", cured: "Đã được điều trị khỏi hoàn toàn", monitoring: "Đang theo dõi / chưa xác định rõ", has_disease: "Có (HIV, Viêm gan B/C, Giang mai...)" },
    "4": { never: "Chưa từng hiến máu", over_12w: "Hơn 12 tuần trước", "8_12w": "Từ 8 - 12 tuần trước", under_8w: "Dưới 8 tuần trước" },
    "5": { none: "Không có", over_6m: "Có, hơn 6 tháng trước", "3_6m": "Có, từ 3-6 tháng trước", under_3m: "Có, dưới 3 tháng trước" },
    "6": { stable: "Ổn định (90/60 - 140/90 mmHg)", low_mild: "Hơi thấp nhưng không triệu chứng", low: "Thấp, hay chóng mặt khi đứng", high: "Cao, đang uống thuốc huyết áp" },
    "7": { na: "Không áp dụng / Không liên quan", stopped: "Đã ngừng cho con bú hơn 6 tháng", breastfeeding: "Đang cho con bú", pregnant: "Đang mang thai" },
    "8": { above_50: "Trên 50kg", "45_50": "Từ 45 - 50kg", "42_45": "Từ 42 - 45kg", below_42: "Dưới 42kg" },
    "9": { none: "Không có", over_7d: "Có, hơn 7 ngày trước", "3_7d": "Có, trong vòng 3-7 ngày", under_3d: "Có, trong vòng 3 ngày" },
    "10": { no: "Không, ở tại nơi cư trú ổn định", safe_area: "Có đi nhưng không phải vùng dịch", near_risk: "Có đi qua vùng lân cận vùng dịch", risk_area: "Có, đã ở vùng có Sốt rét / Zika / Dengue" },
};

const SEVERITY_COLORS: Record<string, string> = {
    safe: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    mild: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    moderate: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    high: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
};

const SEVERITY_LABELS: Record<string, string> = {
    safe: "An toàn",
    mild: "Nhẹ",
    moderate: "Trung bình",
    high: "Cao",
};

export function DonorScreeningModal({ open, onClose, userId, userName, campaignId }: Props) {
    const [loading, setLoading] = useState(false);
    const [donor, setDonor] = useState<DonorInfo | null>(null);
    const [logs, setLogs] = useState<ScreeningLog[]>([]);
    const [selectedLog, setSelectedLog] = useState<ScreeningLog | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = campaignId
                ? `/api/hospital/screening/${userId}?campaignId=${campaignId}`
                : `/api/hospital/screening/${userId}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Không thể tải dữ liệu");
            const data = await res.json();
            setDonor(data.donor);
            setLogs(data.screening_logs || []);
            if (data.screening_logs?.length > 0) {
                setSelectedLog(data.screening_logs[0]);
            }
        } catch (err: any) {
            setError(err.message || "Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (open && userId) {
            fetchData();
        } else {
            setDonor(null);
            setLogs([]);
            setSelectedLog(null);
        }
    }, [open, userId]);

    const details = selectedLog?.health_details;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5">
                        <BrainCircuit className="size-5 text-blue-600" />
                        <span>Kết quả Sàng lọc AI — {userName}</span>
                    </DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="size-8 text-blue-600 animate-spin" />
                        <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                        <AlertCircle className="size-5 text-rose-500" />
                        <p className="text-sm text-rose-600">{error}</p>
                    </div>
                )}

                {!loading && !error && logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <FileText className="size-10 text-slate-300" />
                        <p className="text-sm text-slate-500">Chưa có kết quả sàng lọc AI</p>
                        <p className="text-xs text-slate-400">Người hiến máu chưa thực hiện bài test sàng lọc.</p>
                    </div>
                )}

                {!loading && !error && selectedLog && details && (
                    <div className="space-y-4">

                        {/* Log selector if multiple */}
                        {logs.length > 1 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-500 font-medium">Lịch sử:</span>
                                {logs.map((log, i) => (
                                    <button
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${selectedLog.id === log.id
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                            }`}
                                    >
                                        Lần {logs.length - i} — {format(new Date(log.created_at), 'dd/MM HH:mm')}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Result */}
                        <div className={`rounded-xl border-2 p-4 ${details.status === 'eligible'
                            ? 'border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : details.status === 'warning'
                                ? 'border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10'
                                : 'border-rose-200 dark:border-rose-800/30 bg-rose-50/50 dark:bg-rose-900/10'
                            }`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`size-10 rounded-xl flex items-center justify-center text-white ${details.status === 'eligible' ? 'bg-emerald-500' :
                                        details.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}>
                                        {details.status === 'eligible' ? <CheckCircle className="size-5" /> :
                                            details.status === 'warning' ? <AlertCircle className="size-5" /> :
                                                <XCircle className="size-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả AI</p>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {details.status === 'eligible' ? 'Đủ điều kiện' :
                                                details.status === 'warning' ? 'Cần lưu ý' : 'Không đủ điều kiện'}
                                        </h3>
                                    </div>
                                </div>
                                <div className="text-center px-3 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Điểm</p>
                                    <p className={`text-2xl font-black ${details.score > 80 ? 'text-emerald-600' :
                                        details.score > 50 ? 'text-amber-600' : 'text-rose-600'
                                        }`}>{details.score}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {details.analysis}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                                <Calendar className="size-3" />
                                {format(new Date(details.analyzed_at || selectedLog.created_at), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {details.recommendations?.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                                    <Activity className="size-3.5 text-blue-500" />
                                    Khuyến nghị AI
                                </h4>
                                <div className="space-y-2">
                                    {details.recommendations.map((rec, i) => (
                                        <div key={i} className="flex gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-xs text-slate-600 dark:text-slate-400 font-medium">
                                            <div className="size-1.5 rounded-full bg-blue-500 mt-1.5 flex-none" />
                                            <span className="leading-relaxed">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Answers Detail */}
                        {details.answers && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                                    <FileText className="size-3.5 text-slate-500" />
                                    Chi tiết câu trả lời ({Object.keys(details.answers).length} câu)
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(details.answers).map(([key, answer]: [string, any]) => {
                                        const isChoice = parseInt(key) <= 10;
                                        const severity = answer?.severity;
                                        const rawValue = typeof answer === 'object' ? (answer?.value || '') : answer;
                                        // Display Vietnamese label for choice answers, raw text for text answers
                                        const displayValue = isChoice && ANSWER_VALUE_LABELS[key]?.[rawValue]
                                            ? ANSWER_VALUE_LABELS[key][rawValue]
                                            : rawValue;

                                        return (
                                            <div key={key} className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                                                <span className="flex-none size-5 rounded-md bg-slate-700 text-white flex items-center justify-center text-[9px] font-black mt-0.5">
                                                    {key}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">
                                                        {QUESTION_LABELS[key] || `Câu ${key}`}
                                                    </p>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium break-words">
                                                        {displayValue}
                                                    </p>
                                                </div>
                                                {isChoice && severity && (
                                                    <span className={`flex-none px-2 py-0.5 rounded-full text-[9px] font-bold ${SEVERITY_COLORS[severity] || 'text-slate-500 bg-slate-100'}`}>
                                                        {SEVERITY_LABELS[severity] || severity}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Donor Profile */}
                        {donor && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                                    <User className="size-3.5 text-slate-500" />
                                    Hồ sơ Người hiến
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Nhóm máu", value: donor.blood_group },
                                        { label: "Giới tính", value: donor.gender === 'male' ? 'Nam' : donor.gender === 'female' ? 'Nữ' : donor.gender },
                                        { label: "Cân nặng", value: donor.weight ? `${donor.weight} kg` : '—' },
                                        { label: "Chiều cao", value: donor.height ? `${donor.height} cm` : '—' },
                                        { label: "Ngày sinh", value: donor.dob ? format(new Date(donor.dob), 'dd/MM/yyyy') : '—' },
                                        { label: "SĐT", value: donor.phone || '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                                            <span className="text-[10px] text-slate-400 font-medium">{item.label}</span>
                                            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                                {donor.health_history && (
                                    <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                                        <p className="text-[10px] text-slate-400 font-medium mb-1">Tiền sử sức khỏe</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-300">{donor.health_history}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
