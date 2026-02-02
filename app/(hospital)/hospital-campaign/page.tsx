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
import MiniFooter from "@/components/shared/MiniFooter";

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
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-6 md:p-10 text-left medical-gradient">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Quản lý Hoạt động</span>
                        <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight">Chiến dịch Bệnh viện</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl italic opacity-80">Theo dõi, kiểm soát và tối ưu hóa các đợt hiến máu lưu động trong thời gian thực.</p>
                </div>
                <Link href="/hospital-requests/create">
                    <button className="flex items-center gap-3 px-6 py-3.5 bg-med-primary text-white rounded-[22px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-med-primary/30 hover:shadow-med-primary/40 hover:-translate-y-0.5 transition-all border-b-4 border-teal-800 active:translate-y-0.5 active:border-b-0">
                        Phát động Chiến dịch
                    </button>
                </Link>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <CampaignStatCard
                    title="Tổng đơn vị máu"
                    value={totalBlood}
                    unit="Đv"
                    icon={Droplet}
                    color="rose"
                    desc="Đang thu nhận thực tế"
                />
                <CampaignStatCard
                    title="Hiệu suất đăng ký"
                    value={`${donationRate}%`}
                    unit={`${totalCompleted}/${totalRegistered}`}
                    icon={Users}
                    color="teal"
                    desc="Tỉ lệ hoàn thành ca hiến"
                />
                <CampaignStatCard
                    title="Hoãn hiến lâm sàng"
                    value={totalDeferred}
                    unit="Ca"
                    icon={Clock}
                    color="amber"
                    desc="Cần theo dõi sức khỏe"
                />
                <CampaignStatCard
                    title="Đợt thiếu hụt"
                    value={underTargetCount}
                    unit="Đợt"
                    icon={AlertCircle}
                    color="indigo"
                    desc="Chưa đạt 100% chỉ tiêu"
                />
            </div>

            {/* Controls Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-med-primary transition-colors" />
                    <input
                        className="w-full h-14 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl pl-14 pr-6 text-sm focus:ring-2 focus:ring-med-primary/20 focus:border-med-primary placeholder-slate-400 font-medium outline-none transition-all shadow-med group-focus-within:shadow-xl"
                        placeholder="Mã chiến dịch, địa bàn hoặc tên đơn vị..."
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-xl">
                    {[
                        { id: 'active', label: 'Hiện tại', count: activeCampaigns.length },
                        { id: 'history', label: 'Lịch sử', count: historyCampaigns.length },
                        { id: 'drafts', label: 'Bản nháp', count: draftCampaigns.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as any)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-med-primary shadow-xl shadow-slate-300/10 scale-105'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-lg text-[9px] ${activeTab === tab.id ? 'bg-med-primary/10 text-med-primary' : 'bg-slate-200/50 text-slate-400'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-med">
                            <Skeleton className="h-44 w-full rounded-2xl mb-6" />
                            <Skeleton className="h-6 w-3/4 mb-3" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-md py-24 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                    <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="size-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-medical-header text-slate-900 mb-2">Đăng ký Chiến dịch mới</h3>
                    <p className="text-slate-400 text-sm italic">Hệ thống chưa ghi nhận chiến dịch nào thuộc danh mục này.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-8`}>
                        {paginatedCampaigns.map(campaign => {
                            const registered = campaign.appointments?.length || 0;
                            const completed = campaign.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
                            const progress = campaign.target_units > 0 ? (completed / campaign.target_units) * 100 : 0;

                            return (
                                <Link
                                    key={campaign.id}
                                    href={`/hospital-campaign/${campaign.id}?fromTab=${activeTab}`}
                                    className="bg-white/80 backdrop-blur-xl rounded-[40px] overflow-hidden border border-slate-100 shadow-med hover:shadow-med-hover hover:-translate-y-1.5 transition-all group relative border-b-4 border-slate-100/50 active:translate-y-0"
                                >
                                    <div className="relative h-44 bg-slate-100">
                                        <div className="absolute inset-0 bg-med-primary/10 group-hover:bg-med-primary/20 transition-colors"></div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                                            <Droplet className="size-20 text-med-primary" />
                                        </div>
                                        <div className="absolute top-5 right-5 z-10">
                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${campaign.status === 'active'
                                                ? 'bg-emerald-500/90 text-white border-emerald-400/50'
                                                : 'bg-slate-700/90 text-white border-slate-600/50'
                                                }`}>
                                                {campaign.status === 'active' ? '● Live' : 'Sử liệu'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h3 className="text-lg font-medical-header text-slate-900 mb-1 group-hover:text-med-primary transition-colors line-clamp-1">
                                            {campaign.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium mb-6 flex items-center gap-2">
                                            <MapPin className="size-3" /> {campaign.location_name}
                                        </p>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Đã tiếp nhận</span>
                                                    <span className="text-xl font-medical-header text-slate-800">{completed} <span className="text-[10px] text-slate-300 font-bold uppercase italic">đv</span></span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Mục tiêu</span>
                                                    <span className="text-sm font-bold text-slate-600">{campaign.target_units} đv</span>
                                                </div>
                                            </div>
                                            <div className="h-3 w-full bg-slate-50 rounded-full border border-slate-100 p-0.5 shadow-inner">
                                                <div
                                                    className="h-full bg-med-primary rounded-full shadow-[0_0_12px_rgba(13,148,136,0.5)] transition-all duration-1000"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <Users className="size-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500">{completed}/{registered} <span className="text-[9px] opacity-70">Sàng lọc</span></span>
                                            </div>
                                            <button className="text-[10px] font-black uppercase text-med-primary tracking-widest group-hover:underline">Chi tiết →</button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pt-10 border-t border-slate-100">
                            <Pagination>
                                <PaginationContent className="gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={`rounded-2xl border-slate-100 h-12 px-6 font-black text-[10px] uppercase tracking-widest transition-all ${page === 1 ? "pointer-events-none opacity-30" : "hover:bg-white hover:text-med-primary hover:shadow-xl cursor-pointer"}`}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={page === i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`rounded-2xl size-12 font-black text-xs transition-all cursor-pointer ${page === i + 1 ? "bg-med-primary text-white shadow-xl shadow-med-primary/30 border-none scale-110" : "bg-white text-slate-400 border-slate-100 hover:text-med-primary hover:shadow-xl"}`}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className={`rounded-2xl border-slate-100 h-12 px-6 font-black text-[10px] uppercase tracking-widest transition-all ${page === totalPages ? "pointer-events-none opacity-30" : "hover:bg-white hover:text-med-primary hover:shadow-xl cursor-pointer"}`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
            <MiniFooter />
        </main>
    );
}

function CampaignStatCard({ title, value, unit, icon: Icon, color, desc }: any) {
    const colorMap: any = {
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        teal: 'text-med-primary bg-med-primary/10 border-med-primary/20',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-slate-100 shadow-med hover:shadow-med-hover hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 size-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className={`size-14 rounded-[20px] flex items-center justify-center border shadow-inner ${colorMap[color]}`}>
                    <Icon className="size-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-2xl font-medical-header text-slate-900 leading-none">
                        {value} <span className="text-[10px] text-slate-300 font-bold uppercase italic ml-1">{unit}</span>
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 italic opacity-70 leading-tight">{desc}</p>
                </div>
            </div>
        </div>
    );
}
