"use client";

import {
    BarChart3,
    PieChart,
    Download,
    Calendar,
    Share2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    AlertTriangle,
    Repeat,
    UserX,
    Users,
    Activity
} from "lucide-react";
import { useState } from "react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function ReportsPage() {
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');

    // New Data Model for Donor Health
    const metricsData = {
        month: {
            retentionRate: 45, retentionGrowth: "+4.2%", isPositive: true,
            deferralRate: 12, deferralGrowth: "-1.5%", isdeferralGood: true, // Lower is good
            noShowRate: 8, noShowGrowth: "+0.5%", isNoShowGood: false, // Lower is good
            funnel: { registered: 150, arrived: 135, screeningPass: 110, collected: 105 },
            demographics: [
                { label: "Sinh viên", pct: 55, color: "bg-blue-500" },
                { label: "Văn phòng", pct: 25, color: "bg-emerald-500" },
                { label: "Công nhân", pct: 15, color: "bg-amber-500" },
                { label: "Khác", pct: 5, color: "bg-slate-400" }
            ],
            source: [
                { label: "Facebook", count: 85, pct: 45 },
                { label: "Trường học/Cty", count: 45, pct: 25 },
                { label: "Bạn bè rủ", count: 35, pct: 20 },
                { label: "Zalo/Khác", count: 20, pct: 10 }
            ]
        },
        quarter: {
            retentionRate: 48, retentionGrowth: "+6.0%", isPositive: true,
            deferralRate: 11, deferralGrowth: "-2.0%", isdeferralGood: true,
            noShowRate: 7.5, noShowGrowth: "-0.8%", isNoShowGood: true,
            funnel: { registered: 450, arrived: 410, screeningPass: 340, collected: 325 },
            demographics: [
                { label: "Sinh viên", pct: 50, color: "bg-blue-500" },
                { label: "Văn phòng", pct: 30, color: "bg-emerald-500" },
                { label: "Công nhân", pct: 15, color: "bg-amber-500" },
                { label: "Khác", pct: 5, color: "bg-slate-400" }
            ],
            source: [
                { label: "Facebook", count: 200, pct: 40 },
                { label: "Trường học/Cty", count: 150, pct: 30 },
                { label: "Bạn bè rủ", count: 100, pct: 20 },
                { label: "Zalo/Khác", count: 50, pct: 10 }
            ]
        },
        year: {
            retentionRate: 52, retentionGrowth: "+8.5%", isPositive: true,
            deferralRate: 10, deferralGrowth: "-3.0%", isdeferralGood: true,
            noShowRate: 6, noShowGrowth: "-2.0%", isNoShowGood: true,
            funnel: { registered: 1800, arrived: 1650, screeningPass: 1400, collected: 1350 },
            demographics: [
                { label: "Sinh viên", pct: 45, color: "bg-blue-500" },
                { label: "Văn phòng", pct: 35, color: "bg-emerald-500" },
                { label: "Công nhân", pct: 15, color: "bg-amber-500" },
                { label: "Khác", pct: 5, color: "bg-slate-400" }
            ],
            source: [
                { label: "Facebook", count: 700, pct: 38 },
                { label: "Trường học/Cty", count: 600, pct: 32 },
                { label: "Bạn bè rủ", count: 400, pct: 22 },
                { label: "Zalo/Khác", count: 150, pct: 8 }
            ]
        }
    };

    const currentData = metricsData[timeFilter];

    // Helper to calculate bar width for funnel relative to Registered (100%)
    const getFunnelWidth = (val: number, max: number) => {
        return `${Math.max((val / max) * 100, 5)}%`;
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Báo cáo & Phân tích" />

                    <main className="flex flex-1 justify-center py-10">
                        <div className="flex flex-col max-w-[1600px] flex-1 px-6 md:px-10 space-y-10">

                            {/* Header Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-slate-500 bg-white dark:bg-[#1c162e] p-1 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] w-fit">
                                    {(['month', 'quarter', 'year'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTimeFilter(t)}
                                            className={`px-4 py-2 rounded-md font-bold text-sm transition-all capitalize ${timeFilter === t ? 'bg-slate-100 dark:bg-[#251e36] text-[#120e1b] dark:text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            {t === 'month' ? 'Tháng này' : t === 'quarter' ? 'Quý này' : 'Năm nay'}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                        Chia sẻ
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#6324eb] text-white rounded-xl text-sm font-bold hover:bg-[#501ac2] transition-colors shadow-lg shadow-[#6324eb]/20">
                                        <Download className="w-4 h-4" />
                                        Xuất PDF
                                    </button>
                                </div>
                            </div>

                            {/* 1. KPI Cards: Donor Health */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Retention Rate */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Repeat className="w-5 h-5" /></div>
                                        <p className="text-sm font-bold text-slate-500">Tỷ lệ Quay lại</p>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">{currentData.retentionRate}%</h3>
                                        <span className="text-xs font-bold text-green-600 mb-1 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                                            <ArrowUpRight className="w-3 h-3" /> {currentData.retentionGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Người hiến lần đầu quay lại lần 2</p>
                                </div>

                                {/* Deferral Rate */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Activity className="w-5 h-5" /></div>
                                        <p className="text-sm font-bold text-slate-500">Tỷ lệ Hoãn hiến</p>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">{currentData.deferralRate}%</h3>
                                        <span className={`text-xs font-bold ${currentData.isdeferralGood ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} mb-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded`}>
                                            <ArrowDownRight className="w-3 h-3" /> {currentData.deferralGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Từ chối do sức khỏe (Huyết áp, Thiếu máu...)</p>
                                </div>

                                {/* No-Show Rate */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="p-2 bg-red-100 w-fit rounded-lg text-red-600 mb-2"><UserX className="w-5 h-5" /></div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">Tỷ lệ Vắng mặt</p>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">{currentData.noShowRate}%</h3>
                                        <span className={`text-xs font-bold ${currentData.isNoShowGood ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} mb-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded`}>
                                            <ArrowDownRight className="w-3 h-3" /> {currentData.noShowGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Đăng ký nhưng không đến check-in</p>
                                </div>
                            </div>

                            {/* 2. Charts Visualization */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Donation Funnel */}
                                <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm flex flex-col h-auto lg:col-span-3">
                                    <h3 className="text-lg font-bold mb-6 text-[#120e1b] dark:text-white">Phễu Hiến máu (Dòng chảy người hiến)</h3>
                                    <div className="flex flex-col gap-4 flex-1 justify-center">
                                        {/* Step 1: Registered */}
                                        <div className="relative group">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span className="text-slate-600 dark:text-slate-300">1. Đăng ký Online</span>
                                                <span className="text-slate-900 dark:text-white">{currentData.funnel.registered}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg overflow-hidden relative">
                                                <div className="bg-blue-100 text-blue-700 h-full rounded-lg flex items-center px-4 text-xs font-bold transition-all" style={{ width: '100%' }}>100%</div>
                                            </div>
                                        </div>
                                        {/* Step 2: Check-in */}
                                        <div className="relative group pl-4">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span className="text-slate-600 dark:text-slate-300">2. Check-in (Đến nơi)</span>
                                                <span className="text-slate-900 dark:text-white">{currentData.funnel.arrived}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg overflow-hidden relative">
                                                <div className="bg-blue-200 text-blue-800 h-full rounded-lg flex items-center px-4 text-xs font-bold transition-all" style={{ width: getFunnelWidth(currentData.funnel.arrived, currentData.funnel.registered) }}>
                                                    {Math.round((currentData.funnel.arrived / currentData.funnel.registered) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                        {/* Step 3: Screening */}
                                        <div className="relative group pl-8">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span className="text-slate-600 dark:text-slate-300">3. Đạt Sàng lọc</span>
                                                <span className="text-slate-900 dark:text-white">{currentData.funnel.screeningPass}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg overflow-hidden relative">
                                                <div className="bg-blue-400 text-white h-full rounded-lg flex items-center px-4 text-xs font-bold transition-all" style={{ width: getFunnelWidth(currentData.funnel.screeningPass, currentData.funnel.registered) }}>
                                                    {Math.round((currentData.funnel.screeningPass / currentData.funnel.registered) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                        {/* Step 4: Collected */}
                                        <div className="relative group pl-12">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span className="text-slate-600 dark:text-slate-300">4. Hiến thành công</span>
                                                <span className="text-slate-900 dark:text-white">{currentData.funnel.collected}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg overflow-hidden relative">
                                                <div className="bg-emerald-500 text-white h-full rounded-lg flex items-center px-4 text-xs font-bold transition-all shadow-lg shadow-emerald-500/30" style={{ width: getFunnelWidth(currentData.funnel.collected, currentData.funnel.registered) }}>
                                                    {Math.round((currentData.funnel.collected / currentData.funnel.registered) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-6 italic">Biểu đồ thể hiện tỷ lệ chuyển đổi qua các bước của quy trình hiến máu.</p>
                                </div>

                                {/* 3. Demographics & Source Analysis */}
                                <div className="flex flex-col gap-8 lg:col-span-2">
                                    {/* Demographics Pie-ish */}
                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm flex flex-col">
                                        <h3 className="text-lg font-bold mb-4 text-[#120e1b] dark:text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-slate-500" />
                                            Phân tích Đối tượng (Độ tuổi & Nghề nghiệp)
                                        </h3>
                                        <div className="space-y-4">
                                            {currentData.demographics.map((item, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between mb-1 text-sm font-bold">
                                                        <span>{item.label}</span>
                                                        <span>{item.pct}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                                        <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Source Analysis */}
                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm flex flex-col flex-1">
                                        <h3 className="text-lg font-bold mb-4 text-[#120e1b] dark:text-white flex items-center gap-2">
                                            <Share2 className="w-5 h-5 text-slate-500" />
                                            Nguồn giới thiệu
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {currentData.source.map((item, i) => (
                                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">{item.label}</p>
                                                    <p className="text-xl font-black text-[#120e1b] dark:text-white">{item.pct}%</p>
                                                    <p className="text-[10px] text-slate-400">{item.count} người</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div >
        </div >
    );
}
