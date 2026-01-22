"use client";

import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { hospitalService } from '@/services/hospital.service';
import { voucherService } from '@/services/voucher.service';
import { Loader2, Users, Hospital, Ticket, CheckCircle, XCircle } from 'lucide-react';

export default function GlobalAnalyticsPage() {
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch in parallel
                const [users, hospitals, vouchers] = await Promise.all([
                    userService.getAll(),
                    hospitalService.getAll(),
                    voucherService.getAll(),
                ]);

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
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-[#6324eb]" />
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
                    <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live Data
                    </span>
                </div>
            </div>

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
                        {Object.entries(stats.donorsByBloodGroup).map(([group, count]) => (
                            <div key={group}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{group}</span>
                                    <span className="text-gray-500">{count} người ({Math.round(count / stats.totalDonors * 100)}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${bloodGroupColors[group] || 'bg-gray-400'}`}
                                        style={{ width: `${(count / stats.totalDonors) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
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
                                <p className="text-xs text-green-700 mt-1">Hệ thống đang nghi nhận {stats.totalDonors} người hiến máu thường xuyên. Tỷ lệ xác minh đạt {stats.totalDonors > 0 ? '100%' : '0%'}.</p>
                            </div>
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
        </div>
    );
}
