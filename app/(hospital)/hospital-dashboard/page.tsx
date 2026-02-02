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
import { TrendingUp, Search, UserPlus, Users, Droplet, Zap, Bell, Plus, BarChart } from "lucide-react";
import { RecentNotifications } from "@/components/shared/RecentNotifications";

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

    const COLORS = ["#ef4444", "#6366f1", "#3b82f6", "#f59e0b"];

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-6 md:p-10 text-left medical-gradient">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Hệ thống Điều hành v4.0</span>
                        <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Trực tuyến</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight">Trung tâm Điều phối Máu</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl">Quản lý hiệu suất hiến máu, nhu cầu chi viện và kiểm soát tồn kho trong thời gian thực.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-med-primary transition-colors" />
                        <input
                            className="pl-12 pr-6 py-3.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-med-primary w-[400px] shadow-sm transition-all focus:shadow-xl focus:bg-white outline-none font-medium"
                            placeholder="Mã số chiến dịch, địa điểm hoặc nhân viên..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <StatCard
                    title="Người đăng ký (Hẹn)"
                    value={activeTotalRegistered}
                    subValue="TỔNG CỘNG"
                    icon={UserPlus}
                    loading={loading}
                    color="med-blue"
                />
                <StatCard
                    title="Người đến (Thực tế)"
                    value={activeTotalCompleted}
                    subValue={`${attendanceRate.toFixed(0)}% TỶ LỆ CÓ MẶT`}
                    icon={Users}
                    loading={loading}
                    color="med-primary"
                    badge={`${attendanceRate.toFixed(0)}%`}
                />
                <StatCard
                    title="Máu đã thu (ĐV)"
                    value={totalActiveUnits}
                    subValue="+12% SO VỚI THÁNG TRƯỚC"
                    icon={Droplet}
                    loading={loading}
                    color="rose"
                    isTrend
                />
            </div>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    {/* Campaign Overview Table */}
                    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-[32px] shadow-med border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex gap-10">
                                <button
                                    onClick={() => setActiveTab("active")}
                                    className={`text-xs font-black tracking-[0.15em] uppercase pb-3 px-1 transition-all border-b-2 ${activeTab === "active" ? 'text-med-primary border-med-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    ĐANG TRIỂN KHAI
                                </button>
                                <button
                                    onClick={() => setActiveTab("finished")}
                                    className={`text-xs font-black tracking-[0.15em] uppercase pb-3 px-1 transition-all border-b-2 ${activeTab === "finished" ? 'text-med-primary border-med-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    LỊCH SỬ KẾT THÚC
                                </button>
                            </div>
                            <Link href="/hospital-campaign" className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] font-black text-slate-600 hover:text-med-primary transition-colors flex items-center gap-2 uppercase tracking-wider border border-slate-200/50">
                                <Plus className="size-3.5" /> Quản lý dự án
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30 dark:bg-slate-900/10">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết Chiến dịch</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Người tham gia</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tình trạng</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hiệu suất</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i}><td colSpan={4} className="px-8 py-6"><Skeleton className="h-14 w-full rounded-2xl" /></td></tr>
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
                                                    className="hover:bg-med-primary/[0.02] dark:hover:bg-med-primary/[0.05] transition-colors cursor-pointer group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-med-primary group-hover:text-white transition-all shadow-inner">
                                                                <Zap className="size-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medical-header text-base text-slate-900 dark:text-white leading-tight">{camp.name}</p>
                                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{camp.location_name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="text-base font-black text-slate-800 dark:text-slate-200">{completed}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">của {registered} người</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl border-b-2 ${camp.status === 'active'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200'
                                                            : 'bg-slate-50 dark:bg-slate-900/20 text-slate-500 border-slate-200'
                                                            } uppercase tracking-widest`}>
                                                            {camp.status === 'active' ? '● Đang chạy' : 'Đã dừng'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex flex-col items-end gap-2 text-right">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                                {Math.round(progress)}% <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">đạt mốc</span>
                                                            </span>
                                                            <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                                <div className="h-full bg-med-primary rounded-full shadow-[0_0_12px_rgba(13,148,136,0.5)] transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                                        <Search className="size-8" />
                                                    </div>
                                                    <p className="text-slate-400 italic text-sm font-medium">Hệ thống không tìm thấy chiến dịch nào khả dụng.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-10">
                    {/* Performance Summary Card */}
                    <div className="bg-med-primary text-white rounded-[40px] shadow-2xl shadow-med-primary/30 p-10 relative overflow-hidden group border-b-8 border-teal-900">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-medical-header text-xl">Chỉ số Hiệu năng</h3>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-baseline mb-3">
                                        <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Hiệu suất điều phối</span>
                                        <span className="text-4xl font-medical-header italic leading-none">{Math.round(attendanceRate)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden p-0.5">
                                        <div className="bg-white h-full rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-1000" style={{ width: `${Math.min(attendanceRate, 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Thông tin AI dự báo</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-medical-header italic">~ {attendanceRate.toFixed(0)}%</span>
                                        <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-black uppercase">Chấp nhận được</div>
                                    </div>
                                    <p className="text-xs text-teal-50/80 mt-5 leading-relaxed font-medium">
                                        Chu kỳ phục vụ trung bình đạt <span className="text-white font-bold underline underline-offset-4 decoration-2">12.4 phút/ca</span>. AI khuyến nghị bổ sung 2 điều phối viên vào khung giờ cao điểm 8:00 - 10:00.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Background Aesthetics */}
                        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/[0.03] rounded-full blur-[80px]"></div>
                    </div>

                    {/* Blood Distribution Donut */}
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-[40px] shadow-med border border-slate-100 dark:border-slate-800 p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="font-medical-header text-lg text-slate-900 dark:text-white tracking-tight">Cơ cấu Nhóm máu</h3>
                            <Link href="/hospital-reports" className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-med-primary hover:bg-med-primary/10 transition-colors">
                                <BarChart className="size-4" />
                            </Link>
                        </div>
                        <div className="h-[220px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bloodTypeChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={8}
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
                                                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-900 dark:fill-white text-4xl font-medical-header">
                                                                {totalActiveUnits}
                                                            </tspan>
                                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 28} className="fill-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                                                TỔNG ĐV
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
                                <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl flex items-center justify-between border border-slate-100/50 dark:border-slate-800/50 group hover:border-med-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: COLORS[idx % COLORS.length], backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight group-hover:text-slate-600 transition-colors">{data.name}</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{data.value} <span className="text-[10px] text-slate-400 ml-0.5">Đv</span></p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Notifications for Hospital */}
                    <div className="h-[400px]">
                        <RecentNotifications userId={user?.id || ''} role="hospital" limit={5} />
                    </div>
                </div>
            </div>

            <MiniFooter />
        </main>
    );
}

function StatCard({ title, value, subValue, icon: Icon, loading, color, isTrend, badge }: any) {
    const colorClasses: any = {
        'med-primary': 'text-med-primary bg-med-primary/10',
        'med-blue': 'text-med-blue bg-med-blue/10',
        'rose': 'text-rose-600 bg-rose-50',
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl p-8 rounded-[40px] shadow-med border border-slate-100 dark:border-slate-800 transition-all hover:shadow-med-hover hover:-translate-y-1 relative group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 size-24 bg-slate-50 dark:bg-slate-900/50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</span>
                <div className={`p-2.5 rounded-2xl ${colorClasses[color] || 'bg-slate-50'} shadow-inner`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-baseline gap-3">
                    {loading ? <Skeleton className="h-10 w-24 rounded-lg" /> : <span className="text-5xl font-medical-header text-slate-900 dark:text-white tracking-tighter">{value}</span>}
                    {badge && <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg shadow-emerald-500/20">{badge}</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                    {isTrend && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{subValue}</span>
                </div>
            </div>
        </div>
    );
}
