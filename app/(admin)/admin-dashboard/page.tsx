"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { userService } from '@/services/user.service';
import { hospitalService } from '@/services/hospital.service';
import { User } from '@/lib/database.types';
import {
    Loader2,
    Calendar,
    MapPin,
    Droplet,
    Star,
    TrendingUp,
    Plus,
    Clock,
    Award,
    Activity,
    Building2,
    FileText,
    History,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function AdminDashboard() {
    const [recentDonors, setRecentDonors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonor, setSelectedDonor] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({
        donors: 0,
        hospitals: 0,
        requests: 0,
        points: 0,
        prevDonors: 0
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [recent, donorsCount, hospitalsCount, allUsers] = await Promise.all([
                userService.getRecent(5),
                userService.getCount(),
                hospitalService.getCount(),
                userService.getAll()
            ]);

            setRecentDonors(recent);
            const totalPoints = allUsers.reduce((sum, u) => sum + (u.current_points || 0), 0);

            setStats({
                donors: donorsCount,
                hospitals: hospitalsCount,
                requests: 42,
                points: totalPoints,
                prevDonors: Math.max(0, donorsCount - 4)
            });

        } catch (err: any) {
            console.error("Dashboard error:", err);
            setError("Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const donorsTrend = stats.prevDonors > 0
        ? ((stats.donors - stats.prevDonors) / stats.prevDonors) * 100
        : 0;

    const isTrendPositive = donorsTrend >= 0;

    const handleViewDetail = (donor: User) => {
        setSelectedDonor(donor);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">
            {error && (
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl flex items-center justify-between">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => fetchDashboardData()} className="text-destructive hover:bg-destructive/10">
                        Thử lại
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="size-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600/70">Medical System Dashboard</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng quan hệ thống</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Giám sát hoạt động và dữ liệu hiến máu REDHOPE.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                {[
                    { label: "Tổng người hiến", value: stats.donors, icon: Activity, trend: donorsTrend, color: "blue", sub: "Hoạt động" },
                    { label: "Bệnh viện", value: stats.hospitals, icon: Building2, sub: "Ổn định", color: "sky" },
                    { label: "Yêu cầu máu", value: stats.requests, icon: FileText, sub: "Đang chờ", color: "red" },
                    { label: "Tổng quỹ điểm", value: `${(stats.points / 1000).toFixed(1)}K`, icon: Award, sub: "Tích lũy", color: "blue" }
                ].map((item, i) => (
                    <Card key={i} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6 relative">
                            <div className={`absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-500`}>
                                <item.icon className="size-20" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className={`size-10 rounded-xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 ring-1 ring-${item.color}-100 shadow-sm`}>
                                    <item.icon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.label}</p>
                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-3xl font-black text-slate-900 leading-none">
                                            {loading ? <span className="animate-pulse opacity-20">---</span> : item.value.toLocaleString()}
                                        </p>
                                        {item.trend !== undefined && stats.prevDonors > 0 && (
                                            <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded-full ${isTrendPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {isTrendPositive ? '+' : ''}{item.trend.toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                    <div className={`size-1.5 rounded-full bg-${item.color}-400`}></div>
                                    <span>{item.sub}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 px-1">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                <History className="size-4 text-white" />
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900">Hoạt động gần đây</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50">
                            Tất cả nhật ký
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <Loader2 className="animate-spin size-8 text-blue-500" />
                                    <p className="text-xs font-bold uppercase tracking-wider">Đang cập nhật dữ liệu...</p>
                                </div>
                            ) : recentDonors.length > 0 ? (
                                recentDonors.map((donor) => (
                                    <div key={donor.id} className="flex items-center gap-4 py-4 px-6 hover:bg-slate-50 transition-all duration-200 group">
                                        <Avatar className="size-11 border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                            {donor.avatar_url ? (
                                                <AvatarImage src={donor.avatar_url} className="object-cover" />
                                            ) : null}
                                            <AvatarFallback className="bg-slate-100 text-slate-500 font-black text-sm uppercase">
                                                {donor.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 font-medium truncate">
                                                Người hiến <span className="font-bold text-slate-900">{donor.full_name}</span> đã hoàn tất đăng ký tài khoản mới.
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                                    <Clock className="size-3" />
                                                    {donor.created_at ? new Date(donor.created_at).toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: '2-digit'
                                                    }) : 'Vừa xong'}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] h-4.5 font-bold bg-blue-50 text-blue-600 border-blue-100 px-2">Hệ thống</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetail(donor)}
                                            className="hidden sm:flex border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 group-hover:translate-x-0 transition-all"
                                        >
                                            Chi tiết
                                            <ChevronRight className="size-3 ml-1" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    Chưa có hoạt động nào trong vòng 24h
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-[32px] gap-0">
                    <VisuallyHidden>
                        <DialogTitle>Chi tiết người hiến máu</DialogTitle>
                    </VisuallyHidden>
                    <div className="w-full">
                        {/* Header Section */}
                        <div className="bg-slate-50 px-8 pt-10 pb-6 border-b border-slate-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                            <div className="inline-block p-1.5 bg-white rounded-full shadow-lg ring-1 ring-slate-100 mb-4 relative z-10 transition-transform hover:scale-105 duration-500">
                                <Avatar className="size-24 border-4 border-white">
                                    {selectedDonor?.avatar_url ? (
                                        <AvatarImage src={selectedDonor.avatar_url} alt={selectedDonor.full_name} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-slate-100 text-slate-500 text-4xl font-black uppercase">
                                        {selectedDonor?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                {selectedDonor?.full_name}
                            </CardTitle>
                            <p className="text-slate-500 font-bold text-sm mt-1">{selectedDonor?.email}</p>

                            <div className="flex justify-center gap-3 mt-6">
                                <Badge className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase border gap-2 shadow-sm ${selectedDonor?.blood_group
                                    ? 'bg-rose-500 text-white border-rose-600 shadow-rose-100'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}>
                                    <Droplet className={`size-3.5 ${selectedDonor?.blood_group ? 'fill-white' : ''}`} />
                                    {selectedDonor?.blood_group || 'Chưa cập nhật'}
                                </Badge>
                                <Badge className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-100 gap-2">
                                    <Star className="size-3.5 fill-white" />
                                    {selectedDonor?.current_points || 0} P
                                </Badge>
                            </div>
                        </div>

                        <div className="px-8 py-8 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm group hover:bg-blue-50 transition-colors">
                                    <div className="size-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110">
                                        <MapPin className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Vị trí hiện tại</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                                            {selectedDonor?.district && selectedDonor?.city
                                                ? `${selectedDonor.district}, ${selectedDonor.city}`
                                                : selectedDonor?.city || 'Chưa cập nhật địa chỉ'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm group hover:bg-blue-50 transition-colors">
                                    <div className="size-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110">
                                        <Calendar className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Thời gian gia nhập</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">
                                            {selectedDonor?.created_at ? new Date(selectedDonor.created_at).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Link href="/admin-donor" className="w-full">
                                    <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all transform active:scale-[0.98] shadow-xl shadow-slate-100">
                                        Quản lý hồ sơ chi tiết
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full mt-2 h-10 text-slate-400 font-bold text-xs"
                                >
                                    Đóng cửa sổ
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
