"use client";

import { useState } from "react";
import MiniFooter from "@/components/shared/MiniFooter";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
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
import { Loader2, TrendingUp, TrendingDown, Users, Calendar, Activity, Database, Download, Share2 } from "lucide-react";

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

    if (loading) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 w-full p-20 medical-gradient">
                <Loader2 className="size-12 animate-spin text-med-primary" />
                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu lâm sàng...</p>
            </main>
        );
    }

    if (!currentData) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 w-full p-20 medical-gradient">
                <div className="text-center space-y-6">
                    <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Database className="size-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Chưa có dữ liệu hệ thống</p>
                </div>
            </main>
        );
    }

    const chartColors = ["#0D9488", "#0369A1", "#0284C7", "#7DD3FC", "#F43F5E", "#F59E0B"];

    const sourceData = currentData.source.map((s, idx) => ({
        name: s.label,
        value: s.count,
        fill: chartColors[idx % chartColors.length]
    }));

    return (
        <main className="flex-1 flex flex-col overflow-y-auto w-full medical-gradient pb-20">
            <header className="p-8 md:p-12 border-b border-slate-200/50 bg-white/60 backdrop-blur-xl sticky top-0 z-30">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-[1600px] mx-auto w-full">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Trung tâm Phân tích</span>
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        </div>
                        <h2 className="text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight leading-none">Báo cáo Hoạt động <span className="text-med-primary underline decoration-emerald-200 decoration-8 underline-offset-4">Lâm sàng</span></h2>
                        <p className="text-slate-500 text-sm font-medium italic opacity-80">Phân tích chuyên sâu về phễu tiếp nhận và cơ cấu nhân khẩu học.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-xl">
                            {['month', 'quarter', 'year'].map((id) => (
                                <button
                                    key={id}
                                    onClick={() => setTimeFilter(id as any)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${timeFilter === id
                                        ? 'bg-white text-med-primary shadow-xl shadow-slate-300/20 scale-105'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {id === 'month' ? 'Tháng' : id === 'quarter' ? 'Quý' : 'Năm'}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-3 px-6 py-3.5 bg-med-primary text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-med-primary/30 hover:shadow-med-primary/40 hover:-translate-y-0.5 transition-all active:translate-y-0">
                            <Download className="size-4" /> Xuất dữ liệu
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto w-full">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <SummaryCard
                        title="Tỉ lệ Quay lại"
                        value={`${currentData.retentionRate}%`}
                        growth={currentData.retentionGrowth}
                        icon={Users}
                        color="teal"
                        desc="Tỉ lệ người hiến quay lại trong chu kỳ"
                    />
                    <SummaryCard
                        title="Tỉ lệ Hoãn hiến"
                        value={`${currentData.deferralRate}%`}
                        growth={currentData.deferralGrowth}
                        icon={Activity}
                        color="amber"
                        desc="Các ca không đạt chuẩn sàng lọc y tế"
                        inverse
                    />
                    <SummaryCard
                        title="Tỉ lệ vắng mặt"
                        value={`${currentData.noShowRate}%`}
                        growth={currentData.noShowGrowth}
                        icon={Calendar}
                        color="rose"
                        desc="Ca đăng ký thành công nhưng không đến"
                        inverse
                    />
                </div>

                <div className="grid grid-cols-12 gap-12">
                    {/* Funnel Section */}
                    <div className="col-span-12 lg:col-span-7 bg-white/70 backdrop-blur-xl rounded-[40px] border border-slate-100 p-10 shadow-med">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-medical-header text-slate-900 tracking-tight">Phễu Tiếp nhận & Chuyển đổi</h3>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Tối ưu +5%</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Đăng ký (Trực tuyến)', value: currentData.funnel.registered, color: 'bg-med-primary' },
                                { label: 'Có mặt (Khám lâm sàng)', value: currentData.funnel.arrived, color: 'bg-med-blue' },
                                { label: 'Thu nhận (Thành công)', value: currentData.funnel.collected, color: 'bg-emerald-500' }
                            ].map((step, idx, arr) => {
                                const maxWidth = 100;
                                const width = (step.value / arr[0].value) * 100;
                                const conversion = idx > 0 ? (step.value / arr[idx - 1].value * 100).toFixed(1) : 100;

                                return (
                                    <div key={idx} className="relative group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{step.label}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-medical-header text-slate-900">{step.value} <span className="text-[10px] text-slate-300 font-bold uppercase italic ml-1">Ca</span></span>
                                                {idx > 0 && <span className="text-[10px] font-black text-emerald-500">Chuyển đổi {conversion}%</span>}
                                            </div>
                                        </div>
                                        <div className="h-14 w-full bg-slate-50 rounded-3xl overflow-hidden p-1.5 border border-slate-100 shadow-inner group-hover:border-med-primary/20 transition-all">
                                            <div
                                                className={`h-full ${step.color} rounded-2xl shadow-lg transition-all duration-1000 ease-out flex items-center justify-end pr-6 relative overflow-hidden`}
                                                style={{ width: `${width}%` }}
                                            >
                                                <div className="absolute top-0 right-0 h-full w-24 bg-white/10 skew-x-[-20deg] translate-x-12 animate-pulse"></div>
                                                <span className="text-white text-[10px] font-black">{Math.round(width)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Source Pie Section */}
                    <div className="col-span-12 lg:col-span-5 bg-white/70 backdrop-blur-xl rounded-[40px] border border-slate-100 p-10 shadow-med">
                        <h3 className="text-2xl font-medical-header text-slate-900 tracking-tight mb-12">Nguồn Tiếp cận Người hiến</h3>
                        <div className="h-[300px] w-full relative">
                            <ChartContainer
                                config={sourceData.reduce((acc, cur) => {
                                    acc[cur.name] = { label: cur.name, color: cur.fill };
                                    return acc;
                                }, {} as any)}
                                className="w-full h-full"
                            >
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={8}
                                        dataKey="value"
                                        nameKey="name"
                                        stroke="none"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                                </PieChart>
                            </ChartContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <Share2 className="size-6 text-slate-200 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kênh Social</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {sourceData.map((s, idx) => (
                                <div key={idx} className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:border-med-primary/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: s.fill, backgroundColor: s.fill }}></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-slate-900 transition-colors">{s.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-12">
                    {/* Demographics Bar Chart */}
                    <div className="col-span-12 bg-white/70 backdrop-blur-xl rounded-[40px] border border-slate-100 p-10 shadow-med overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div>
                                <h3 className="text-2xl font-medical-header text-slate-900 tracking-tight">Thống kê Độ tuổi & Nghề nghiệp</h3>
                                <p className="text-slate-400 text-sm mt-1">Phân mảnh hành vi dựa trên báo cáo y tế tổng quát.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 bg-med-primary rounded"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Học sinh/SV</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 bg-med-blue rounded"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Khác</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ChartContainer config={{
                                student: { label: "Học sinh/SV", color: "#0D9488" },
                                office: { label: "Văn phòng", color: "#0369A1" },
                                freelance: { label: "Lao động tự do", color: "#F43F5E" },
                                other: { label: "Khác", color: "#F59E0B" },
                            }} className="w-full h-full">
                                <BarChart data={currentData.demographics} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="age"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="student"
                                        fill="var(--color-student)"
                                        radius={[8, 8, 0, 0]}
                                        barSize={18}
                                    />
                                    <Bar
                                        dataKey="office"
                                        fill="var(--color-office)"
                                        radius={[8, 8, 0, 0]}
                                        barSize={18}
                                    />
                                    <Bar
                                        dataKey="freelance"
                                        fill="var(--color-freelance)"
                                        radius={[8, 8, 0, 0]}
                                        barSize={18}
                                    />
                                    <Bar
                                        dataKey="other"
                                        fill="var(--color-other)"
                                        radius={[8, 8, 0, 0]}
                                        barSize={18}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </div>
            </div>
            <MiniFooter />
        </main>
    );
}

function SummaryCard({ title, value, growth, icon: Icon, color, desc, inverse }: any) {
    const isPositive = growth?.startsWith('+');
    const isGood = inverse ? !isPositive : isPositive;

    const colors: any = {
        teal: 'text-med-primary bg-med-primary/10 border-med-primary/20',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100'
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-slate-100 shadow-med hover:shadow-med-hover hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 size-32 bg-slate-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
                <div className={`size-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
                    <Icon className="size-6" />
                </div>
            </div>
            <div className="relative z-10">
                <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl font-medical-header text-slate-900 tracking-tighter">{value}</span>
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${isGood ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {growth}
                    </div>
                </div>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-[200px]">{desc}</p>
            </div>
        </div>
    );
}
