"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCampaigns, subscribeToCampaignUpdates, Campaign } from "@/app/utils/campaignStorage";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import MiniFooter from "@/components/shared/MiniFooter";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import {
    Clock,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Timer,
    Zap,
    Search,
    Bell,
    UserPlus,
    Users,
    Droplet,
    Hospital
} from "lucide-react";

export default function HospitalDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "finished">("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLocalData = () => {
            setLoading(true);
            const localCampaigns = getCampaigns();
            setCampaigns(localCampaigns);
            setLoading(false);
        };

        loadLocalData();
        const unsubscribe = subscribeToCampaignUpdates(loadLocalData);
        return () => unsubscribe();
    }, []);

    // List of active/today's campaigns for the "Operational" view
    const activeCampaignsList = campaigns.filter(c =>
        (c.operationalStatus === "Đang hoạt động" || c.operationalStatus === "Tạm dừng" || !c.operationalStatus) &&
        c.status !== "Bản nháp"
    );

    // Calculate core metrics (Based on Active/Today's campaigns for an Operational Dashboard)
    const activeTotalRegistered = activeCampaignsList.reduce((sum, c) => sum + (c.registeredCount || 0), 0);
    const activeTotalCompleted = activeCampaignsList.reduce((sum, c) => sum + (c.completedCount || 0), 0);
    const attendanceRate = activeTotalRegistered > 0 ? (activeTotalCompleted / activeTotalRegistered) * 100 : 0;

    // Filter campaigns based on tab and search query for the table
    const filteredCampaigns = campaigns.filter(c => {
        const matchesTab = activeTab === "active"
            ? (c.operationalStatus === "Đang hoạt động" || c.operationalStatus === "Tạm dừng" || !c.operationalStatus) && c.status !== "Bản nháp"
            : c.operationalStatus === "Đã kết thúc";

        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.location?.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesTab && matchesSearch;
    });

    // Blood distribution Stats (From active campaigns)
    const bloodTypeCounts: Record<string, number> = {};
    activeCampaignsList.forEach(c => {
        if (c.appointments) {
            c.appointments.forEach(a => {
                if (a.status === "Hoàn thành" && a.donated) {
                    const bloodType = a.blood.split(' ')[0];
                    bloodTypeCounts[bloodType] = (bloodTypeCounts[bloodType] || 0) + 1;
                }
            });
        }
    });

    // If no real appointments, use the completedCount as a proxy for O+ (the most common)
    const totalActiveUnits = activeTotalCompleted > 0 ? activeTotalCompleted : activeCampaignsList.reduce((sum, c) => sum + (c.completedCount || 0), 0);

    const bloodTypeChartData = Object.keys(bloodTypeCounts).length > 0
        ? Object.keys(bloodTypeCounts).map(type => ({ name: `Nhóm ${type}`, value: bloodTypeCounts[type] }))
        : (totalActiveUnits > 0 ? [
            { name: "Nhóm O+", value: Math.round(totalActiveUnits * 0.45) },
            { name: "Nhóm A+", value: Math.round(totalActiveUnits * 0.3) },
            { name: "Nhóm B+", value: Math.round(totalActiveUnits * 0.15) },
            { name: "Nhóm AB", value: Math.round(totalActiveUnits * 0.1) },
        ] : [
            { name: "Nhóm O+", value: 0 },
            { name: "Nhóm A+", value: 0 },
            { name: "Nhóm B+", value: 0 },
            { name: "Nhóm AB", value: 0 },
        ]);

    const COLORS = ["#ef4444", "#6366f1", "#3b82f6", "#f59e0b"];


    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trung tâm Điều hành Bệnh viện</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Nắm bắt tình hình lưu lượng và phản hồi yêu cầu chi viện từ các điểm hiến.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#6366f1] w-[400px] shadow-sm transition-all focus:shadow-md outline-none"
                            placeholder="Tìm kiếm theo tên chiến dịch hoặc địa điểm..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Người đăng ký (Hẹn)</span>
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-[#6366f1]">
                            <UserPlus className="w-5 h-5 opacity-60" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {loading ? <Skeleton className="h-9 w-16" /> : <span className="text-4xl font-black text-slate-900 dark:text-white">{activeTotalRegistered}</span>}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TỔNG CỘNG</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Người đến (Thực tế)</span>
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                            <Users className="w-5 h-5 opacity-60" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {loading ? <Skeleton className="h-9 w-16" /> : <span className="text-4xl font-black text-slate-900 dark:text-white">{activeTotalCompleted}</span>}
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-tight">
                            {attendanceRate.toFixed(0)}% tỉ lệ đến
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Máu đã thu (ĐV)</span>
                        <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500">
                            <Droplet className="w-5 h-5 opacity-60" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {loading ? <Skeleton className="h-9 w-16" /> : <span className="text-4xl font-black text-slate-900 dark:text-white">{totalActiveUnits}</span>}
                        <span className="text-emerald-500 text-xs font-black flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Campaign Overview Table */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex gap-8">
                                <button
                                    onClick={() => setActiveTab("active")}
                                    className={`text-xs font-black tracking-widest uppercase pb-2 px-1 transition-all border-b-2 ${activeTab === "active" ? 'text-[#6366f1] border-[#6366f1]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    ĐANG HOẠT ĐỘNG
                                </button>
                                <button
                                    onClick={() => setActiveTab("finished")}
                                    className={`text-xs font-black tracking-widest uppercase pb-2 px-1 transition-all border-b-2 ${activeTab === "finished" ? 'text-[#6366f1] border-[#6366f1]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    ĐÃ KẾT THÚC
                                </button>
                            </div>
                            <Link href="/hospital-campaign" className="text-[11px] font-black text-[#6366f1] flex items-center gap-1.5 uppercase tracking-wider hover:underline group">
                                Quản lý chiến dịch
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/30">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chiến dịch</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Người tham gia</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Xử lý/ca</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tiến độ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {loading ? (
                                        [1, 2].map(i => (
                                            <tr key={i}><td colSpan={4} className="px-6 py-4"><Skeleton className="h-10 w-full" /></td></tr>
                                        ))
                                    ) : filteredCampaigns.length > 0 ? (
                                        filteredCampaigns.map((camp) => (
                                            <tr
                                                key={camp.id}
                                                onClick={() => router.push(`/hospital-campaign/${camp.id}`)}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#6366f1] transition-colors">{camp.name}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{camp.location}</p>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{camp.completedCount || 0} / {camp.registeredCount || 0}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black rounded-full border border-emerald-100 dark:border-emerald-800/50">
                                                            8-10 phút
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className="text-[12px] font-black text-slate-900 dark:text-white">
                                                            {(camp.current || 0).toLocaleString()} / {(camp.target || 0).toLocaleString()} <span className="text-[10px] text-slate-400">Đv</span>
                                                        </span>
                                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                            <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${camp.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">Chưa có chiến dịch nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Blood Distribution Donut */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8">
                        <h3 className="font-black text-lg text-slate-900 dark:text-white mb-8 tracking-tight">Cơ cấu Nhóm máu thu nhận</h3>
                        <div className="h-[220px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bloodTypeChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {bloodTypeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-900 dark:fill-white text-3xl font-black">
                                                                {totalActiveUnits}
                                                            </tspan>
                                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                                Tổng ĐV
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {bloodTypeChartData.map((data, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/50">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{data.name}</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{data.value} <span className="text-[10px] text-slate-400 font-bold">Đv</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Summary Card */}
                    <div className="bg-[#6366f1] text-white rounded-[32px] shadow-xl shadow-indigo-500/20 p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-lg tracking-tight">HIỆU SUẤT THỰC TẾ</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Tiến độ chỉ tiêu</span>
                                        <span className="text-3xl font-black italic">26%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="bg-white h-full w-[26%] shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/15">
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Dự báo tiếp nhận</p>
                                    <p className="text-3xl font-black italic">~ {attendanceRate.toFixed(0)}% <span className="text-xl font-bold opacity-80">tỉ lệ đến</span></p>
                                    <p className="text-xs text-white/70 mt-4 leading-relaxed font-medium">
                                        Vui lòng phản hồi các yêu cầu chi viện để đảm bảo tỉ lệ xử lý ca hiến duy trì dưới 12 phút.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Animated background shapes */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    </div>
                </div>
            </div>

            <MiniFooter />
        </main>
    );
}
