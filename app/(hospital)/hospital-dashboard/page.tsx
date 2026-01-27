"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutGrid,
    Flag,
    Activity,
    Droplet,
    Users,
    Zap,
    TrendingUp,
    BarChart3,
    Target,
    AlertCircle,
    Lightbulb,
    ChevronRight,
    Timer,
    Clock,
    UserPlus,
    Stethoscope,
    MessageSquareText,
    ArrowRight
} from "lucide-react";
import { HospitalSidebar } from "@/components/shared/HospitalSidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { getCampaigns, subscribeToCampaignUpdates, Campaign } from "@/app/utils/campaignStorage";
import { getSupportRequests, subscribeToSupportUpdates, SupportRequest } from "@/app/utils/supportStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pie, PieChart, Label } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export default function HospitalDashboard() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "finished" | "all">("active");

    useEffect(() => {
        // Tải dữ liệu ban đầu
        setCampaigns(getCampaigns());
        setSupportRequests(getSupportRequests());

        // Đăng ký nhận cập nhật real-time
        const unsubscribeCampaigns = subscribeToCampaignUpdates(() => {
            setCampaigns(getCampaigns());
        });

        const unsubscribeSupport = subscribeToSupportUpdates(() => {
            setSupportRequests(getSupportRequests());
        });

        return () => {
            unsubscribeCampaigns();
            unsubscribeSupport();
        };
    }, []);

    const parseCampaignDate = (dateStr: string) => {
        try {
            if (!dateStr) return { start: 0, end: 0 };
            const parts = dateStr.includes('-') ? dateStr.split('-') : [dateStr, dateStr];
            let endStr = parts[parts.length - 1].trim();

            // Handle DD/MM or DD/MM/YYYY
            const dateParts = endStr.split('/');
            if (dateParts.length < 2) return { start: 0, end: 0 };

            const day = Number(dateParts[0]);
            const month = Number(dateParts[1]);
            const year = dateParts.length === 3 ? Number(dateParts[2]) : new Date().getFullYear();

            const end = new Date(year, month - 1, day).getTime();
            return { start: 0, end }; // Start not strictly needed for expiry
        } catch (e) {
            return { start: 0, end: 0 };
        }
    };

    const isCampaignExpired = (campaign: Campaign) => {
        const { end } = parseCampaignDate(campaign.date || "");
        if (end === 0) return false;
        const now = new Date();
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return end < todayZero;
    };

    // Filter Active Campaigns (Not Ended, Not Expired, Not Draft) for Stats
    const activeListForStats = campaigns.filter(c =>
        c.operationalStatus !== "Đã kết thúc" &&
        c.operationalStatus !== "Bản nháp" &&
        !isCampaignExpired(c)
    );

    // 1. Tính toán số liệu tổng hợp (Chỉ tính những chiến dịch đang hoạt động thực sự)
    const totalBloodCollected = activeListForStats.reduce((sum, c) => sum + (c.current || 0), 0);
    const totalParticipants = activeListForStats.reduce((sum, c) => sum + (c.completedCount || 0), 0);
    const totalRegistered = activeListForStats.reduce((sum, c) => sum + (c.registeredCount || (c.appointments?.length || 0)), 0);
    const totalGoal = activeListForStats.reduce((sum, c) => sum + (c.target || 0), 0);
    const avgAchievement = totalGoal > 0 ? Math.round((totalBloodCollected / totalGoal) * 100) : 0;

    // 2. Lọc danh sách theo Tab - Thống nhất với trang Quản lý Chiến dịch
    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === "active") {
            // Bao gồm Đang hoạt động và Tạm dừng (không phải Bản nháp, Đã kết thúc hay Chiến dịch đã hết hạn)
            return c.operationalStatus !== "Đã kết thúc" &&
                c.operationalStatus !== "Bản nháp" &&
                !isCampaignExpired(c);
        }
        if (activeTab === "finished") {
            // Bao gồm những cái đã kết thúc HOẶC những cái đã hết hạn ngày
            return c.operationalStatus === "Đã kết thúc" || isCampaignExpired(c);
        }
        return true;
    });

    // 3. Giả lập Tỷ lệ xử lý và Gợi ý nhân sự
    const getPerformanceData = (camp: Campaign) => {
        if (camp.operationalStatus !== "Đang hoạt động") return null;
        const seed = Number(camp.id) % 3;
        const perfMap: Record<number, any> = {
            2: { time: "> 25 phút", status: "Quá tải", color: "text-[#6324eb]", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", recommendation: "Cần chi viện bác sĩ", recIcon: <Stethoscope className="w-3 h-3" /> },
            1: { time: "15 - 20 phút", status: "Đông đúc", color: "text-amber-500", bgColor: "bg-amber-50 dark:bg-amber-900/20", recommendation: "Theo dõi nhân sự", recIcon: <Activity className="w-3 h-3" /> },
            0: { time: "8 - 10 phút", status: "Ổn định", color: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", recommendation: "Đội ngũ đủ", recIcon: <Users className="w-3 h-3" /> }
        };
        return perfMap[seed];
    };

    const pendingRequests = supportRequests.filter(r => r.status === "pending");

    const bloodTypeChartData = [
        { type: "op", val: Math.round(totalBloodCollected * 0.45), fill: "var(--color-op)" },
        { type: "ap", val: Math.round(totalBloodCollected * 0.30), fill: "var(--color-ap)" },
        { type: "bp", val: Math.round(totalBloodCollected * 0.15), fill: "var(--color-bp)" },
        { type: "ab", val: Math.round(totalBloodCollected * 0.10), fill: "var(--color-ab)" },
    ];

    const chartConfig = {
        val: { label: "Lượng máu" },
        op: { label: "Nhóm O+", color: "#6324eb" },
        ap: { label: "Nhóm A+", color: "#818cf8" },
        bp: { label: "Nhóm B+", color: "#3b82f6" },
        ab: { label: "Nhóm AB", color: "#f97316" },
    };

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f6f6f8] dark:bg-[#161121] font-display text-[#120e1b] dark:text-white transition-colors duration-200">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />

                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                    <TopNav title="Giám sát & Điều phối Nhân lực" />

                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-[1400px] mx-auto space-y-8">

                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-[#120e1b] dark:text-white text-3xl font-black tracking-tight">Trung tâm Điều hành Bệnh viện</h2>
                                    <p className="text-[#654d99] dark:text-[#a391c8] text-base mt-1">Nắm bắt tình hình lưu lượng và phản hồi yêu cầu chi viện từ các điểm hiến.</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Người Đăng ký (Hẹn)</span>
                                            <UserPlus className="w-5 h-5 text-[#6324eb]" />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-black">{totalRegistered}</p>
                                            <p className="text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight">Tổng cộng</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Người Đến (Thực tế)</span>
                                            <Users className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-black">{totalParticipants}</p>
                                            <p className="text-emerald-500 text-[10px] mb-1 font-black flex items-center gap-0.5">
                                                {totalRegistered > 0 ? Math.round((totalParticipants / totalRegistered) * 100) : 0}% tỉ lệ đến
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Máu đã thu (ml)</span>
                                            <Droplet className="w-5 h-5 text-[#6324eb]" />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-black">{totalBloodCollected.toLocaleString()}</p>
                                            <p className="text-[#078845] text-sm mb-1 font-black flex items-center gap-0.5">+12%</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Yêu cầu Chi viện</span>
                                            <div className="relative">
                                                <MessageSquareText className={`w-5 h-5 text-[#6324eb] ${pendingRequests.length > 0 ? 'animate-bounce' : ''}`} />
                                                {pendingRequests.length > 0 && (
                                                    <span className="absolute -top-1 -right-1 size-2 bg-[#6324eb] rounded-full"></span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-black">{pendingRequests.length}</p>
                                            <Badge variant={pendingRequests.length > 0 ? "destructive" : "secondary"} className="mb-1 text-[10px] uppercase font-bold">
                                                {pendingRequests.length > 0 ? "Cần xử lý gấp" : "Ổn định"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-12 gap-8">
                                {/* Main Table Section (8/12) */}
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    <div className="bg-white dark:bg-[#1c162d] rounded-[32px] border border-[#d7d0e7] dark:border-[#32294e] overflow-hidden shadow-sm">
                                        <div className="px-8 py-6 border-b border-[#d7d0e7] dark:border-[#32294e] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-[#251d3a]/30">
                                            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "active" | "finished" | "all")} className="w-full md:w-auto">
                                                <TabsList className="bg-transparent p-0 h-auto gap-4">
                                                    <TabsTrigger
                                                        value="active"
                                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#6324eb] text-slate-400 font-black uppercase tracking-wider p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-4px] data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-[#6324eb] data-[state=active]:after:rounded-full rounded-none transition-all hover:text-slate-600"
                                                    >
                                                        Đang hoạt động
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="finished"
                                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#6324eb] text-slate-400 font-black uppercase tracking-wider p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-4px] data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-[#6324eb] data-[state=active]:after:rounded-full rounded-none transition-all hover:text-slate-600"
                                                    >
                                                        Đã kết thúc
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                            <Link href="/hospital/campaign" className="text-[10px] text-[#6324eb] font-black uppercase tracking-[0.15em] hover:underline flex items-center gap-1">
                                                Quản lý Chiến dịch <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50/50 dark:bg-[#251d3a] hover:bg-slate-50/50 dark:hover:bg-[#251d3a]">
                                                        <TableHead className="px-8 py-5 text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.15em]">Chiến dịch</TableHead>
                                                        <TableHead className="px-6 py-5 text-center text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.15em]">Yêu cầu Nhóm</TableHead>
                                                        <TableHead className="px-6 py-5 text-center text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.15em]">Người tham gia</TableHead>
                                                        <TableHead className="px-6 py-5 text-center text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.15em]">Hiệu suất trạm</TableHead>
                                                        <TableHead className="px-8 py-5 text-right font-black text-[#654d99] dark:text-[#a391c8] text-[10px] uppercase tracking-[0.15em]">Mục tiêu</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredCampaigns.length > 0 ? filteredCampaigns.map((camp) => {
                                                        const perf = getPerformanceData(camp);
                                                        return (
                                                            <TableRow
                                                                key={camp.id}
                                                                className="hover:bg-gray-50/50 dark:hover:bg-[#251d3a]/50 transition-colors cursor-pointer border-[#d7d0e7] dark:border-[#32294e]"
                                                                onClick={() => router.push(`/hospital/campaign/${camp.id}`)}
                                                            >
                                                                <TableCell className="px-8 py-6">
                                                                    <p className="text-sm font-black text-[#120e1b] dark:text-white leading-tight">{camp.name}</p>
                                                                    <p className="text-[11px] text-[#654d99] dark:text-[#a391c8] mt-1 font-medium italic">{camp.location}</p>
                                                                </TableCell>
                                                                <TableCell className="px-6 py-6 text-center">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="flex -space-x-1">
                                                                            {(camp.bloodTypes || [camp.bloodType]).slice(0, 3).map((t, idx) => (
                                                                                <span key={idx} className={`size-5 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white dark:border-[#1c162d] text-white ${t.includes('O') ? 'bg-indigo-600' : t.includes('A') ? 'bg-indigo-600' : 'bg-blue-500'}`}>
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                            {(camp.bloodTypes?.length || 1) > 3 && (
                                                                                <span className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[7px] font-black text-slate-500 border-2 border-white dark:border-[#1c162d]">+{camp.bloodTypes!.length - 3}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-6 py-6 text-center">
                                                                    <div className="flex flex-col gap-1 items-center w-full">
                                                                        <span className="text-sm font-black text-[#120e1b] dark:text-white">{camp.completedCount || 0} / {camp.registeredCount || 0}</span>
                                                                        <Progress
                                                                            value={camp.registeredCount ? Math.min((camp.completedCount! / camp.registeredCount) * 100, 100) : 0}
                                                                            className="h-1 w-24"
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-6 py-6 text-center">
                                                                    {perf ? (
                                                                        <div className="flex flex-col items-center gap-1.5">
                                                                            <Badge variant="outline" className={`border-0 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${perf.bgColor} ${perf.color}`}>
                                                                                {perf.status === "Quá tải" ? <Zap className="w-3 h-3 animate-pulse" /> : <Timer className="w-3 h-3" />} {perf.time}
                                                                            </Badge>
                                                                            <div className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{perf.recommendation}</div>
                                                                        </div>
                                                                    ) : <span className="text-[10px] text-slate-400 font-bold uppercase italic font-sans">—</span>}
                                                                </TableCell>
                                                                <TableCell className="px-8 py-6 text-right">
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-sm font-black text-[#6324eb]">{camp.progress}%</span>
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{(camp.current || 0).toLocaleString()} / {(camp.target || 0).toLocaleString()} ml</span>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="px-8 py-10 text-center text-slate-400 italic">Không tìm thấy chiến dịch.</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Support Request Notification Area */}
                                    <div className="bg-white dark:bg-[#1c162d] rounded-[32px] border border-[#d7d0e7] dark:border-[#32294e] p-8 shadow-sm space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-[#6324eb] border border-rose-100 dark:border-rose-800">
                                                    <AlertCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Thông báo Cần Hỗ trợ</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Có {pendingRequests.length} yêu cầu mới từ các điểm hiến máu</p>
                                                </div>
                                            </div>
                                            <Link href="/hospital/support" className="px-4 py-2 bg-[#6324eb] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 dark:shadow-none">
                                                Xử lý yêu cầu <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {pendingRequests.length > 0 ? pendingRequests.slice(0, 2).map((req) => (
                                                <div key={req.id} className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase text-[#6324eb] tracking-widest">{req.campaignName}</span>
                                                        <span className="text-[9px] font-bold text-slate-400">{new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed italic">"{req.message}"</p>
                                                    <button onClick={() => router.push('/hospital/support')} className="text-[10px] font-black uppercase text-[#6324eb] hover:underline text-left mt-2">Duyệt chi viện ngay →</button>
                                                </div>
                                            )) : (
                                                <div className="col-span-2 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                                                    <Lightbulb className="w-8 h-8 text-slate-300 mb-2" />
                                                    <p className="text-sm font-medium text-slate-500 italic">Hiện không có yêu cầu hỗ trợ khẩn cấp nào.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Aggregated Analytics Sidebar (4/12) */}
                                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                                    <div className="bg-white dark:bg-[#1c162d] p-8 rounded-[32px] border border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                                        <h3 className="font-black text-xl mb-4 tracking-tight">Cơ cấu Nhóm máu thu nhận</h3>
                                        <div className="h-[250px] w-full">
                                            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                                                <PieChart>
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <Pie
                                                        data={bloodTypeChartData}
                                                        dataKey="val"
                                                        nameKey="type"
                                                        innerRadius={60}
                                                        outerRadius={85}
                                                        strokeWidth={5}
                                                    >
                                                        <Label
                                                            content={({ viewBox }) => {
                                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                                    return (
                                                                        <text
                                                                            x={viewBox.cx}
                                                                            y={viewBox.cy}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                        >
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={viewBox.cy}
                                                                                className="fill-foreground text-3xl font-bold"
                                                                            >
                                                                                {(totalBloodCollected / 1000).toFixed(1)}
                                                                            </tspan>
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={(viewBox.cy || 0) + 24}
                                                                                className="fill-muted-foreground text-[10px] font-black uppercase tracking-widest"
                                                                            >
                                                                                Tổng Lít
                                                                            </tspan>
                                                                        </text>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {Object.entries(chartConfig).filter(([key]) => key !== 'val').map(([key, config]: [string, any]) => (
                                                <div key={key} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }}></div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#654d99] dark:text-[#a391c8]">{config.label}</span>
                                                    </div>
                                                    <p className="text-sm font-black">
                                                        {bloodTypeChartData.find(d => d.type === key)?.val.toLocaleString()} ml
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-[#6324eb] p-8 rounded-[32px] text-white space-y-6 shadow-xl shadow-indigo-500/20 dark:shadow-none">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-xl">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-black tracking-tight uppercase tracking-widest">Hiệu suất Thực tế</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-70">Tiến độ Chỉ tiêu</span>
                                                    <span className="text-lg font-black">{avgAchievement}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${avgAchievement}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/10">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Dự báo Tiếp nhận</p>
                                                <h4 className="text-2xl font-black italic">~ {totalRegistered > 0 ? Math.round((totalParticipants / totalRegistered) * 100) : 0}% tỉ lệ đến</h4>
                                                <p className="text-[10px] font-medium mt-2 leading-relaxed text-blue-100 italic">
                                                    Vui lòng phản hồi các yêu cầu chi viện để đảm bảo tỉ lệ xử lý ca hiến duy trì dưới 12 phút.
                                                </p>
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

            <style jsx>{`
                @keyframes shimmer {
                    from { background-position: 0 0; }
                    to { background-position: 40px 0; }
                }
            `}</style>
        </div >
    );
}
