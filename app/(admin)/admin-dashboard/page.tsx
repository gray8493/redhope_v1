"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { userService } from '@/services/user.service';
import { User } from '@/lib/database.types';
import { Loader2, X, Calendar, MapPin, Droplet, Star, TrendingUp, Plus, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function AdminDashboard() {
    const [recentDonors, setRecentDonors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonor, setSelectedDonor] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                // Use limited query on server-side
                const data = await userService.getRecent(5);
                setRecentDonors(data);
            } catch (error) {
                console.error("Failed to fetch recent activity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentActivity();
    }, []);

    const handleViewDetail = (donor: User) => {
        setSelectedDonor(donor);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-[#1f1f1f]">Bảng điều khiển</h2>
                <p className="text-gray-500 text-sm">Chào mừng bạn quay trở lại với hệ thống quản trị REDHOPE.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng người hiến</p>
                        <p className="text-2xl font-bold text-[#120e1b] mt-1">12,842</p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            +12% so với tháng trước
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bệnh viện đối tác</p>
                        <p className="text-2xl font-bold text-[#120e1b] mt-1">84</p>
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Mới thêm 2 bệnh viện
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Yêu cầu máu</p>
                        <p className="text-2xl font-bold text-[#120e1b] mt-1">156</p>
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            24 yêu cầu đang xử lý
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Điểm thưởng cấp</p>
                        <p className="text-2xl font-bold text-[#120e1b] mt-1">45.2K</p>
                        <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Vouchers đã phát hành
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#120e1b] mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-8 flex justify-center text-gray-500 gap-2">
                            <Loader2 className="animate-spin w-5 h-5" /> Đang tải...
                        </div>
                    ) : recentDonors.length > 0 ? (
                        recentDonors.map((donor) => (
                            <div key={donor.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                                    {donor.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#120e1b]">
                                        Người hiến tặng <span className="font-bold">{donor.full_name}</span> vừa đăng ký
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {donor.created_at ? new Date(donor.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleViewDetail(donor)}
                                    className="text-xs font-semibold text-[#6324eb] hover:bg-purple-50 hover:text-[#6324eb]"
                                >
                                    Chi tiết
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-500 text-sm">
                            Chưa có hoạt động mới nào.
                        </div>
                    )}
                </div>
            </div>

            {/* Donor Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 gap-0">
                    <div className="bg-white rounded-3xl w-full overflow-hidden">
                        {/* Header Background with Pattern */}
                        <div className="relative h-32 bg-gradient-to-br from-[#6324eb] to-[#925eff] overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
                                    <circle cx="80" cy="20" r="20" />
                                    <circle cx="20" cy="80" r="10" />
                                </svg>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="px-6 pb-8 relative">
                            {/* Avatar */}
                            <div className="flex flex-col items-center -mt-12 mb-4">
                                <div className="p-1.5 bg-white rounded-full shadow-xl relative z-10">
                                    <Avatar className="size-24 border border-purple-100">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-gradient-to-br from-[#f3f0ff] to-[#e6dbff] text-3xl font-bold text-[#6324eb] uppercase">
                                            {selectedDonor?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <h3 className="mt-4 text-2xl font-bold text-[#120e1b] text-center tracking-tight">
                                    {selectedDonor?.full_name}
                                </h3>
                                <p className="text-gray-500 font-medium text-sm">{selectedDonor?.email}</p>

                                {/* Badges */}
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

                            {/* Info Cards */}
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

                            {/* Action Button */}
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
