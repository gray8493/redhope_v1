"use client";

import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { hospitalService } from '@/services/hospital.service';
import { voucherService } from '@/services/voucher.service';
import { supabase } from '@/lib/supabase';
import {
    Loader2,
    Users,
    Hospital,
    Ticket,
    CheckCircle,
    XCircle,
    Heart,
    TrendingUp,
    Calendar,
    User,
    Activity,
    Database,
    BarChart3,
    ArrowUpRight,
    ShieldCheck,
    Building2,
    Clock,
    Star
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FinancialDonation {
    id: string;
    donor_id: string | null;
    donor_name: string;
    amount: number;
    payment_method: string | null;
    status: string;
    transaction_code: string | null;
    is_anonymous: boolean;
    message: string | null;
    created_at: string;
}

export default function GlobalAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const [stats, setStats] = useState({
        totalDonors: 0,
        donorsByBloodGroup: {} as Record<string, number>,
        totalHospitals: 0,
        verifiedHospitals: 0,
        pendingHospitals: 0,
        totalVouchers: 0,
        activeVouchers: 0,
        totalPointsUsed: 0,
    });

    const [donationStats, setDonationStats] = useState({
        totalAmount: 0,
        completedCount: 0,
        pendingCount: 0,
        recentDonations: [] as FinancialDonation[],
        topDonors: [] as { name: string; total: number }[],
    });

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [users, hospitals, vouchers] = await Promise.all([
                    userService.getAll(),
                    hospitalService.getAll(),
                    voucherService.getAll(),
                ]);

                if (!isMounted) return;

                const bloodGroups: Record<string, number> = {};
                users.forEach(u => {
                    if (u.blood_group) {
                        bloodGroups[u.blood_group] = (bloodGroups[u.blood_group] || 0) + 1;
                    }
                });

                const verified = hospitals.filter(h => h.is_verified).length;
                const points = vouchers.reduce((sum, v) => sum + (v.point_cost || 0), 0);
                const active = vouchers.filter(v => v.status === 'Active').length;

                setStats({
                    totalDonors: users.length,
                    donorsByBloodGroup: bloodGroups,
                    totalHospitals: hospitals.length,
                    verifiedHospitals: verified,
                    pendingHospitals: hospitals.length - verified,
                    totalVouchers: vouchers.length,
                    activeVouchers: active,
                    totalPointsUsed: points,
                });

                const { data: donations, error: donationsError } = await supabase
                    .from('financial_donations')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (donationsError) throw donationsError;

                if (donations && isMounted) {
                    const completed = donations.filter(d => d.status === 'completed');
                    const pending = donations.filter(d => d.status === 'pending');
                    const totalAmount = completed.reduce((sum, d) => sum + (d.amount || 0), 0);

                    const donorTotals: Record<string, number> = {};
                    completed.forEach(d => {
                        const name = d.is_anonymous ? 'Ẩn danh' : d.donor_name;
                        donorTotals[name] = (donorTotals[name] || 0) + d.amount;
                    });
                    const topDonors = Object.entries(donorTotals)
                        .map(([name, total]) => ({ name, total }))
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 5);

                    setDonationStats({
                        totalAmount,
                        completedCount: completed.length,
                        pendingCount: pending.length,
                        recentDonations: donations.slice(0, 10),
                        topDonors,
                    });
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to fetch analytics data:", error);
                    setError((error as Error)?.message ?? 'Failed to load analytics');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, []);

    const bloodGroupColors: Record<string, string> = {
        'O+': 'bg-blue-500',
        'O-': 'bg-blue-400',
        'A+': 'bg-emerald-500',
        'A-': 'bg-emerald-400',
        'B+': 'bg-sky-500',
        'B-': 'bg-sky-400',
        'AB+': 'bg-slate-500',
        'AB-': 'bg-slate-400',
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin size-10 text-blue-500" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang khởi tạo dữ liệu phân tích...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
                <div className="size-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                    <XCircle className="size-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Đã xảy ra lỗi</h3>
                <p className="text-slate-500 text-sm max-w-xs">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                >
                    Thử lại ngay
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="size-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600/70">System Analytics Engine</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Phân tích Hệ thống</h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Giám sát hiệu suất và dữ liệu thực tế từ REDHOPE.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 py-1.5 px-4 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-emerald-50">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Dữ liệu thời gian thực
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/50 mb-6">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-all">
                        <BarChart3 className="size-4 mr-2" />
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="donations" className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-md rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-all">
                        <Heart className="size-4 mr-2" />
                        Quyên góp
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab Content */}
                <TabsContent value="overview" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: "Người hiến máu", value: stats.totalDonors, icon: Users, color: "blue", sub: "Tài khoản thực", desc: "Người dùng đã xác thực" },
                            { label: "Cơ sở đối tác", value: stats.totalHospitals, icon: Building2, color: "emerald", sub: `${stats.verifiedHospitals} Đã xác minh`, desc: `${stats.pendingHospitals} Chờ xét duyệt` },
                            { label: "Điểm thưởng hệ thống", value: stats.totalPointsUsed.toLocaleString(), icon: Ticket, color: "sky", sub: `${stats.activeVouchers} Voucher khả dụng`, desc: "Tương đương giá trị ưu đãi" }
                        ].map((card, i) => (
                            <Card key={i} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                <CardContent className="p-6 relative">
                                    <div className={`absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700`}>
                                        {React.createElement(card.icon, { className: "size-32" })}
                                    </div>
                                    <div className="flex flex-col gap-4 relative z-10">
                                        <div className={`size-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center text-${card.color}-600 ring-1 ring-${card.color}-100 shadow-sm`}>
                                            {React.createElement(card.icon, { className: "size-6" })}
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                                                <ArrowUpRight className="size-4 text-emerald-500 mb-1" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                <div className={`size-1.5 rounded-full bg-${card.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                                                <span>{card.sub}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium ml-3">{card.desc}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Blood Group Distribution */}
                        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
                            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-100">
                                        <Activity className="size-4 text-white" />
                                    </div>
                                    <CardTitle className="text-lg font-black text-slate-900">Phân bố Nhóm máu</CardTitle>
                                </div>
                                <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-bold text-[9px] uppercase">Cập nhật mỗi giờ</Badge>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                    {Object.entries(stats.donorsByBloodGroup).map(([group, count]) => {
                                        const total = stats.totalDonors > 0 ? stats.totalDonors : 1;
                                        const percent = stats.totalDonors > 0 ? Math.round(count / total * 100) : 0;
                                        return (
                                            <div key={group} className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-3 rounded-full ${bloodGroupColors[group] || 'bg-slate-300'}`}></div>
                                                        <span className="font-black text-slate-900 text-sm tracking-tight">{group}</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-400">{count} hồ sơ ({percent}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${bloodGroupColors[group] || 'bg-slate-300'}`}
                                                        style={{ width: `${(count / total) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Object.keys(stats.donorsByBloodGroup).length === 0 && (
                                        <div className="col-span-2 py-20 text-center flex flex-col items-center justify-center gap-3 opacity-30">
                                            <Database className="size-10 text-slate-300" />
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Không tìm thấy dữ liệu nhóm máu</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Summary */}
                        <Card className="border-slate-200/60 shadow-sm bg-slate-50/30">
                            <CardHeader className="py-5 px-6">
                                <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Thông số Hệ thống</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 space-y-4">
                                {[
                                    { title: "Tăng trưởng Người dùng", icon: Users, color: "blue", text: `Hệ thống ghi nhận ${stats.totalDonors} người hiến máu.` },
                                    { title: "Mạng lưới Bệnh viện", icon: ShieldCheck, color: "emerald", text: `${stats.totalHospitals} cơ sở y tế đã kết nối.` },
                                    { title: "Ưu đãi & Voucher", icon: Stars, color: "sky", text: `${stats.activeVouchers} voucher đang khả dụng.` }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 size-7 rounded-lg bg-${item.color}-50 flex items-center justify-center text-${item.color}-500`}>
                                                {React.createElement(item.icon, { className: "size-4" })}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-tight">{item.title}</h4>
                                                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">{item.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Donations Tab Content */}
                <TabsContent value="donations" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Heart className="size-32 fill-white" />
                            </div>
                            <CardContent className="p-6 flex flex-col gap-8 relative z-10">
                                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
                                    <Heart className="size-5 fill-current" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Tổng quỹ quyên góp</p>
                                    <h3 className="text-2xl font-black tracking-tight">{formatCurrency(donationStats.totalAmount)}</h3>
                                </div>
                            </CardContent>
                        </Card>

                        {[
                            { label: "Giao dịch thành công", value: donationStats.completedCount, icon: CheckCircle, color: "emerald", desc: "Đã hoàn thành" },
                            { label: "Giao dịch đang chờ", value: donationStats.pendingCount, icon: Clock, color: "amber", desc: "Đang xử lý" },
                            { label: "Giá trị trung bình", value: donationStats.completedCount > 0 ? (donationStats.totalAmount / donationStats.completedCount).toLocaleString() : 0, icon: TrendingUp, color: "blue", desc: "Mỗi giao dịch" }
                        ].map((stat, i) => (
                            <Card key={i} className="border-slate-200/60 shadow-sm">
                                <CardContent className="p-6 flex flex-col gap-6">
                                    <div className={`size-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-500 ring-1 ring-${stat.color}-100`}>
                                        {React.createElement(stat.icon, { className: "size-5" })}
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{stat.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Donations List */}
                        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-100">
                                        <Heart className="size-4 text-white fill-white" />
                                    </div>
                                    <CardTitle className="text-lg font-black text-slate-900">Quyên góp gần đây</CardTitle>
                                </div>
                                <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] uppercase px-3">Live Feed</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {donationStats.recentDonations.length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 opacity-30">
                                            <Heart className="size-12 text-slate-300" />
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chưa có giao dịch quyên góp nào</p>
                                        </div>
                                    ) : (
                                        donationStats.recentDonations.map((donation) => (
                                            <div key={donation.id} className="flex items-center gap-4 py-5 px-6 hover:bg-slate-50 transition-all duration-200 group">
                                                <div className={`size-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase ring-2 ring-white shadow-sm transition-transform group-hover:scale-105 ${donation.is_anonymous ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {donation.is_anonymous ? '?' : donation.donor_name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                                            {donation.is_anonymous ? 'Nhà hảo tâm ẩn danh' : donation.donor_name}
                                                        </h4>
                                                        <Badge className={`text-[9px] font-black h-4 px-1.5 uppercase tracking-tighter ${donation.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                                            }`}>
                                                            {donation.status === 'completed' ? 'Thành công' : 'Đang chờ'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                                                            <Calendar className="size-3" />
                                                            {formatDate(donation.created_at)}
                                                        </p>
                                                        {donation.message && <p className="text-[11px] text-slate-400 italic truncate max-w-[200px]">"{donation.message}"</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900">{formatCurrency(donation.amount)}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{donation.payment_method || 'Momo/VNPay'}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Donors Ranking */}
                        <Card className="border-slate-200/60 shadow-sm h-fit">
                            <CardHeader className="py-5 px-6 border-b border-slate-100">
                                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    🏆 Vinh danh
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {donationStats.topDonors.length === 0 ? (
                                        <div className="py-14 text-center text-slate-300 opacity-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Đang tải dữ liệu xếp hạng...</p>
                                        </div>
                                    ) : (
                                        donationStats.topDonors.map((donor, index) => (
                                            <div key={index} className="flex items-center gap-4 relative">
                                                <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ring-1 ring-white ${index === 0 ? 'bg-amber-100 text-amber-600 scale-110' :
                                                        index === 1 ? 'bg-slate-200 text-slate-600' :
                                                            index === 2 ? 'bg-orange-100 text-orange-600' :
                                                                'bg-slate-50 text-slate-400'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-extrabold text-slate-900 text-sm tracking-tight truncate">{donor.name}</p>
                                                    <p className="text-[11px] font-black text-blue-500">{formatCurrency(donor.total)}</p>
                                                </div>
                                                {index === 0 && (
                                                    <div className="bg-amber-50 rounded-lg p-1 animate-bounce">
                                                        <Star className="size-4 text-amber-500 fill-amber-500" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Icons reference fix
function Stars({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 2v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="M2 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="M12 22v-4" /><path d="m19.07 19.07-2.83-2.83" /><path d="M22 12h-4" /><path d="m19.07 4.93-2.83 2.83" />
        </svg>
    )
}
