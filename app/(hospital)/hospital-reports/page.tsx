"use client";

import { useState } from "react";
import MiniFooter from "@/components/shared/MiniFooter";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";
import { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportService, HospitalReportData } from "@/services/report.service";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');

    const { user } = useAuth();
    const [reportData, setReportData] = useState<HospitalReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await reportService.getHospitalReport(user.id, timeFilter);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, timeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentData = reportData;

    // Explicit colors for charts
    const chartColors = {
        student: "#6366f1",
        office: "#34d399",
        freelance: "#fb923c",
        other: "#cbd5e1",
        fb: "#4267B2",
        school: "#EF4444",
        friends: "#F59E0B",
        zalo: "#0068FF"
    };

    if (loading) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 w-full p-20">
                <Loader2 className="size-12 animate-spin text-indigo-500" />
            </main>
        );
    }

    if (!currentData) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 w-full p-20">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-slate-200">analytics</span>
                    <p className="text-slate-500 font-medium">Chưa có dữ liệu báo cáo cho giai đoạn này.</p>
                </div>
            </main>
        );
    }

    // Remap source data for Pie Chart
    const sourceData = currentData.source.map((s, idx) => ({
        browser: s.label,
        visitors: s.count,
        fill: Object.values(chartColors)[idx + 4] // Hacky, but works for demo 
    }));

    const getFunnelWidth = (val: number, max: number) => {
        return `${Math.max((val / max) * 100, 5)}%`;
    };

    const MaterialIcon = ({ name, className = "" }: { name: string; className?: string }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900 w-full font-sans">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
                .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
            `}</style>



            <div className="p-10 space-y-8 max-w-[1600px] mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setTimeFilter('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'month' ? 'bg-white dark:bg-slate-800 shadow-soft text-[#6366f1]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Tháng này</button>
                            <button onClick={() => setTimeFilter('quarter')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'quarter' ? 'bg-white dark:bg-slate-800 shadow-soft text-[#6366f1]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Quý này</button>
                            <button onClick={() => setTimeFilter('year')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'year' ? 'bg-white dark:bg-slate-800 shadow-soft text-[#6366f1]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Năm nay</button>
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Phân tích Hiệu quả Chiến dịch</h3>
                        <p className="text-slate-500 font-medium">Theo dõi dòng chảy người hiến và chỉ số nhân khẩu học theo thời gian thực.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chia sẻ:</span>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <img key={i} alt="User" className="size-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src={`https://i.pravatar.cc/150?u=${i}`} />
                                ))}
                                <div className="size-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">+4</div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f46e5] transition-all">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Xuất Báo Cáo
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute right-0 top-0 size-24 bg-[#6366f1]/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-[#6366f1]/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">sync_alt</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Quay lại</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentData.retentionRate}%</p>
                            <span className="text-green-500 text-sm font-bold flex items-center">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {currentData.retentionGrowth}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Người hiến quay lại từ đợt trước</p>
                    </div>
                    <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute right-0 top-0 size-24 bg-[#8b5cf6]/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-[#8b5cf6]/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Hoãn hiến</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentData.deferralRate}%</p>
                            <span className={`text-sm font-bold flex items-center ${currentData.isdeferralGood ? 'text-green-500' : 'text-rose-500'}`}>
                                <span className="material-symbols-outlined text-sm">{currentData.isdeferralGood ? 'trending_down' : 'trending_up'}</span>
                                {currentData.deferralGrowth}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Hoãn do kiểm tra sức khỏe tại chỗ</p>
                    </div>
                    <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute right-0 top-0 size-24 bg-[#6366f1]/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-[#6366f1]/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                <span className="material-symbols-outlined">person_off</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Vắng mặt</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentData.noShowRate}%</p>
                            <span className={`text-sm font-bold ${currentData.isNoShowGood ? 'text-green-500' : 'text-indigo-500'}`}>{currentData.noShowGrowth}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Đăng ký nhưng không check-in</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7 bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Dòng chảy Chuyển đổi Người hiến</h4>
                                <p className="text-sm text-slate-500">Hành trình từ đăng ký đến thành công</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-[#6366f1]">{currentData.funnel.registered > 0 ? Math.round((currentData.funnel.collected / currentData.funnel.registered) * 100) : 0}%</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ chuyển đổi</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {[
                                { label: "1. Đăng ký Trực tuyến", val: currentData.funnel.registered, pct: "100%", sub: "Tổng lượng", color: "bg-indigo-100 dark:bg-indigo-900/40", textColor: "text-indigo-700 dark:text-indigo-300" },
                                { label: "2. Check-in (Có mặt)", val: currentData.funnel.arrived, pct: getFunnelWidth(currentData.funnel.arrived, currentData.funnel.registered), sub: `${currentData.funnel.registered > 0 ? Math.round((currentData.funnel.arrived / currentData.funnel.registered) * 100) : 0}% Giữ chân`, color: "bg-indigo-300 dark:bg-indigo-700", textColor: "text-indigo-900 dark:text-indigo-100" },
                                { label: "3. Khám Sàng lọc", val: currentData.funnel.screeningPass, pct: getFunnelWidth(currentData.funnel.screeningPass, currentData.funnel.registered), sub: `${currentData.funnel.registered > 0 ? Math.round((currentData.funnel.screeningPass / currentData.funnel.registered) * 100) : 0}% Đạt chuẩn`, color: "bg-[#6366f1]", textColor: "text-white" },
                                { label: "4. Hiến máu Thành công", val: currentData.funnel.collected, pct: getFunnelWidth(currentData.funnel.collected, currentData.funnel.registered), sub: `${currentData.funnel.registered > 0 ? Math.round((currentData.funnel.collected / currentData.funnel.registered) * 100) : 0}% Thành công`, color: "bg-emerald-500", textColor: "text-white" }
                            ].map((step, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-600 dark:text-slate-400">{step.label}</span>
                                        <span className="text-slate-900 dark:text-white font-extrabold">{step.val} người</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-10 rounded-xl overflow-hidden relative">
                                        <div className={`h-full transition-all duration-700 ${step.color}`} style={{ width: step.pct }}></div>
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase ${idx > 0 && idx < 2 ? 'text-indigo-800' : step.textColor}`}>
                                            {step.sub}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-400 italic text-center">Dữ liệu được cập nhật dựa trên các chiến dịch hiến máu đang hoạt động.</p>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 space-y-8">
                        {/* Demographics */}
                        <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nhân khẩu học (Nghề nghiệp)</h4>
                            </div>
                            <div className="space-y-6">
                                {currentData.demographics.map((demo, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{demo.label}</span>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{demo.pct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${demo.color}`} style={{ width: `${demo.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral Sources */}
                        <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
                                    <span className="material-symbols-outlined">share</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nguồn giới thiệu</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {currentData.source.map((src, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{src.label}</p>
                                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{src.pct}%</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{src.count} Người</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <MiniFooter />
            </div>
        </main>
    );
}
