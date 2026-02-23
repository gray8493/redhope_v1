"use client";

import { useEffect, useState } from "react";
import {
    Droplet,
    Award,
    Clock,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import { useAuth } from "@/context/AuthContext";
import { DashboardCarousel } from "@/components/shared/DashboardCarousel";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { campaignService } from "@/services/campaign.service";
import { voucherService } from "@/services/voucher.service";
import { bloodService } from "@/services/blood.service";
import { settingService } from "@/services/setting.service";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addMonths, isAfter } from "date-fns";
import { vi } from "date-fns/locale";

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [donorStats, setDonorStats] = useState<any[]>([]);
    const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    const firstName = user?.user_metadata?.full_name?.split(' ').pop() || user?.email?.split('@')[0] || "người bạn";
    const isVerified = profile?.is_verified || false;
    const currentPoints = profile?.current_points || 0;

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [campData, vData, sData, settings] = await Promise.all([
                    campaignService.getActive(),
                    voucherService.getAll(),
                    bloodService.getDonorStats(user.id),
                    settingService.getSettings()
                ]);
                setCampaigns(campData.slice(0, 8));
                setVouchers(vData.slice(0, 4));
                setDonorStats(sData);

                // Calculate next donation date
                if (sData && sData.length > 0) {
                    const latestDonation = sData.reduce((prev: any, current: any) =>
                        (new Date(current.verified_at) > new Date(prev.verified_at)) ? current : prev
                    );
                    const lastDate = new Date(latestDonation.verified_at);
                    const nextDate = addMonths(lastDate, settings.donation_interval_months || 3);
                    setNextDonationDate(nextDate);
                }
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
        <div className="flex h-full w-full flex-row overflow-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
                <TopNav title="Tổng quan" />
                <div className="p-4 sm:p-5 md:p-8 flex flex-col gap-4 md:gap-8 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col gap-3 md:gap-6 text-left">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-3 md:gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-slate-900 dark:text-white text-xl sm:text-3xl md:text-4xl font-black tracking-tight">Chào {firstName}!</h1>
                                <p className="text-slate-500 text-xs sm:text-sm font-medium">Hôm nay là một ngày tuyệt vời để chia sẻ sự sống.</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                {!isVerified ? (
                                    <Link href="/complete-profile">
                                        <Button className="h-auto py-2 sm:py-2.5 rounded-xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/20 font-bold text-xs sm:text-sm gap-2">
                                            <span className="size-2 bg-white rounded-full animate-ping"></span>
                                            Hoàn thành hồ sơ
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                                        <div
                                            onClick={() => toast.success("Hồ sơ của bạn đã được xác minh thành công!")}
                                            className="flex items-center sm:flex-col sm:items-end gap-1.5 sm:gap-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg sm:rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                        >
                                            <span className="size-2 bg-emerald-500 rounded-full sm:hidden"></span>
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase hidden sm:block">Trạng thái</p>
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <span className="size-2 bg-emerald-500 rounded-full hidden sm:block"></span>
                                                <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">Đã xác minh</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 text-left">
                        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-4 md:p-6 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-[10px] md:text-sm font-semibold uppercase tracking-wider">Điểm tích lũy</p>
                                    <Award className="text-[#0065FF] w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex items-baseline gap-2 md:gap-3">
                                    <p className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black">{currentPoints.toLocaleString()}</p>
                                    <p className="text-emerald-600 text-xs md:text-sm font-bold">PTS</p>
                                </div>
                                <p className="text-slate-400 text-xs mt-2">Dùng để đổi những phần quà hấp dẫn</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-4 md:p-6 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-[10px] md:text-sm font-semibold uppercase tracking-wider">Nhóm máu</p>
                                    <Droplet className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex items-baseline gap-2 md:gap-3">
                                    <p className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black">{profile?.blood_group || "??"}</p>
                                    <p className="text-slate-500 text-xs md:text-sm font-bold truncate">{profile?.city || "Chưa cập nhật"}</p>
                                </div>
                                <p className="text-slate-400 text-[10px] md:text-xs mt-1 md:mt-2 hidden sm:block">Thông tin sức khỏe cá nhân</p>
                            </CardContent>
                        </Card>
                        <Card className="col-span-2 md:col-span-1 bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <CardContent className="p-4 md:p-6 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-[10px] md:text-sm font-semibold uppercase tracking-wider">Ngày hiến tiếp theo</p>
                                    <Clock className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex items-baseline gap-3">
                                    {loading ? (
                                        <Skeleton className="h-9 w-32" />
                                    ) : nextDonationDate ? (
                                        isAfter(new Date(), nextDonationDate) ? (
                                            <p className="text-emerald-600 dark:text-emerald-400 text-xl font-black">Có thể hiến ngay</p>
                                        ) : (
                                            <p className="text-slate-900 dark:text-white text-2xl font-black">
                                                {format(nextDonationDate, 'dd/MM/yyyy', { locale: vi })}
                                            </p>
                                        )
                                    ) : (
                                        <p className="text-emerald-600 dark:text-emerald-400 text-xl font-black">Sẵn sàng hiến</p>
                                    )}
                                </div>
                                <p className="text-slate-400 text-xs mt-2">Dựa trên khoảng cách 3 tháng an toàn</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 text-left">
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
                                                <p className="text-xs font-black text-[#0065FF] uppercase whitespace-nowrap">{v.point_cost} pts</p>
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
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Chiến dịch đang diễn ra</h3>
                            <Link href="/requests?filter=campaign" className="text-[#0065FF] text-xs md:text-sm font-bold hover:underline whitespace-nowrap">Xem tất cả</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {loading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl" />)
                            ) : campaigns.length > 0 ? (
                                campaigns.map(camp => (
                                    <Link href={`/requests?id=${camp.id}`} key={camp.id}>
                                        <Card className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d] hover:border-[#0065FF]/50 transition-all cursor-pointer group h-full">
                                            <CardContent className="p-3 sm:p-4 flex flex-col h-full gap-2 sm:gap-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                        <div className="size-8 sm:size-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-[#0065FF] group-hover:bg-[#0065FF] group-hover:text-white transition-all flex-shrink-0">
                                                            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0065FF] transition-colors">{camp.name}</p>
                                                            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">{camp.hospital?.hospital_name || "Bệnh viện tổ chức"}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="border-blue-100 text-blue-600 dark:border-blue-900 dark:text-blue-400 text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 flex-shrink-0 whitespace-nowrap">
                                                        Đang mở
                                                    </Badge>
                                                </div>

                                                <div className="mt-auto space-y-1.5 sm:space-y-2">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                                                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                                                        <span className="line-clamp-1">{camp.location_name || camp.hospital?.hospital_address}{camp.hospital?.city ? ` (${camp.hospital.city})` : ''}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-1.5 sm:p-2 rounded-lg">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                            <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                {new Date(camp.start_time).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                        <p className="text-[11px] sm:text-xs font-medium text-slate-500">Mục tiêu: {camp.target_units} đv</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 py-4 col-span-full text-center">Không có chiến dịch nào đang diễn ra.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}