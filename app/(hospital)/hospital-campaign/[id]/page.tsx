"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Users,
    Droplet,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const fromTab = searchParams.get('fromTab') || 'active';

    const [campaign, setCampaign] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'registrations'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const campaignId = params.id as string;

    // Fetch campaign details
    useEffect(() => {
        if (!campaignId) return;

        const fetchData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);

                // Fetch campaign details
                const foundCampaign = await campaignService.getById(campaignId);

                if (!foundCampaign) {
                    toast.error('Không tìm thấy chiến dịch');
                    router.push('/hospital-campaign');
                    return;
                }

                setCampaign(foundCampaign);

                // Fetch registrations
                const regs = await campaignService.getCampaignRegistrations(campaignId);
                setRegistrations(regs || []);

            } catch (error: any) {
                console.error('Error fetching campaign detailed:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    error: error
                });
                toast.error('Không thể tải thông tin chiến dịch: ' + (error.message || 'Lỗi không xác định'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, user?.id, router]);

    if (loading) {
        return (
            <main className="p-8 max-w-[1400px] w-full mx-auto">
                <Skeleton className="h-12 w-64 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-96" />
            </main>
        );
    }

    if (!campaign) {
        return null;
    }

    // Calculate stats
    const totalRegistered = registrations.length;
    const totalCompleted = registrations.filter(r => r.status === 'Completed').length;
    const totalCancelled = registrations.filter(r => r.status === 'Cancelled').length;
    const progress = campaign.target_units > 0
        ? (totalCompleted / campaign.target_units) * 100
        : 0;

    // Filter registrations
    const filteredRegistrations = registrations.filter(r => {
        const fullName = r.user?.full_name || "";
        const email = r.user?.email || "";
        const query = searchQuery.toLowerCase();

        const matchesSearch = fullName.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Export to CSV
    const handleExport = () => {
        const csv = [
            ['STT', 'Họ tên', 'Email', 'Số điện thoại', 'Nhóm máu', 'Trạng thái', 'Thời gian đăng ký'],
            ...filteredRegistrations.map((r, i) => [
                i + 1,
                r.user?.full_name || '',
                r.user?.email || '',
                r.user?.phone || '',
                r.user?.blood_group || '',
                r.status || '',
                new Date(r.created_at).toLocaleString('vi-VN')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `danh-sach-dang-ky-${campaign.name}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Đã xuất file CSV');
    };

    return (
        <main className="p-8 max-w-[1400px] w-full mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/hospital-campaign?tab=${fromTab}`}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {campaign.name}
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin className="w-4 h-4" />
                                {campaign.location_name}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(campaign.start_time).toLocaleDateString('vi-VN')} - {new Date(campaign.end_time).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    campaign.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {campaign.status === 'active' ? 'Đang hoạt động' :
                        campaign.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Đăng ký</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalRegistered}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Hoàn thành</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCompleted}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Đã hủy</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCancelled}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Droplet className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Tiến độ</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{Math.round(progress)}%</p>
                    <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'overview' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Tổng quan
                    {activeTab === 'overview' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                </button>
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'registrations' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Danh sách đăng ký
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">
                        {totalRegistered}
                    </span>
                    {activeTab === 'registrations' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'overview' ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Thông tin chiến dịch</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500">Mô tả</label>
                            <p className="text-slate-900 dark:text-white mt-1">{campaign.description || 'Chưa có mô tả'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Nhóm máu cần</label>
                                <p className="text-slate-900 dark:text-white mt-1 font-bold">
                                    {campaign.blood_group_needed?.join(', ') || 'Tất cả'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Số lượng cần</label>
                                <p className="text-slate-900 dark:text-white mt-1 font-bold">
                                    {campaign.target_units} đơn vị
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] outline-none"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] outline-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Booked">Đã đặt</option>
                            <option value="Completed">Hoàn thành</option>
                            <option value="Cancelled">Đã hủy</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-[#6324eb] text-white rounded-lg text-sm font-bold hover:bg-[#5219d4] transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Xuất CSV
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">STT</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nhóm máu</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            Chưa có người đăng ký
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg, index) => (
                                        <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {reg.user?.full_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{reg.user?.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{reg.user?.phone || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">
                                                    {reg.user?.blood_group || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded ${reg.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    reg.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {reg.status === 'Completed' ? 'Hoàn thành' :
                                                        reg.status === 'Cancelled' ? 'Đã hủy' : 'Đã đặt'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(reg.created_at).toLocaleString('vi-VN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
