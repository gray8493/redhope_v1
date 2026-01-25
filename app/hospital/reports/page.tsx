"use client";

import { useState } from "react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function ReportsPage() {
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');
    const [eventTab, setEventTab] = useState<'all' | 'completed' | 'ongoing'>('all');

    // Dữ liệu mẫu (Data Model)
    const metricsData = {
        month: {
            retentionRate: 45, retentionGrowth: "4.2%", isPositive: true,
            deferralRate: 12, deferralGrowth: "1.5%", isdeferralGood: true,
            noShowRate: 8, noShowGrowth: "+0.5%", isNoShowGood: false,
            funnel: { registered: 150, arrived: 135, screeningPass: 110, collected: 105 },
            demographics: [
                { label: "Sinh viên", pct: 55, color: "bg-[#6366f1]" },
                { label: "Văn phòng", pct: 25, color: "bg-emerald-400" },
                { label: "Lao động tự do", pct: 15, color: "bg-orange-400" },
                { label: "Khác", pct: 5, color: "bg-slate-300" }
            ],
            source: [
                { label: "Facebook", count: 85, pct: 45 },
                { label: "Trường học", count: 45, pct: 25 },
                { label: "Bạn bè", count: 35, pct: 20 },
                { label: "Zalo/SMS", count: 20, pct: 10 }
            ]
        },
        quarter: {
            retentionRate: 48, retentionGrowth: "6.0%", isPositive: true,
            deferralRate: 11, deferralGrowth: "2.0%", isdeferralGood: true,
            noShowRate: 7.5, noShowGrowth: "-0.8%", isNoShowGood: true,
            funnel: { registered: 450, arrived: 410, screeningPass: 340, collected: 325 },
            demographics: [
                { label: "Sinh viên", pct: 50, color: "bg-[#6366f1]" },
                { label: "Văn phòng", pct: 30, color: "bg-emerald-400" },
                { label: "Lao động tự do", pct: 15, color: "bg-orange-400" },
                { label: "Khác", pct: 5, color: "bg-slate-300" }
            ],
            source: [
                { label: "Facebook", count: 200, pct: 40 },
                { label: "Trường học", count: 150, pct: 30 },
                { label: "Bạn bè", count: 100, pct: 20 },
                { label: "Zalo/SMS", count: 50, pct: 10 }
            ]
        },
        year: {
            retentionRate: 52, retentionGrowth: "8.5%", isPositive: true,
            deferralRate: 10, deferralGrowth: "3.0%", isdeferralGood: true,
            noShowRate: 6, noShowGrowth: "-2.0%", isNoShowGood: true,
            funnel: { registered: 1800, arrived: 1650, screeningPass: 1400, collected: 1350 },
            demographics: [
                { label: "Sinh viên", pct: 45, color: "bg-[#6366f1]" },
                { label: "Văn phòng", pct: 35, color: "bg-emerald-400" },
                { label: "Lao động tự do", pct: 15, color: "bg-orange-400" },
                { label: "Khác", pct: 5, color: "bg-slate-300" }
            ],
            source: [
                { label: "Facebook", count: 700, pct: 38 },
                { label: "Trường học", count: 600, pct: 32 },
                { label: "Bạn bè", count: 400, pct: 22 },
                { label: "Zalo/SMS", count: 150, pct: 8 }
            ]
        }
    };

    const currentData = metricsData[timeFilter];

    const getFunnelWidth = (val: number, max: number) => {
        return `${Math.max((val / max) * 100, 5)}%`;
    };

    const MaterialIcon = ({ name, className = "" }: { name: string; className?: string }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f8fafc] dark:bg-[#161121] font-sans text-slate-800 dark:text-white text-left">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Báo cáo & Phân tích" />

                    <main className="flex-1 flex flex-col overflow-y-auto">
                        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full text-left">

                            {/* Header Section */}
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTimeFilter('month')}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'month' ? 'bg-white shadow-md text-slate-900 border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            Tháng này
                                        </button>
                                        <button
                                            onClick={() => setTimeFilter('quarter')}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'quarter' ? 'bg-white shadow-md text-slate-900 border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            Quý này
                                        </button>
                                        <button
                                            onClick={() => setTimeFilter('year')}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'year' ? 'bg-white shadow-md text-slate-900 border border-slate-100' : 'text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            Năm nay
                                        </button>
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Phân tích Hiệu quả Chiến dịch</h3>
                                    <p className="text-slate-500 font-medium font-sans">Báo cáo thời gian thực về dòng chảy người hiến và chỉ số nhân khẩu học.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end gap-1 font-sans">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quyền truy cập nhóm:</span>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="size-8 rounded-full border-2 border-white dark:border-[#2d263d] bg-slate-200 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="size-full object-cover" />
                                                </div>
                                            ))}
                                            <div className="size-8 rounded-full border-2 border-white dark:border-[#2d263d] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 font-sans">+4</div>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-[#6366f1] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-[#4f46e5] transition-all font-sans">
                                        <MaterialIcon name="download" className="text-lg" />
                                        Xuất Báo Cáo
                                    </button>
                                </div>
                            </div>

                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Retention Rate */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-sm border border-slate-50 dark:border-[#2d263d] relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 size-24 bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4 transition-colors"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                            <MaterialIcon name="sync_alt" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider font-sans">Tỷ lệ Quay lại</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentData.retentionRate}%</p>
                                        <span className="text-green-500 text-sm font-bold flex items-center font-sans">
                                            <MaterialIcon name="trending_up" className="text-sm" />
                                            {currentData.retentionGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium font-sans">Người hiến quay lại từ đợt trước</p>
                                </div>

                                {/* Deferral Rate */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-sm border border-slate-50 dark:border-[#2d263d] relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 size-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-colors"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                            <MaterialIcon name="medical_services" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider font-sans">Tỷ lệ Hoãn hiến</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentData.deferralRate}%</p>
                                        <span className={`text-sm font-bold flex items-center font-sans ${currentData.isdeferralGood ? 'text-green-500' : 'text-rose-500'}`}>
                                            <MaterialIcon name={currentData.isdeferralGood ? "trending_down" : "trending_up"} className="text-sm" />
                                            {currentData.deferralGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium font-sans">Hoãn do kiểm tra sức khỏe tại chỗ</p>
                                </div>

                                {/* No-Show Rate */}
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-sm border border-slate-50 dark:border-[#2d263d] relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 size-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4 transition-colors"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                            <MaterialIcon name="person_off" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider font-sans">Tỷ lệ Vắng mặt</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentData.noShowRate}%</p>
                                        <span className={`text-sm font-bold font-sans ${currentData.isNoShowGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {currentData.noShowGrowth}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium font-sans">Đăng ký nhưng không check-in</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-8">
                                {/* Donor Conversion Flow */}
                                <div className="col-span-12 lg:col-span-7 bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-sm border border-slate-50 dark:border-[#2d263d]">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="text-left font-sans">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Dòng chảy Chuyển đổi Người hiến</h4>
                                            <p className="text-sm text-slate-500">Hành trình từ đăng ký đến thành công (Success rate)</p>
                                        </div>
                                        <div className="text-right font-sans">
                                            <span className="text-3xl font-black text-[#6366f1]">{Math.round((currentData.funnel.collected / currentData.funnel.registered) * 100)}%</span>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiệu suất tổng thể</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8 font-sans">
                                        {[
                                            { label: "1. Đăng ký Trực tuyến", val: currentData.funnel.registered, sub: "100% Tổng lượng", color: "bg-indigo-100 text-indigo-700", width: "100%" },
                                            { label: "2. Check-in (Có mặt)", val: currentData.funnel.arrived, sub: `${Math.round((currentData.funnel.arrived / currentData.funnel.registered) * 100)}% Giữ chân`, color: "bg-indigo-300 text-indigo-800", width: getFunnelWidth(currentData.funnel.arrived, currentData.funnel.registered) },
                                            { label: "3. Khám Sàng lọc", val: currentData.funnel.screeningPass, sub: `${Math.round((currentData.funnel.screeningPass / currentData.funnel.registered) * 100)}% Đạt chuẩn`, color: "bg-[#6366f1] text-white", width: getFunnelWidth(currentData.funnel.screeningPass, currentData.funnel.registered) },
                                            { label: "4. Hiến máu Thành công", val: currentData.funnel.collected, sub: `${Math.round((currentData.funnel.collected / currentData.funnel.registered) * 100)}% Thành công`, color: "bg-emerald-500 text-white", width: getFunnelWidth(currentData.funnel.collected, currentData.funnel.registered) }
                                        ].map((step, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span className="text-slate-600 dark:text-slate-400">{step.label}</span>
                                                    <span className="text-slate-900 dark:text-white font-extrabold">{step.val} người</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-10 rounded-xl overflow-hidden relative">
                                                    <div className={`h-full transition-all duration-700 ${step.color}`} style={{ width: step.width }}></div>
                                                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider ${idx > 1 ? 'text-white' : ''}`}>
                                                        {step.sub}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#2d263d] font-sans">
                                        <p className="text-xs text-slate-400 italic text-center">Dữ liệu được cập nhật dựa trên các chiến dịch hiến máu đang hoạt động.</p>
                                    </div>
                                </div>

                                {/* Right Side Charts */}
                                <div className="col-span-12 lg:col-span-5 space-y-8 font-sans">
                                    {/* Demographics Card */}
                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-sm border border-slate-50 dark:border-[#2d263d]">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                                <MaterialIcon name="groups" />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nhân khẩu học (Nghề nghiệp)</h4>
                                        </div>
                                        <div className="space-y-6">
                                            {currentData.demographics.map((item, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{item.pct}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Referral Sources Card */}
                                    <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-sm border border-slate-50 dark:border-[#2d263d]">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
                                                <MaterialIcon name="share" />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nguồn giới thiệu</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {currentData.source.map((item, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-[#2d263d] text-left">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</p>
                                                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{item.pct}%</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">{item.count} Người hiến</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Events Table */}
                            <div className="bg-white dark:bg-[#1c162e] rounded-3xl shadow-sm border border-slate-100 dark:border-[#2d263d] overflow-hidden font-sans">
                                <div className="p-8 border-b border-slate-100 dark:border-[#2d263d] flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white px-2 py-1">Sự kiện Gần đây</h4>
                                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                            <button
                                                onClick={() => setEventTab('all')}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${eventTab === 'all' ? 'bg-white dark:bg-[#1c162e] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Tất cả
                                            </button>
                                            <button
                                                onClick={() => setEventTab('completed')}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${eventTab === 'completed' ? 'bg-white dark:bg-[#1c162e] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Hoàn thành
                                            </button>
                                            <button
                                                onClick={() => setEventTab('ongoing')}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${eventTab === 'ongoing' ? 'bg-white dark:bg-[#1c162e] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Đang diễn ra
                                            </button>
                                        </div>
                                    </div>
                                    <button className="text-[#6366f1] text-sm font-bold flex items-center gap-1 hover:underline px-2 py-1 rounded">
                                        Xem tất cả sự kiện <MaterialIcon name="arrow_forward" className="text-sm" />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 dark:bg-slate-800/30 font-sans">
                                            <tr>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Chi tiết Sự kiện</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Địa điểm</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Người tham gia</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Lượng thu thập</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Trạng thái</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-[#2d263d] font-sans">
                                            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">Ngày hội Giọt hồng 2024</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">24/10/2023 • 09:00 AM</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        <MaterialIcon name="location_on" className="text-slate-400 text-sm" />
                                                        Sảnh Chính, Tòa B
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">142</span>
                                                        <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="bg-[#6366f1] h-full w-[80%]"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-extrabold text-slate-900 dark:text-white">128.5 <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">ĐƠN VỊ</span></td>
                                                <td className="px-8 py-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30">
                                                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                        Hoàn thành
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-[#6366f1] hover:text-white transition-all flex items-center justify-center ml-auto">
                                                        <MaterialIcon name="description" className="text-lg" />
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">Chiến dịch Khẩn cấp Nhóm O</span>
                                                        <span className="text-[10px] font-bold text-[#6366f1] uppercase mt-0.5">Đang diễn ra • Bắt đầu hôm nay</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        <MaterialIcon name="location_on" className="text-slate-400 text-sm" />
                                                        Cổng Cấp cứu
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">38</span>
                                                        <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="bg-[#6366f1] h-full w-[30%]"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-extrabold text-slate-900 dark:text-white">32.0 <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">ĐƠN VỊ</span></td>
                                                <td className="px-8 py-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800/30">
                                                        <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                                        Trực tiếp
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-300 cursor-not-allowed flex items-center justify-center ml-auto">
                                                        <MaterialIcon name="hourglass_empty" className="text-lg" />
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-[#2d263d]">
                                    <p className="text-xs font-bold text-slate-400 font-sans">Đang hiển thị <span className="text-slate-900 dark:text-white">1-10</span> của <span className="text-slate-900 dark:text-white">42</span> sự kiện</p>
                                    <div className="flex gap-2">
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-[#2d263d] flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all">
                                            <MaterialIcon name="chevron_left" className="text-lg" />
                                        </button>
                                        <button className="size-9 rounded-lg bg-[#6366f1] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/20">1</button>
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-[#2d263d] flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all">2</button>
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-[#2d263d] flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all">3</button>
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-[#2d263d] flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all">
                                            <MaterialIcon name="chevron_right" className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Reports Footer */}
                            <footer className="pt-12 pb-16 text-center text-slate-400 font-sans">
                                <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 cursor-pointer transition-colors">Chính sách bảo mật</span>
                                    <div className="size-1 bg-slate-200 rounded-full hidden sm:block"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 cursor-pointer transition-colors">Điều khoản Tuân thủ</span>
                                    <div className="size-1 bg-slate-200 rounded-full hidden sm:block"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 cursor-pointer transition-colors">Hỗ trợ Kỹ thuật</span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.1em]">© 2024 REDHOPE MEDICAL SYSTEMS • Hệ thống Phân tích Thông minh v2.8</p>
                            </footer>
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>
        </div>
    );
}
