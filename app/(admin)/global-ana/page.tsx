"use client";

import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { hospitalService } from '@/services/hospital.service';
import { voucherService } from '@/services/voucher.service';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Hospital, Ticket, CheckCircle, XCircle, Heart, DollarSign, TrendingUp, Calendar, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
                // Fetch in parallel
                const [users, hospitals, vouchers] = await Promise.all([
                    userService.getAll(),
                    hospitalService.getAll(),
                    voucherService.getAll(),
                ]);

                if (!isMounted) return;

                // User Stats
                const bloodGroups: Record<string, number> = {};
                users.forEach(u => {
                    if (u.blood_group) {
                        bloodGroups[u.blood_group] = (bloodGroups[u.blood_group] || 0) + 1;
                    }
                });

                // Hospital Stats
                const verified = hospitals.filter(h => h.is_verified).length;

                // Voucher Stats
                // Note: point_cost might be null in DB, handle safely
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

                // Fetch financial donations
                const { data: donations, error: donationsError } = await supabase
                    .from('financial_donations')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (donationsError) throw donationsError;

                if (donations && isMounted) {
                    const completed = donations.filter(d => d.status === 'completed');
                    const pending = donations.filter(d => d.status === 'pending');
                    const totalAmount = completed.reduce((sum, d) => sum + (d.amount || 0), 0);

                    // Calculate top donors
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

        return () => {
            isMounted = false;
        };
    }, []);

    const bloodGroupColors: Record<string, string> = {
        'O+': 'bg-blue-500',
        'O-': 'bg-blue-300',
        'A+': 'bg-green-500',
        'A-': 'bg-green-300',
        'B+': 'bg-red-500',
        'B-': 'bg-red-300',
        'AB+': 'bg-yellow-500',
        'AB-': 'bg-yellow-300',
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
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-[#6324eb]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <div className="text-red-500 font-bold flex items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-[#1f1f1f]">Phân tích Hệ thống</h2>
                    <p className="text-xs text-gray-500 mt-1">Tổng quan dữ liệu thực tế từ hệ thống.</p>
                </div>
                <div className="flex items-center gap-2">
                    {!error && (
                        <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Data
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 font-bold text-sm">
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="donations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 font-bold text-sm">
                        <Heart className="w-4 h-4 mr-1.5 text-pink-500" />
                        Quyên góp từ Nhà hảo tâm
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6 space-y-8">
                    {/* Top Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Donors Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -right-4 -top-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                                <Users className="w-32 h-32" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Người hiến máu</p>
                                </div>
                                <p className="text-4xl font-bold text-[#1f1f1f]">{stats.totalDonors}</p>
                                <p className="text-xs text-gray-400 mt-2">Tổng số người dùng đã đăng ký</p>
                            </div>
                        </div>

                        {/* Hospitals Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -right-4 -top-4 text-red-500/5 group-hover:text-red-500/10 transition-colors">
                                <Hospital className="w-32 h-32" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                        <Hospital className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bệnh viện đối tác</p>
                                </div>
                                <p className="text-4xl font-bold text-[#1f1f1f]">{stats.totalHospitals}</p>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                        <CheckCircle className="w-3 h-3" /> {stats.verifiedHospitals} Đã xác minh
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                                        <XCircle className="w-3 h-3" /> {stats.pendingHospitals} Chưa xác minh
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vouchers Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute -right-4 -top-4 text-purple-500/5 group-hover:text-purple-500/10 transition-colors">
                                <Ticket className="w-32 h-32" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Voucher & Điểm</p>
                                </div>
                                <p className="text-4xl font-bold text-[#1f1f1f]">{stats.totalPointsUsed.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-2">Tổng điểm tương đương giá trị voucher</p>
                                <div className="mt-2 text-xs font-medium text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded">
                                    {stats.activeVouchers} Voucher đang hoạt động
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Blood Group Distribution */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-lg text-[#1f1f1f] mb-6">Phân bố Nhóm máu (Người hiến)</h3>
                            <div className="space-y-4">
                                {Object.entries(stats.donorsByBloodGroup).map(([group, count]) => {
                                    const total = stats.totalDonors > 0 ? stats.totalDonors : 1;
                                    const percent = stats.totalDonors > 0 ? Math.round(count / total * 100) : 0;
                                    return (
                                        <div key={group}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{group}</span>
                                                <span className="text-gray-500">{count} người ({percent}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${bloodGroupColors[group] || 'bg-gray-400'}`}
                                                    style={{ width: `${stats.totalDonors > 0 ? (count / stats.totalDonors) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(stats.donorsByBloodGroup).length === 0 && (
                                    <p className="text-center text-gray-500 py-10">Chưa có dữ liệu nhóm máu</p>
                                )}
                            </div>
                        </div>

                        {/* System Health / Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
                            <h3 className="font-bold text-lg text-[#1f1f1f] mb-6">Trạng thái Hệ thống</h3>

                            <div className="space-y-6 flex-1">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                                    <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-green-900">Tăng trưởng Người dùng</h4>
                                        <p className="text-xs text-green-700 mt-1">Hệ thống đang ghi nhận {stats.totalDonors} người hiến máu đã đăng ký.</p>                            </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                                        <Hospital className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-blue-900">Mạng lưới Bệnh viện</h4>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Kết nối với {stats.totalHospitals} cơ sở y tế.
                                            {stats.pendingHospitals > 0 ? ` Có ${stats.pendingHospitals} cơ sở đang chờ xác minh danh tính.` : ' Tất cả bệnh viện đã được xác minh.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                                    <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-purple-900">Eco-System Rewards</h4>
                                        <p className="text-xs text-purple-700 mt-1">
                                            {stats.activeVouchers} ưu đãi đang khả dụng để đổi điểm thưởng, khuyến khích hoạt động hiến máu tình nguyện.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Donations Tab */}
                <TabsContent value="donations" className="mt-6 space-y-8">
                    {/* Donation Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-20">
                                <Heart className="w-24 h-24" />
                            </div>
                            <div className="relative">
                                <p className="text-pink-100 text-xs font-bold uppercase tracking-wider mb-2">Tổng quyên góp</p>
                                <p className="text-3xl font-bold">{formatCurrency(donationStats.totalAmount)}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <p className="text-gray-500 text-xs font-bold uppercase">Thành công</p>
                            </div>
                            <p className="text-2xl font-bold text-[#1f1f1f]">{donationStats.completedCount}</p>
                            <p className="text-xs text-gray-400 mt-1">Giao dịch hoàn tất</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                    <Loader2 className="w-5 h-5" />
                                </div>
                                <p className="text-gray-500 text-xs font-bold uppercase">Đang xử lý</p>
                            </div>
                            <p className="text-2xl font-bold text-[#1f1f1f]">{donationStats.pendingCount}</p>
                            <p className="text-xs text-gray-400 mt-1">Chờ xác nhận</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <p className="text-gray-500 text-xs font-bold uppercase">Trung bình</p>
                            </div>
                            <p className="text-2xl font-bold text-[#1f1f1f]">
                                {donationStats.completedCount > 0
                                    ? formatCurrency(donationStats.totalAmount / donationStats.completedCount)
                                    : formatCurrency(0)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Mỗi lần quyên góp</p>
                        </div>
                    </div>

                    {/* Donations Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Donations */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-lg text-[#1f1f1f] mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                Quyên góp gần đây
                            </h3>

                            {donationStats.recentDonations.length === 0 ? (
                                <div className="text-center py-10">
                                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Chưa có quyên góp nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {donationStats.recentDonations.map((donation) => (
                                        <div key={donation.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {donation.is_anonymous ? '?' : donation.donor_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#1f1f1f]">
                                                        {donation.is_anonymous ? 'Nhà hảo tâm ẩn danh' : donation.donor_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{formatDate(donation.created_at)}</p>
                                                    {donation.message && (
                                                        <p className="text-xs text-gray-400 mt-1 italic">"{donation.message}"</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#1f1f1f]">{formatCurrency(donation.amount)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${donation.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : donation.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {donation.status === 'completed' ? 'Hoàn tất' : donation.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Donors */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-lg text-[#1f1f1f] mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                Nhà hảo tâm tiêu biểu
                            </h3>

                            {donationStats.topDonors.length === 0 ? (
                                <div className="text-center py-10">
                                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Chưa có dữ liệu</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {donationStats.topDonors.map((donor, index) => (
                                        <div key={donor.name} className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-200 text-gray-600' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-[#1f1f1f]">{donor.name}</p>
                                                <p className="text-xs text-gray-500">{formatCurrency(donor.total)}</p>
                                            </div>
                                            {index === 0 && (
                                                <span className="text-yellow-500 text-lg">🏆</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
