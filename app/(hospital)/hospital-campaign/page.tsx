"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services';
import { toast } from 'sonner';
import {
    LayoutGrid,
    List,
    Droplet,
    AlertCircle,
    Clock,
    Users,
    MapPin,
    Search,
    Calendar
} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 8;

export default function CampaignManagementPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'active' | 'history' | 'drafts'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab') as 'active' | 'history' | 'drafts';
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    // Fetch campaigns
    useEffect(() => {
        if (!user?.id) return;

        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const data = await campaignService.getAll(user.id);
                setCampaigns(data || []);
            } catch (error: any) {
                console.error('Error fetching campaigns detailed:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    error: error
                });
                toast.error('Không thể tải chiến dịch: ' + (error.message || 'Lỗi không xác định'));
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [user?.id]);

    const handleTabChange = (tab: 'active' | 'history' | 'drafts') => {
        setActiveTab(tab);
        setPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`/hospital-campaign?${params.toString()}`, { scroll: false });
    };

    // Filter campaigns
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const historyCampaigns = campaigns.filter(c => c.status === 'completed' || c.status === 'ended' || c.status === 'cancelled');
    const draftCampaigns = campaigns.filter(c => c.status === 'draft');

    const getCurrentList = () => {
        switch (activeTab) {
            case 'active': return activeCampaigns;
            case 'history': return historyCampaigns;
            case 'drafts': return draftCampaigns;
            default: return [];
        }
    };

    const filteredCampaigns = getCurrentList().filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
    const paginatedCampaigns = filteredCampaigns.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, activeTab]);

    // Calculate stats
    const totalBlood = activeCampaigns.reduce((sum, c) => {
        const completed = c.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
        return sum + completed;
    }, 0);

    const totalRegistered = activeCampaigns.reduce((sum, c) => sum + (c.appointments?.length || 0), 0);
    const totalCompleted = activeCampaigns.reduce((sum, c) => {
        const completed = c.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
        return sum + completed;
    }, 0);
    const donationRate = totalRegistered > 0 ? Math.round((totalCompleted / totalRegistered) * 100) : 0;

    const totalDeferred = activeCampaigns.reduce((sum, c) => {
        const deferred = c.appointments?.filter((a: any) => a.status === 'Cancelled').length || 0;
        return sum + deferred;
    }, 0);

    const underTargetCount = activeCampaigns.filter(c => {
        const completed = c.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
        return completed < (c.target_units || 0);
    }).length;

    return (
        <main className="p-8 max-w-[1400px] w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chiến dịch Bệnh viện</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">Theo dõi các đợt hiến máu đang diễn ra và dữ liệu lịch sử.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-[#6324eb]">
                        <Droplet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tổng lượng máu</p>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? <Skeleton className="h-8 w-16" /> : totalBlood} <span className="text-sm font-normal text-slate-400">Đv</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Đang vận hành</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tỉ lệ hiến máu</p>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {loading ? <Skeleton className="h-8 w-24" /> : (
                                    <>
                                        {totalCompleted}/{totalRegistered}
                                        <span className={`ml-1 text-[10px] px-1 py-0.5 rounded font-bold ${donationRate >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {donationRate}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Đã hiến / Đăng ký tổng</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Hoãn hiến hệ thống</p>
                        <div className="text-2xl font-black text-orange-600">
                            {loading ? <Skeleton className="h-8 w-12" /> : totalDeferred}
                            <span className="text-sm font-normal text-slate-400 ml-2">Người</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cần hỗ trợ theo dõi</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-indigo-50 dark:border-indigo-900/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="size-12 rounded-full bg-indigo-100 flex items-center justify-center text-[#6324eb]">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Thiếu hụt chỉ tiêu</p>
                        <div className="text-2xl font-black text-[#6324eb]">
                            {loading ? <Skeleton className="h-8 w-12" /> : underTargetCount} <span className="text-sm font-normal text-slate-400">Đợt</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cần đẩy mạnh truyền thông</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-3">
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] text-slate-900 dark:text-white placeholder-slate-500 outline-none transition-all shadow-sm"
                        placeholder="Tìm kiếm tên chiến dịch hoặc địa điểm..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                    onClick={() => handleTabChange('active')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'active' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Đang hoạt động
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">{activeCampaigns.length}</span>
                    {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('history')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'history' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Lịch sử
                    {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('drafts')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'drafts' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Bản nháp
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">{draftCampaigns.length}</span>
                    {activeTab === 'drafts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                </button>
            </div>

            {/* View Mode Toggle */}
            {activeTab === 'active' && (
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span> Chiến dịch Đang hoạt động
                    </h2>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-[#6324eb]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-[#6324eb]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Campaign List */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                            <Skeleton className="h-40 w-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 mb-8 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                        <Calendar className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Chưa có chiến dịch nào</h3>
                    <p className="text-slate-500 text-sm">Tạo chiến dịch mới để bắt đầu</p>
                </div>
            ) : (
                <>
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6 mb-12`}>
                        {paginatedCampaigns.map(campaign => {
                            const registered = campaign.appointments?.length || 0;
                            const completed = campaign.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
                            const progress = campaign.target_units > 0 ? (completed / campaign.target_units) * 100 : 0;

                            return (
                                <Link
                                    key={campaign.id}
                                    href={`/hospital-campaign/${campaign.id}?fromTab=${activeTab}`}
                                    className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group"
                                >
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${campaign.status === 'active' ? 'bg-emerald-500 text-white' :
                                                (campaign.status === 'completed' || campaign.status === 'ended') ? 'bg-slate-500 text-white' :
                                                    'bg-amber-500 text-white'
                                                }`}>
                                                {campaign.status === 'active' ? 'Đang hoạt động' : (campaign.status === 'completed' || campaign.status === 'ended') ? 'Đã kết thúc' : 'Bản nháp'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#6324eb] transition-colors">
                                            {campaign.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                                            {campaign.description}
                                        </p>

                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {campaign.location_name}
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                <span>Đã thu: {Math.round(progress)}%</span>
                                                <span>Mục tiêu: {campaign.target_units}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' :
                                                        progress >= 80 ? 'bg-green-500' :
                                                            progress < 30 ? 'bg-red-500' : 'bg-[#6324eb]'
                                                        }`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {completed}/{registered}
                                            </span>
                                            <span className="text-[11px] font-bold text-[#6324eb] group-hover:underline">
                                                Chi tiết →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={page === i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </main>
    );
}
