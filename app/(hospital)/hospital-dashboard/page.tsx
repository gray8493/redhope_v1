"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Activity,
    Droplet,
    Zap,
    Target,
    AlertCircle,
    UserPlus,
    ArrowRight
} from "lucide-react";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
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
import { campaignService } from "@/services/campaign.service";
import { bloodService } from "@/services/blood.service";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function HospitalDashboard() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [bloodRequests, setBloodRequests] = useState<any[]>([]);
    const [donationStats, setDonationStats] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "finished" | "all">("active");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const [cData, rData, sData] = await Promise.all([
                    campaignService.getAll(user.id),
                    campaignService.getRequests(user.id),
                    bloodService.getHospitalStats(user.id)
                ]);
                setCampaigns(cData);
                setBloodRequests(rData);
                setDonationStats(sData);
            } catch (error) {
                console.error("Hospital dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === "active") return c.status === "active";
        if (activeTab === "finished") return c.status === "ended";
        return true;
    });

    // Calculate stats
    const totalBloodCollected = donationStats.reduce((sum, d) => sum + (d.volume_ml || 0), 0);
    const totalTargetUnits = campaigns.reduce((sum, c) => sum + (c.target_units || 0), 0);
    const achievementRatio = totalTargetUnits > 0 ? (totalBloodCollected / totalTargetUnits) * 100 : 0;

    // Blood distribution data for chart
    const distribution = donationStats.reduce((acc: any, curr) => {
        const type = curr.blood_group_confirmed || "Khác";
        acc[type] = (acc[type] || 0) + curr.volume_ml;
        return acc;
    }, {});

    const colors = ["#6324eb", "#818cf8", "#3b82f6", "#f97316", "#ef4444", "#10b981", "#f59e0b", "#6366f1"];
    const bloodTypeChartData = Object.keys(distribution).map((type, index) => ({
        type,
        val: distribution[type],
        fill: colors[index % colors.length]
    }));

    const chartConfig = Object.keys(distribution).reduce((acc: any, type, index) => {
        acc[type] = { label: `Nhóm ${type}`, color: colors[index % colors.length] };
        return acc;
    }, { val: { label: "Lượng máu" } });

    return (
        <main className="p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4 text-left">
                    <div>
                        <h2 className="text-[#120e1b] dark:text-white text-3xl font-black tracking-tight">Trung tâm Điều hành</h2>
                        <p className="text-[#654d99] dark:text-[#a391c8] text-base mt-1">Chào mừng quay trở lại, {user?.user_metadata?.hospital_name || "Bệnh viện"}.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Tổng mục tiêu (ml)</span>
                                <UserPlus className="w-5 h-5 text-[#6324eb]" />
                            </div>
                            <div className="flex items-end gap-2">
                                {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-black">{totalTargetUnits.toLocaleString()}</p>}
                                <p className="text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight">ml</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Chiến dịch chủ trì</span>
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex items-end gap-2">
                                {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-black">{campaigns.length}</p>}
                                <p className="text-emerald-500 text-[10px] mb-1 font-black flex items-center gap-0.5">
                                    {campaigns.filter(c => c.status === 'active').length} đang chạy
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Máu đã thu (ml)</span>
                                <Droplet className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex items-end gap-2">
                                {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-black">{totalBloodCollected.toLocaleString()}</p>}
                                <p className="text-slate-400 text-[10px] mb-1 font-bold">ML</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-[#1c162d] border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#654d99] dark:text-[#a391c8] text-[10px] font-black uppercase tracking-[0.1em]">Yêu cầu Khẩn cấp</span>
                                <Zap className={`w-5 h-5 text-red-500 ${bloodRequests.length > 0 ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="flex items-end gap-2">
                                {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-black">{bloodRequests.length}</p>}
                                <Badge variant={bloodRequests.length > 0 ? "destructive" : "secondary"} className="mb-1 text-[10px] uppercase font-bold">
                                    {bloodRequests.length > 0 ? "Đang mở" : "Ổn định"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-12 gap-8 text-left">
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-[#1c162d] rounded-[32px] border border-[#d7d0e7] dark:border-[#32294e] overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-[#d7d0e7] dark:border-[#32294e] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-[#251d3a]/30">
                                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full md:w-auto">
                                    <TabsList className="bg-transparent p-0 h-auto gap-4">
                                        <TabsTrigger value="active" className="data-[state=active]:text-[#6324eb] text-slate-400 font-extrabold uppercase p-0 relative transition-all rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none">Đang hoạt động</TabsTrigger>
                                        <TabsTrigger value="finished" className="data-[state=active]:text-[#6324eb] text-slate-400 font-extrabold uppercase p-0 relative transition-all rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none">Lịch sử</TabsTrigger>
                                        <TabsTrigger value="all" className="data-[state=active]:text-[#6324eb] text-slate-400 font-extrabold uppercase p-0 relative transition-all rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none">Tất cả</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <Link href="/hospital/hospital-campaign" className="text-[11px] text-[#6324eb] font-black uppercase tracking-wider flex items-center gap-1 hover:underline">
                                    Quản lý chiến dịch <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-[#251d3a]">
                                            <TableHead className="px-8 py-5 text-[#654d99] text-[10px] font-black uppercase">Tên Chiến dịch</TableHead>
                                            <TableHead className="px-6 py-5 text-center text-[#654d99] text-[10px] font-black uppercase">Trạng thái</TableHead>
                                            <TableHead className="px-6 py-5 text-center text-[#654d99] text-[10px] font-black uppercase">Mục tiêu</TableHead>
                                            <TableHead className="px-8 py-5 text-right text-[#654d99] text-[10px] font-black uppercase">Thời gian</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : filteredCampaigns.length > 0 ? filteredCampaigns.map((camp) => (
                                            <TableRow key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer">
                                                <TableCell className="px-8 py-6 font-bold">{camp.name}</TableCell>
                                                <TableCell className="px-6 py-6 text-center">
                                                    <Badge className={camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                                        {camp.status === 'active' ? 'Đang chạy' : 'Kết thúc'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-6 text-center font-black">{camp.target_units.toLocaleString()} ml</TableCell>
                                                <TableCell className="px-8 py-6 text-right text-sm text-slate-500">
                                                    {new Date(camp.start_time).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">Chưa có chiến dịch nào.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1c162d] rounded-[32px] border border-[#d7d0e7] dark:border-[#32294e] p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-600">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Yêu cầu Máu Khẩn cấp</h3>
                                        <p className="text-xs text-slate-500 font-medium">Đang có {bloodRequests.length} yêu cầu cần được xử lý</p>
                                    </div>
                                </div>
                                <Link href="/hospital/hospital-requests">
                                    <Button className="rounded-xl bg-red-600 hover:bg-red-700 font-bold uppercase text-[10px]">Xử lý ngay</Button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                {bloodRequests.slice(0, 2).map(req => (
                                    <div key={req.id} className="p-5 bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="destructive" className="text-[9px]">{req.urgency_level}</Badge>
                                            <span className="text-[10px] text-slate-500">{new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Cần {req.required_units} đơn vị nhóm {req.required_blood_group}</p>
                                        <p className="text-xs text-slate-500 italic line-clamp-1">"{req.description}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                        <div className="bg-white dark:bg-[#1c162d] p-8 rounded-[32px] border border-[#d7d0e7] dark:border-[#32294e] shadow-sm">
                            <h3 className="font-black text-xl mb-4 tracking-tight text-slate-900 dark:text-white">Phân bổ Nhóm máu</h3>
                            <div className="h-[250px] w-full">
                                {bloodTypeChartData.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                                        <PieChart>
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={bloodTypeChartData} dataKey="val" nameKey="type" innerRadius={60} outerRadius={85} strokeWidth={5}>
                                                <Label content={({ viewBox }) => (
                                                    viewBox && "cx" in viewBox && "cy" in viewBox ? (
                                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{(totalBloodCollected / 1000).toFixed(1)}</tspan>
                                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-[10px] font-black uppercase tracking-widest">Tổng Lít</tspan>
                                                        </text>
                                                    ) : null
                                                )} />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 italic">Chưa có dữ liệu</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#6324eb] p-8 rounded-[32px] text-white space-y-6 shadow-xl shadow-indigo-500/20">
                            <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-white" />
                                <h3 className="text-lg font-black tracking-tight uppercase">Hiệu suất Thực tế</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[11px] font-black uppercase tracking-widest opacity-70">Tỉ lệ đạt mục tiêu</span>
                                        <span className="text-lg font-black">{Math.min(100, Math.round(achievementRatio))}%</span>
                                    </div>
                                    <Progress value={achievementRatio} className="h-3 bg-white/20 shadow-none border-0" />
                                </div>
                                <div className="pt-4 border-t border-white/10 text-[10px] font-medium leading-relaxed italic opacity-80">
                                    Dữ liệu được cập nhật thời gian thực dựa trên các chiến dịch hiến máu đang hoạt động.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <MiniFooter />
            </div>
        </main>
    );
}
