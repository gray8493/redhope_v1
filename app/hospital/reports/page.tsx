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
    AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function ReportsPage() {
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');

    const metricsData = {
        month: {
            collected: 845, collectedGrowth: "+12.5%", isPositive: true,
            distributed: 620, distributedGrowth: "+8.1%",
            cancelled: 12, cancelledGrowth: "-2.4%", cancelledPositive: true, // Less cancelled is good usually, visually green
            avgCancelled: 25,
            comparison: "So với tháng trước (751)"
        },
        quarter: {
            collected: 2540, collectedGrowth: "+15.2%", isPositive: true,
            distributed: 2100, distributedGrowth: "+10.5%",
            cancelled: 35, cancelledGrowth: "-1.0%", cancelledPositive: true,
            avgCancelled: 40,
            comparison: "So với quý trước (2200)"
        },
        year: {
            collected: 9850, collectedGrowth: "+18.0%", isPositive: true,
            distributed: 8500, distributedGrowth: "+14.2%",
            cancelled: 120, cancelledGrowth: "+0.5%", cancelledPositive: false, // More cancelled red
            avgCancelled: 110,
            comparison: "So với năm trước (8300)"
        }
    };

    const currentData = metricsData[timeFilter];

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Báo cáo & Phân tích" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1400px] flex-1 px-4 md:px-8 space-y-8">

                            {/* Header Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-slate-500 bg-white dark:bg-[#1c162e] p-1 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] w-fit">
                                    <button
                                        onClick={() => setTimeFilter('month')}
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${timeFilter === 'month' ? 'bg-slate-100 dark:bg-[#251e36] text-[#120e1b] dark:text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        Tháng này
                                    </button>
                                    <button
                                        onClick={() => setTimeFilter('quarter')}
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${timeFilter === 'quarter' ? 'bg-slate-100 dark:bg-[#251e36] text-[#120e1b] dark:text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        Quý này
                                    </button>
                                    <button
                                        onClick={() => setTimeFilter('year')}
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${timeFilter === 'year' ? 'bg-slate-100 dark:bg-[#251e36] text-[#120e1b] dark:text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        Năm nay
                                    </button>
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

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><BarChart3 className="w-5 h-5" /></div>
                                        <p className="text-sm font-bold text-slate-500">Tổng Thu nhận</p>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">{currentData.collected}</h3>
                                        <span className="text-xs font-bold text-green-600 mb-1 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                                            <ArrowUpRight className="w-3 h-3" /> {currentData.collectedGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">{currentData.comparison}</p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><PieChart className="w-5 h-5" /></div>
                                        <p className="text-sm font-bold text-slate-500">Đã Phân phối</p>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">{currentData.distributed}</h3>
                                        <span className="text-xs font-bold text-green-600 mb-1 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                                            <ArrowUpRight className="w-3 h-3" /> {currentData.distributedGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Tỷ lệ sử dụng đạt 73%</p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                                    <p className="text-sm font-bold text-slate-500">Hủy bỏ</p>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">{currentData.cancelled}</h3>
                                        <span className={`text-xs font-bold ${currentData.cancelledPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} mb-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded`}>
                                            {currentData.cancelledPositive ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />} {currentData.cancelledGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Thấp hơn mức trung bình ({currentData.avgCancelled})</p>
                                </div>
                            </div>

                            {/* Charts Visualization */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
                                {/* Simulated Bar Chart */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm flex flex-col">
                                    <h3 className="text-lg font-bold mb-6 text-[#120e1b] dark:text-white">Xu hướng Thu nhận & Sử dụng</h3>
                                    <div className="flex-1 flex items-end justify-between gap-2 px-2">
                                        {[60, 45, 75, 50, 80, 70, 90, 85, 55, 65, 95, 80].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group cursor-pointer relative">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Usage: {h}%</div>
                                                <div className="bg-slate-200 dark:bg-slate-700 w-full rounded-t-sm" style={{ height: `${100 - h}%` }}></div>
                                                <div className="bg-[#6324eb] w-full rounded-t-md hover:bg-[#501ac2] transition-colors" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-bold uppercase">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                    </div>
                                </div>

                                {/* Demographics / Simple Stats List */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm flex flex-col">
                                    <h3 className="text-lg font-bold mb-6 text-[#120e1b] dark:text-white">Phân bố Nhóm máu (Tháng này)</h3>
                                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                        {[
                                            { label: "Nhóm O (Positive & Negative)", pct: 45, color: "bg-blue-500" },
                                            { label: "Nhóm A (Positive & Negative)", pct: 30, color: "bg-green-500" },
                                            { label: "Nhóm B (Positive & Negative)", pct: 20, color: "bg-orange-500" },
                                            { label: "Nhóm AB (Positive & Negative)", pct: 5, color: "bg-purple-500" }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between mb-1 text-sm font-bold">
                                                    <span>{item.label}</span>
                                                    <span>{item.pct}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }}></div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-bold text-slate-500 mb-3">Tải xuống Báo cáo Chi tiết</h4>
                                            <div className="flex gap-3">
                                                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl flex-1 hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><FileText className="w-4 h-4" /></div>
                                                    <div>
                                                        <p className="text-sm font-bold">Báo cáo An toàn</p>
                                                        <p className="text-xs text-slate-400">PDF • 2.4 MB</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl flex-1 hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText className="w-4 h-4" /></div>
                                                    <div>
                                                        <p className="text-sm font-bold">Báo cáo Tài chính</p>
                                                        <p className="text-xs text-slate-400">XLSX • 1.1 MB</p>
                                                    </div>
                                                </div>
                                            </div>
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
