"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { campaignService } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import MiniFooter from "@/components/shared/MiniFooter";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { toast } from "sonner";
import { TrendingUp, Search, UserPlus, Users, Droplet, Zap, MonitorPlay } from "lucide-react";


export default function HospitalDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "finished">("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch campaigns của hospital này
                const data = await campaignService.getAll(user.id);
                setCampaigns(data || []);
            } catch (error: any) {
                console.error('Error fetching campaigns:', error);
                toast.error('Không thể tải dữ liệu chiến dịch');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    // Filter active campaigns
    const activeCampaignsList = campaigns.filter(c => c.status === 'active');

    // Calculate metrics from appointments
    const activeTotalRegistered = activeCampaignsList.reduce((sum, c) => {
        // Count appointments for this campaign
        return sum + (c.appointments?.length || 0);
    }, 0);

    const activeTotalCompleted = activeCampaignsList.reduce((sum, c) => {
        // Count completed appointments
        const completed = c.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
        return sum + completed;
    }, 0);

    const attendanceRate = activeTotalRegistered > 0 ? (activeTotalCompleted / activeTotalRegistered) * 100 : 0;

    // Filter campaigns based on tab and search
    const filteredCampaigns = campaigns.filter(c => {
        const matchesTab = activeTab === "active"
            ? c.status === 'active'
            : c.status === 'completed' || c.status === 'ended' || c.status === 'cancelled';

        const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.location_name?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    // Blood distribution (mock data for now - can be enhanced later)
    const totalActiveUnits = activeTotalCompleted;
    const bloodTypeChartData = totalActiveUnits > 0 ? [
        { name: "Nhóm O+", value: Math.round(totalActiveUnits * 0.45) },
        { name: "Nhóm A+", value: Math.round(totalActiveUnits * 0.3) },
        { name: "Nhóm B+", value: Math.round(totalActiveUnits * 0.15) },
        { name: "Nhóm AB", value: Math.round(totalActiveUnits * 0.1) },
    ] : [
        { name: "Nhóm O+", value: 0 },
        { name: "Nhóm A+", value: 0 },
        { name: "Nhóm B+", value: 0 },
        { name: "Nhóm AB", value: 0 },
    ];

    const COLORS = ["#ef4444", "#0065FF", "#3b82f6", "#f59e0b"];

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
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0065FF] w-[400px] shadow-sm transition-all focus:shadow-md outline-none"
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
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm border border-slate-300 dark:border-slate-700 transition-all hover:shadow-md group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Người đăng ký (Hẹn)</span>
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[#0065FF]">
                            <UserPlus className="w-5 h-5 opacity-60" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {loading ? <Skeleton className="h-9 w-16" /> : <span className="text-4xl font-black text-slate-900 dark:text-white">{activeTotalRegistered}</span>}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TỔNG CỘNG</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm border border-slate-300 dark:border-slate-700 transition-all hover:shadow-md group">
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

                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm border border-slate-300 dark:border-slate-700 transition-all hover:shadow-md group">
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
                    <div className="bg-white dark:bg-slate-800/50 rounded-[24px] shadow-sm border border-slate-300 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex gap-8">
                                <button
                                    onClick={() => setActiveTab("active")}
                                    className={`text-xs font-black tracking-widest uppercase pb-2 px-1 transition-all border-b-2 ${activeTab === "active" ? 'text-[#0065FF] border-[#0065FF]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    ĐANG HOẠT ĐỘNG
                                </button>
                                <button
                                    onClick={() => setActiveTab("finished")}
                                    className={`text-xs font-black tracking-widest uppercase pb-2 px-1 transition-all border-b-2 ${activeTab === "finished" ? 'text-[#0065FF] border-[#0065FF]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    ĐÃ KẾT THÚC
                                </button>
                            </div>
                            <Link href="/hospital-campaign" className="text-[11px] font-black text-[#0065FF] flex items-center gap-1.5 uppercase tracking-wider hover:underline group">
                                Quản lý chiến dịch
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/30">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Chiến dịch</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Người tham gia</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Trạng thái</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Tiến độ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {loading ? (
                                        [1, 2].map(i => (
                                            <tr key={i}><td colSpan={4} className="px-4 py-4"><Skeleton className="h-10 w-full" /></td></tr>
                                        ))
                                    ) : filteredCampaigns.length > 0 ? (
                                        filteredCampaigns.map((camp) => {
                                            const registered = camp.appointments?.length || 0;
                                            const completed = camp.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
                                            const progress = camp.target_units > 0 ? (completed / camp.target_units) * 100 : 0;

                                            return (
                                                <tr
                                                    key={camp.id}
                                                    onClick={() => router.push(`/hospital-campaign/${camp.id}`)}
                                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors cursor-pointer group"
                                                >
                                                    <td className="px-4 py-4 min-w-[200px]">
                                                        <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0065FF] transition-colors line-clamp-2">{camp.name}</p>
                                                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">{camp.location_name}</p>
                                                    </td>
                                                    <td className="px-4 py-4 text-center whitespace-nowrap">
                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{completed} / {registered}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${camp.status === 'active'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                                                            : 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/50'
                                                            }`}>
                                                            {camp.status === 'active' ? 'ĐANG HOẠT ĐỘNG' : (camp.status === 'completed' || camp.status === 'ended') ? 'ĐÃ KẾT THÚC' : 'ĐÃ HỦY'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <span className="text-[12px] font-black text-slate-900 dark:text-white">
                                                                {completed} / {camp.target_units} <span className="text-[10px] text-slate-400">Đv</span>
                                                            </span>
                                                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                                <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
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
                    <div className="bg-white dark:bg-slate-800/50 rounded-[32px] shadow-sm border border-slate-300 dark:border-slate-700 p-8">
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
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-700/50">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{data.name}</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{data.value} <span className="text-[10px] text-slate-400 font-bold">Đv</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>




                </div>
            </div>

            <MiniFooter />
        </main>
    );
}
