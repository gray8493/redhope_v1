"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { campaignService, userService } from '@/services';
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
    Calendar,
    ArrowRight,
    Edit2,
    ChevronDown,
    Check,
    X,
    CalendarDays
} from "lucide-react";
import { format } from 'date-fns';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { vi } from "date-fns/locale";
import { Calendar as ShCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Utility function to strip HTML tags and decode HTML entities
const stripHtml = (html: string): string => {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    // Clean up extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    return text;
};

// Manual Time Input Component (Compact)
const TimeInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const parts = (value || "08:00").split(':');
    const [h, setH] = useState(parts[0] || "08");
    const [m, setM] = useState(parts[1] || "00");

    useEffect(() => {
        const p = (value || "08:00").split(':');
        setH(p[0] || "08");
        setM(p[1] || "00");
    }, [value]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== "" && parseInt(val) > 23) return;
        setH(val);
        if (val.length === 2) onChange(`${val}:${m || '00'}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== "" && parseInt(val) > 59) return;
        setM(val);
        if (val.length === 2) onChange(`${h || '00'}:${val}`);
    };

    const handleBlur = () => {
        const finalH = h.padStart(2, '0');
        const finalM = m.padStart(2, '0');
        setH(finalH);
        setM(finalM);
        onChange(`${finalH}:${finalM}`);
    };

    return (
        <div className="flex items-center justify-center gap-1.5 h-10 w-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/20 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/5 transition-all outline-none">
            <input
                type="text"
                maxLength={2}
                value={h}
                onChange={handleHourChange}
                onBlur={handleBlur}
                className="w-7 bg-transparent text-sm font-bold text-center outline-none text-slate-900 dark:text-white"
            />
            <span className="text-slate-300 font-bold text-xs opacity-50">:</span>
            <input
                type="text"
                maxLength={2}
                value={m}
                onChange={handleMinuteChange}
                onBlur={handleBlur}
                className="w-7 bg-transparent text-sm font-bold text-center outline-none text-slate-900 dark:text-white"
            />
        </div>
    );
};

const ITEMS_PER_PAGE = 8;

// Helper to parse blood groups from various formats (Array, CSV string, JSON string)
const parseBloodGroups = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        const trimmed = data.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                // fall back to CSV if parse fails
            }
        }
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};

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

    // Edit Campaign states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        location_name: '',
        date: '',
        start_time: '',
        end_time: '',
        target_units: 0,
        status: 'active',
        description: '',
        target_blood_group: [] as string[],
        image: ''
    });

    const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab') as 'active' | 'history' | 'drafts';
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const getTargetBloodDisplay = (targetGroup: any) => {
        const groups = parseBloodGroups(targetGroup);
        if (groups.length === 0 || groups.length === 8) return "Tất cả";
        if (groups.length >= 5) return "Hỗn hợp (" + groups.length + ")";
        return groups.join(", ");
    };

    // Fetch campaigns
    useEffect(() => {
        if (!user?.id) return;

        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const data = await campaignService.getAll(user.id);
                setCampaigns(data || []);
            } catch (error: any) {
                console.error('Error fetching campaigns detailed:', error);
                toast.error('Không thể tải chiến dịch');
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
    // 'active' in DB covers both Active and Paused (via metadata)
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const historyCampaigns = campaigns.filter(c => ['completed', 'ended', 'closed', 'cancelled'].includes(c.status));
    const draftCampaigns = campaigns.filter(c => c.status === 'draft'); // Proper drafts

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

    // Handle Edit Campaign
    const openEditModal = (e: React.MouseEvent, campaign: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCampaign(campaign);
        const initialBloodGroups = parseBloodGroups(campaign.target_blood_group);

        // Extract image from description if embedded
        let desc = campaign.description || '';
        let img = campaign.image || campaign.image_url || '';

        const imgMatch = desc.match(/<div data-cover="([^"]+)"[^>]*><\/div>/);
        if (imgMatch) {
            img = imgMatch[1];
            desc = desc.replace(imgMatch[0], '');
        }

        setEditFormData({
            name: campaign.name || '',
            location_name: campaign.location_name || '',
            date: campaign.start_time ? format(new Date(campaign.start_time), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            start_time: campaign.start_time ? format(new Date(campaign.start_time), 'HH:mm') : '08:00',
            end_time: campaign.end_time ? format(new Date(campaign.end_time), 'HH:mm') : '17:00',
            target_units: campaign.target_units || 0,
            status: campaign.status || 'active',
            description: desc,
            target_blood_group: initialBloodGroups,
            image: img
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setIsSubmitting(true);
            const startStr = `${editFormData.date}T${editFormData.start_time}:00`;
            const endStr = `${editFormData.date}T${editFormData.end_time}:00`;

            // Embed image logic
            const finalDesc = editFormData.image
                ? `<div data-cover="${editFormData.image}" style="display:none"></div>${editFormData.description}`
                : editFormData.description;

            const updateData = {
                name: editFormData.name,
                location_name: editFormData.location_name,
                start_time: startStr,
                end_time: endStr,
                target_units: editFormData.target_units,
                status: editFormData.status,
                description: finalDesc,
                target_blood_group: editFormData.target_blood_group
                // removed 'image' field to prevent schema error
            };

            await campaignService.updateCampaign(selectedCampaign.id, updateData);

            // Refetch campaigns to update UI
            const data = await campaignService.getAll(user!.id);
            setCampaigns(data || []);

            toast.success('Cập nhật chiến dịch thành công');
            setIsEditModalOpen(false);
        } catch (error: any) {
            toast.error('Lỗi khi cập nhật: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh quá lớn (tối đa 5MB)");
            return;
        }

        const loadingToast = toast.loading("Đang tải ảnh lên...");
        try {
            const url = await userService.uploadImage(file, 'avatars');
            setEditFormData(prev => ({ ...prev, image: url }));
            toast.success("Tải ảnh thành công", { id: loadingToast });
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error("Lỗi tải ảnh: " + (error.message || "Lỗi"), { id: loadingToast });
        }
    };

    const toggleBloodGroup = (group: string) => {
        setEditFormData(prev => {
            const isExist = prev.target_blood_group.includes(group);
            return {
                ...prev,
                target_blood_group: isExist
                    ? prev.target_blood_group.filter(g => g !== group)
                    : [...prev.target_blood_group, group]
            };
        });
    };

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
        <main className="p-3 sm:p-4 md:p-8 max-w-[1400px] w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chiến dịch Bệnh viện</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Theo dõi các đợt hiến máu đang diễn ra và dữ liệu lịch sử.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-all">
                    <div className="size-9 md:size-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0065FF] shrink-0">
                        <Droplet className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] md:text-sm font-medium text-slate-500 truncate">Tổng lượng máu</p>
                        <div className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? <Skeleton className="h-6 w-12" /> : totalBlood} <span className="text-xs md:text-sm font-normal text-slate-400">Đv</span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider hidden sm:block">Đang vận hành</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-all">
                    <div className="size-9 md:size-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Users className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] md:text-sm font-medium text-slate-500 truncate">Tỉ lệ hiến máu</p>
                        <div className="flex items-baseline gap-1">
                            <div className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">
                                {loading ? <Skeleton className="h-6 w-16" /> : (
                                    <>
                                        {totalCompleted}/{totalRegistered}
                                        <span className={`ml-1 text-[9px] md:text-[10px] px-1 py-0.5 rounded font-bold ${donationRate >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {donationRate}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider hidden sm:block">Đã hiến / Đăng ký tổng</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-all">
                    <div className="size-9 md:size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <Clock className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] md:text-sm font-medium text-slate-500 truncate">Hoãn hiến</p>
                        <div className="text-lg md:text-2xl font-black text-orange-600">
                            {loading ? <Skeleton className="h-6 w-10" /> : totalDeferred}
                            <span className="text-xs md:text-sm font-normal text-slate-400 ml-1">Người</span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider hidden sm:block">Cần hỗ trợ theo dõi</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-all">
                    <div className="size-9 md:size-12 rounded-full bg-blue-100 flex items-center justify-center text-[#0065FF] shrink-0">
                        <AlertCircle className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] md:text-sm font-medium text-slate-500 truncate">Thiếu hụt</p>
                        <div className="text-lg md:text-2xl font-black text-[#0065FF]">
                            {loading ? <Skeleton className="h-6 w-10" /> : underTargetCount} <span className="text-xs md:text-sm font-normal text-slate-400">Đợt</span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider hidden sm:block">Cần đẩy mạnh truyền thông</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 md:mb-6 flex flex-col lg:flex-row items-center gap-3">
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        className="w-full h-9 md:h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-full pl-9 md:pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] text-slate-900 dark:text-white placeholder-slate-500 outline-none transition-all shadow-sm"
                        placeholder="Tìm kiếm chiến dịch..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-3 md:gap-6 border-b border-slate-200 dark:border-slate-800 mb-4 md:mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => handleTabChange('active')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'active' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Đang hoạt động
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">{activeCampaigns.length}</span>
                    {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-t-full"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('history')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'history' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Lịch sử
                    {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-t-full"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('drafts')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'drafts' ? 'text-[#0065FF]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Bản nháp
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">{draftCampaigns.length}</span>
                    {activeTab === 'drafts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0065FF] rounded-t-full"></span>}
                </button>
            </div>

            {/* View Mode Toggle */}
            {activeTab === 'active' && (
                <div className="mb-4 md:mb-6 flex items-center justify-between">
                    <h2 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span> <span className="hidden sm:inline">Chiến dịch </span>Đang hoạt động
                    </h2>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-[#0065FF]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-[#0065FF]' : 'text-slate-400 hover:text-slate-600'}`}
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
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12" : "flex flex-col gap-3 mb-8 md:mb-12"}>
                        {paginatedCampaigns.map(campaign => {
                            const registered = campaign.appointments?.length || 0;
                            const completed = campaign.appointments?.filter((a: any) => a.status === 'Completed').length || 0;
                            const progress = campaign.target_units > 0 ? (completed / campaign.target_units) * 100 : 0;

                            let statusLabel = 'Đang hoạt động';
                            let statusColor = 'bg-emerald-500';

                            // Check for Paused metadata in description
                            const isPaused = campaign.description?.includes('data-status="paused"');

                            if (campaign.status === 'active' && isPaused) {
                                statusLabel = 'Tạm dừng';
                                statusColor = 'bg-amber-500';
                            } else if (['completed', 'ended', 'closed', 'cancelled'].includes(campaign.status)) {
                                statusLabel = 'Đã kết thúc';
                                statusColor = 'bg-slate-500';
                            } else if (campaign.status === 'draft') {
                                statusLabel = 'Bản nháp';
                                statusColor = 'bg-slate-400';
                            }

                            // Back to brand blue
                            const gradientClass = 'from-blue-500 to-blue-700';
                            const brandColor = 'text-[#0065FF]';
                            const brandBg = 'bg-[#0065FF]';

                            if (viewMode === 'list') {
                                return (
                                    <Link
                                        key={campaign.id}
                                        href={`/hospital-campaign/${campaign.id}?fromTab=${activeTab}`}
                                        className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row h-auto sm:h-28"
                                    >
                                        {/* Left: Mini Image/Gradient */}
                                        <div className="w-full sm:w-2 h-1.5 sm:h-auto relative flex-shrink-0">
                                            <div className={`absolute inset-0 bg-gradient-to-r sm:bg-gradient-to-b ${gradientClass}`}></div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between min-w-0 gap-4 sm:gap-0">
                                            <div className="flex flex-col justify-center min-w-0 flex-1 sm:pr-8">
                                                <div className="flex items-center gap-3 mb-2 sm:mb-1">
                                                    <h3 className={`text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:${brandColor} transition-colors`}>
                                                        {campaign.name}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1 max-w-2xl">
                                                    {stripHtml(campaign.description)}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                                        <MapPin className="w-3 h-3" />
                                                        {campaign.location_name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                                        <Users className="w-3 h-3" />
                                                        {completed}/{registered} người tham gia
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-800">
                                                        <Droplet className="w-2.5 h-2.5" />
                                                        {getTargetBloodDisplay(campaign.target_blood_group)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Section */}
                                            <div className="w-full sm:w-64 flex flex-col justify-center gap-2">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                    <span>Tiến độ: {Math.round(progress)}%</span>
                                                    <span>Mục tiêu: {campaign.target_units} Đv</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' :
                                                            progress >= 80 ? 'bg-green-500' :
                                                                progress < 30 ? 'bg-red-500' : brandBg
                                                            }`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="hidden sm:block ml-8 pr-4">
                                                <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-800/50 ${brandColor} text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500`}>
                                                    Chi tiết →
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={campaign.id}
                                    href={`/hospital-campaign/${campaign.id}?fromTab=${activeTab}`}
                                    className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full"
                                >
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800">
                                        {(campaign.image || campaign.image_url || (campaign.description?.match(/<div data-cover="([^"]+)"/) || [])[1]) ? (
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-700" style={{ backgroundImage: `url('${campaign.image || campaign.image_url || (campaign.description?.match(/<div data-cover="([^"]+)"/) || [])[1]}')` }}>
                                                <div className="absolute inset-0 bg-black/20"></div>
                                            </div>
                                        ) : (
                                            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusColor} text-white`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-md rounded-md border border-white/30">
                                            <Droplet className="w-3 h-3 text-white" />
                                            <span className="text-[9px] font-black text-white uppercase tracking-wider">
                                                Nhóm: {getTargetBloodDisplay(campaign.target_blood_group)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col flex-1">
                                        <h3 className={`text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:${brandColor} transition-colors`}>
                                            {campaign.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                                            {stripHtml(campaign.description)}
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
                                                            progress < 30 ? 'bg-red-500' : brandBg
                                                        }`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between mt-auto">
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {completed}/{registered}
                                            </span>
                                            <div className={`flex items-center gap-1 text-[11px] font-black ${brandColor} group-hover:gap-2.5 transition-all duration-300 uppercase tracking-tight`}>
                                                Chi tiết →
                                            </div>
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
            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 max-h-[90vh] sm:max-h-none flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Cập nhật chiến dịch</h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chỉnh sửa thông tin chiến dịch của bạn</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all hover:rotate-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 md:p-8 space-y-5 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {/* Image Upload */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Ảnh bìa chiến dịch</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative size-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0">
                                            {editFormData.image ? (
                                                <img src={editFormData.image} alt="Campaign Cover" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    <LayoutGrid className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="edit-campaign-image"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="edit-campaign-image"
                                                className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
                                            >
                                                Thay đổi ảnh
                                            </label>
                                            <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Hỗ trợ PNG, JPG (Max 5MB).</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Tên chiến dịch</label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none text-slate-900 dark:text-white"
                                        placeholder="Nhập tên chiến dịch..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Ngày diễn ra</label>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <button className={cn(
                                                    "flex w-full items-center justify-between rounded-full h-11 px-5 text-sm border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 hover:border-blue-400 transition-all outline-none shadow-sm",
                                                    !editFormData.date && "text-slate-400"
                                                )}>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {editFormData.date ? format(new Date(editFormData.date), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày..."}
                                                    </span>
                                                    <CalendarDays className="text-slate-400 w-4 h-4" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800 z-[110]" align="start">
                                                <ShCalendar
                                                    mode="single"
                                                    selected={editFormData.date ? new Date(editFormData.date + 'T00:00:00') : undefined}
                                                    onSelect={(date: Date | undefined) => {
                                                        if (date) {
                                                            setEditFormData({ ...editFormData, date: format(date, 'yyyy-MM-dd') });
                                                            setIsCalendarOpen(false);
                                                        }
                                                    }}
                                                    initialFocus
                                                    locale={vi}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Thời gian tổ chức</label>
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-2xl w-fit border border-slate-100 dark:border-white/5">
                                            <TimeInput
                                                value={editFormData.start_time}
                                                onChange={(val: string) => setEditFormData({ ...editFormData, start_time: val })}
                                            />
                                            <span className="text-slate-300 font-bold opacity-30 select-none px-1">~</span>
                                            <TimeInput
                                                value={editFormData.end_time}
                                                onChange={(val: string) => setEditFormData({ ...editFormData, end_time: val })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Địa điểm</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editFormData.location_name}
                                            onChange={(e) => setEditFormData({ ...editFormData, location_name: e.target.value })}
                                            className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none text-slate-900 dark:text-white"
                                            placeholder="Địa chỉ tổ chức..."
                                        />
                                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Mô tả chiến dịch</label>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        className="w-full h-24 px-5 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none text-slate-900 dark:text-white resize-none"
                                        placeholder="Nhập nội dung giới thiệu chiến dịch..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Nhóm máu yêu cầu</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                        {BLOOD_TYPES.map(group => (
                                            <button
                                                key={group}
                                                onClick={() => toggleBloodGroup(group)}
                                                className={`h-9 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 border ${editFormData.target_blood_group.includes(group)
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {group}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Mục tiêu (Đơn vị)</label>
                                        <input
                                            type="number"
                                            value={editFormData.target_units}
                                            onChange={(e) => setEditFormData({ ...editFormData, target_units: parseInt(e.target.value) || 0 })}
                                            className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Trạng thái HĐ</label>
                                        <div className="relative">
                                            <select
                                                value={editFormData.status}
                                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                                className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm appearance-none focus:ring-4 focus:ring-blue-500/5 outline-none text-slate-900 dark:text-white"
                                            >
                                                <option value="active">Đang hoạt động</option>
                                                <option value="paused">Tạm dừng</option>
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 h-10 text-slate-400 text-xs font-bold hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleUpdateCampaign}
                                disabled={isSubmitting}
                                className="px-6 h-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-xs font-extrabold shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
