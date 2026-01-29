"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { userService } from '@/services/user.service';
import { hospitalService } from '@/services/hospital.service';
import { User } from '@/lib/database.types';
import { Loader2, Calendar, MapPin, Droplet, Star, TrendingUp, Plus, Clock, Award } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => fetchDashboardData()} className="text-red-600 hover:bg-red-100">
                        Thử lại
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-[#1f1f1f]">Bảng điều khiển</h2>
                <p className="text-gray-500 text-sm">Chào mừng bạn quay trở lại với hệ thống quản trị REDHOPE.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng người hiến</p>
                        <p className="text-2xl font-bold text-[#120e1b] mt-1">{loading ? '...' : stats.donors.toLocaleString()}</p>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Hoạt động</p>
                            {stats.prevDonors > 0 && (
                                <p className={`text-xs flex items-center gap-1 font-bold ${isTrendPositive ? 'text-green-600' : 'text-red-500'}`}>
                                    <TrendingUp className={`w-4 h-4 ${!isTrendPositive ? 'rotate-180' : ''}`} />
                                    {isTrendPositive ? '+' : ''}{donorsTrend.toFixed(0)}%
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bệnh viện đối tác</p>
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-500 mt-2" />
                        ) : (
                            <p className="text-2xl font-bold text-[#120e1b] mt-1">{stats.hospitals}</p>
                        )}
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1 font-bold">
                            <Plus className="w-4 h-4" />
                            Hệ thống ổn định
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Yêu cầu máu</p>
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-500 mt-2" />
                        ) : (
                            <p className="text-2xl font-bold text-[#120e1b] mt-1">{stats.requests}</p>
                        )}
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1 font-bold">
                            <Clock className="w-4 h-4" />
                            Cần phê duyệt
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Điểm thưởng cấp</p>
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-500 mt-2" />
                        ) : (
                            <p className="text-2xl font-bold text-[#120e1b] mt-1">{(stats.points / 1000).toFixed(1)}K</p>
                        )}
                        <p className="text-xs text-purple-600 mt-2 flex items-center gap-1 font-bold">
                            <Award className="w-4 h-4" />
                            Tổng quỹ điểm
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#120e1b] mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-8 flex justify-center text-gray-500 gap-2 font-medium">
                            <Loader2 className="animate-spin w-5 h-5" /> Đang tải...
                        </div>
                    ) : recentDonors.length > 0 ? (
                        recentDonors.map((donor) => (
                            <div key={donor.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg">
                                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                                    {donor.avatar_url ? (
                                        <img src={donor.avatar_url} alt={donor.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-gray-500 text-sm">{donor.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#120e1b]">
                                        Người hiến tặng <span className="font-bold">{donor.full_name}</span> vừa đăng ký
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {donor.created_at ? new Date(donor.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleViewDetail(donor)}
                                    className="text-xs font-bold text-[#6324eb] hover:bg-purple-50 hover:text-[#6324eb]"
                                >
                                    Chi tiết
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-500 text-sm font-medium">
                            Chưa có hoạt động mới nào.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 gap-0">
                    <div className="bg-white rounded-3xl w-full overflow-hidden">
                        {/* Header Background with Pattern */}
                        <div className="relative h-32 bg-gradient-to-br from-[#6324eb] to-[#925eff] overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        </div>

                        <div className="px-6 pb-8 relative">
                            <div className="flex flex-col items-center -mt-12 mb-4">
                                <div className="p-1.5 bg-white rounded-full shadow-xl relative z-10">
                                    <Avatar className="size-24 border border-purple-100">
                                        {selectedDonor?.avatar_url ? (
                                            <AvatarImage src={selectedDonor.avatar_url} alt={selectedDonor.full_name} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-[#f3f0ff] to-[#e6dbff] text-3xl font-bold text-[#6324eb] uppercase">
                                            {selectedDonor?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <h3 className="mt-4 text-2xl font-bold text-[#120e1b] text-center tracking-tight">
                                    {selectedDonor?.full_name}
                                </h3>
                                <p className="text-gray-500 font-medium text-sm">{selectedDonor?.email}</p>

                                <div className="flex gap-3 mt-5">
                                    <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-xs font-bold gap-1.5 border ${selectedDonor?.blood_group
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                        <Droplet className="w-3.5 h-3.5 fill-current" />
                                        {selectedDonor?.blood_group || 'Chưa ĐK'}
                                    </Badge>
                                    <Badge variant="outline" className="px-4 py-1.5 rounded-full text-xs font-bold gap-1.5 bg-amber-50 text-amber-700 border border-amber-100">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {selectedDonor?.current_points || 0} điểm
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                <Card className="border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group shadow-none">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="p-2.5 bg-white rounded-xl text-[#6324eb] shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-[#6324eb] transition-colors">Khu vực hoạt động</p>
                                            <p className="text-sm font-bold text-[#1f1f1f] mt-0.5">
                                                {selectedDonor?.district && selectedDonor?.city
                                                    ? `${selectedDonor.district}, ${selectedDonor.city}`
                                                    : selectedDonor?.city || 'Chưa cập nhật địa chỉ'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group shadow-none">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="p-2.5 bg-white rounded-xl text-[#6324eb] shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-[#6324eb] transition-colors">Ngày tham gia</p>
                                            <p className="text-sm font-bold text-[#1f1f1f] mt-0.5">
                                                {selectedDonor?.created_at ? new Date(selectedDonor.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="mt-8">
                                <Link href="/admin/admin-donor" className="w-full">
                                    <Button className="w-full h-11 bg-gradient-to-r from-[#6324eb] to-[#501ac2] hover:from-[#501ac2] hover:to-[#3e149c] shadow-lg shadow-purple-200 hover:shadow-purple-300 font-bold text-sm">
                                        Xem quản lý đầy đủ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
