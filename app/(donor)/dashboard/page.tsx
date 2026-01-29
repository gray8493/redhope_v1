"use client";

import { useEffect, useState } from "react";
import {
    Droplet,
    Award,
    Users,
    Hospital,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import { useAuth } from "@/context/AuthContext";
import { DashboardCarousel } from "@/components/shared/DashboardCarousel";
import { BloodDropChatbot } from "@/components/shared/BloodDropChatbot";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { campaignService } from "@/services/campaign.service";
import { voucherService } from "@/services/voucher.service";
import { bloodService } from "@/services/blood.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [donorStats, setDonorStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const firstName = user?.user_metadata?.full_name?.split(' ').pop() || user?.email?.split('@')[0] || "người bạn";
    const isVerified = profile?.is_verified || false;
    const currentPoints = profile?.current_points || 0;

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [reqData, vData, sData] = await Promise.all([
                    campaignService.getRequests(),
                    voucherService.getAll(),
                    bloodService.getDonorStats(user.id)
                ]);
                setRequests(reqData.slice(0, 4));
                setVouchers(vData.slice(0, 2));
                setDonorStats(sData);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const livesSaved = donorStats.length * 3;

    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-slate-100">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <TopNav title="Tổng quan" />
                <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col gap-6 text-left">
                        <div className="flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Chào {firstName}!</h1>
                                <p className="text-slate-500 text-sm font-medium">Hôm nay là một ngày tuyệt vời để chia sẻ sự sống.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isVerified ? (
                                    <Link href="/complete-profile">
                                        <Button className="h-auto py-2.5 rounded-xl bg-[#6324eb] hover:bg-[#501ac2] shadow-lg shadow-indigo-500/20 font-bold text-sm gap-2">
                                            <span className="size-2 bg-white rounded-full animate-ping"></span>
                                            Hoàn thành hồ sơ
                                        </Button>
                                    </Link>
                                ) : (
                                    <div
                                        onClick={() => toast.success("Hồ sơ của bạn đã được xác minh thành công!")}
                                        className="flex flex-col items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                    >
                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trạng thái</p>
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 bg-emerald-500 rounded-full"></span>
                                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Hồ sơ đã xác minh</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-6 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Điểm tích lũy</p>
                                    <Award className="text-[#6324eb] w-6 h-6" />
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-slate-900 dark:text-white text-3xl font-black">{currentPoints.toLocaleString()}</p>
                                    <p className="text-emerald-600 text-sm font-bold">PTS</p>
                                </div>
                                <p className="text-slate-400 text-xs mt-2">Dùng để đổi những phần quà hấp dẫn</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-6 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Nhóm máu</p>
                                    <Droplet className="text-red-500 w-6 h-6" />
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-slate-900 dark:text-white text-3xl font-black">{profile?.blood_group || "??"}</p>
                                    <p className="text-slate-500 text-sm font-bold">{profile?.city || "Chưa cập nhật"}</p>
                                </div>
                                <p className="text-slate-400 text-xs mt-2">Thông tin sức khỏe cá nhân</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-6 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Số người đã cứu</p>
                                    <Users className="text-blue-500 w-6 h-6" />
                                </div>
                                <div className="flex items-baseline gap-3">
                                    {loading ? <Skeleton className="h-9 w-12" /> : <p className="text-slate-900 dark:text-white text-3xl font-black">{livesSaved}</p>}
                                    <p className="text-slate-500 text-sm font-bold">Người</p>
                                </div>
                                <p className="text-slate-400 text-xs mt-2">Dựa trên số lần hiến máu thành công</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                        <div className="lg:col-span-2">
                            <DashboardCarousel />
                        </div>
                        <Card className="h-auto lg:h-[300px] flex flex-col bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-5 flex flex-col h-full">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Quà tặng sắp tới</h3>
                                <div className="flex flex-col gap-2 flex-1 overflow-auto">
                                    {loading ? (
                                        [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                                    ) : vouchers.length > 0 ? (
                                        vouchers.map(v => (
                                            <div key={v.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 font-bold uppercase text-xs">
                                                    {v.partner_name?.substring(0, 2) || "V"}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{v.title || `Voucher ${v.partner_name}`}</p>
                                                    <p className="text-xs text-slate-500">{v.partner_name}</p>
                                                </div>
                                                <p className="text-xs font-black text-[#6324eb] uppercase whitespace-nowrap">{v.point_cost} pts</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 text-center py-4">Hiện chưa có voucher mới</p>
                                    )}
                                </div>
                                <Link href="/rewards">
                                    <Button variant="secondary" className="w-full h-8 text-xs font-bold mt-2">
                                        Xem tất cả quà tặng
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4 text-left">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yêu cầu khẩn cấp hiện tại</h3>
                            <Link href="/requests" className="text-[#6324eb] text-sm font-bold hover:underline">Xem thêm</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                            ) : requests.length > 0 ? (
                                requests.map(req => (
                                    <Card key={req.id} className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d] hover:border-[#6324eb]/50 transition-all cursor-pointer group">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-[#6324eb] transition-colors">
                                                        <Hospital className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{req.hospital?.hospital_name || "Bệnh viện"}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{req.hospital?.district}, {req.hospital?.city}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={req.urgency_level === 'Emergency' ? 'destructive' : 'secondary'} className="uppercase text-[10px] px-2 py-0.5">
                                                    {req.urgency_level}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Droplet className="w-3 h-3 text-red-500" />
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Nhóm: {req.required_blood_group}</p>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500">Cần: {req.required_units} đơn vị</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 py-4 col-span-full text-center">Không có yêu cầu khẩn cấp nào lúc này.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <BloodDropChatbot />
        </div>
    );
}
