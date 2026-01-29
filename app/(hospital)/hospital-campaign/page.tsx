"use client";

import React, { useState, useEffect } from 'react';
import { HospitalSidebar } from "@/components/shared/HospitalSidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    List,
    Copy,
    History,
    Droplet,
    AlertCircle,
    Clock,
    Users,
    TrendingUp,
    CheckCircle2,
    MapPin,
    FileText
} from "lucide-react";

import { getCampaigns, subscribeToCampaignUpdates, Campaign, deleteCampaign } from "@/app/utils/campaignStorage";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const LOCATION_DATA = {
    "Nội thành Quy Nhơn": ["Trần Hưng Đạo", "Đống Đa", "Hải Cảng", "Lê Lợi", "Trần Phú", "Lê Hồng Phong", "Lý Thường Kiệt", "Nguyễn Văn Cừ", "Ngô Mây", "Ghềnh Ráng", "Quang Trung"],
    "Ngoại thành": ["Nhơn Phú", "Nhơn Bình", "Bùi Thị Xuân", "Trần Quang Diệu"],
    "Xã đảo & Bán đảo": ["Nhơn Lý", "Nhơn Hải", "Nhơn Hội", "Nhơn Châu"]
};

export default function CampaignManagementPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
    const [activeTab, setActiveTab] = useState<'active' | 'history' | 'drafts'>('active');

    // Sync activeTab with URL
    useEffect(() => {
        const tab = searchParams.get('tab') as 'active' | 'history' | 'drafts';
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'active' | 'history' | 'drafts') => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`/hospital/campaign?${params.toString()}`, { scroll: false });
    };
    const [historyTab, setHistoryTab] = useState('all');
    const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [historySearch, setHistorySearch] = useState('');
    const [historyPage, setHistoryPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Cascader State
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedWard, setSelectedWard] = useState<string | null>(null);
    const [regionFilter, setRegionFilter] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [draftPage, setDraftPage] = useState(1);
    const ACTIVE_ITEMS_PER_PAGE = 8;
    const DRAFT_ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('#cascader-container')) {
                setIsLocationOpen(false);
                setHoveredDistrict(null);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        // Initial load
        setActiveCampaigns(getCampaigns());

        // Subscribe to updates
        const unsubscribe = subscribeToCampaignUpdates(() => {
            setActiveCampaigns(getCampaigns());
        });

        return () => unsubscribe();
    }, []);

    const parseCampaignDate = (dateStr: string) => {
        try {
            if (!dateStr) return { start: 0, end: 0 };
            const parts = dateStr.includes('-') ? dateStr.split('-') : [dateStr, dateStr];
            const endStr = parts[parts.length - 1].trim();
            const startStr = parts[0].trim();

            const parse = (s: string, fallbackYear?: number) => {
                const dateParts = s.split('/');
                if (dateParts.length < 2) return 0;

                const day = Number(dateParts[0]);
                const month = Number(dateParts[1]);
                const year = dateParts.length === 3 ? Number(dateParts[2]) : (fallbackYear || new Date().getFullYear());
                return new Date(year, month - 1, day).getTime();
            };

            const end = parse(endStr);
            const start = parse(startStr, end !== 0 ? new Date(end).getFullYear() : undefined);

            return { start, end };
        } catch (e) {
            return { start: 0, end: 0 };
        }
    };



    const isCampaignExpired = (campaign: Campaign) => {
        const { end } = parseCampaignDate(campaign.date || "");
        // If end is 0 (parsing failed), assume not expired to be safe, or check other fields.
        if (end === 0) return false;

        // Check if End Date is before Today (Start of today to be strict, or just now)
        // Let's use End of Today to allow campaigns ending today to be active?
        // Usually "End Date" means inclusive. So if today is 25/10, and end is 25/10, it's active.
        // If End Date < Today (at 00:00), then it expired yesterday.

        // parseCampaignDate returns timestamp of 00:00 of the date.
        // So {end} is 00:00 of EndDate.
        // If Today is 26/10. {end} (25/10) < Today (26/10). Correct.
        // If Today is 25/10. {end} (25/10) == Today (25/10). Active.

        const now = new Date();
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        return end < todayZero;
    };

    const isCampaignToday = (campaign: Campaign) => {
        if (!campaign.date) return false;
        const { start, end } = parseCampaignDate(campaign.date);
        const now = new Date();
        const todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return todayTime >= start && todayTime <= end;
    };

    // Filter Active Campaigns (Not Ended, Not Expired, Not Draft)
    const activeList = activeCampaigns.filter(c =>
        c.operationalStatus !== "Đã kết thúc" &&
        c.operationalStatus !== "Bản nháp" &&
        !isCampaignExpired(c)
    );

    // Filter campaigns for Daily Statistics (Active or Ended Today)
    const todayList = activeCampaigns.filter(c =>
        c.operationalStatus !== "Bản nháp" &&
        isCampaignToday(c)
    );

    const filteredCampaigns = activeList.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.id.toString().includes(searchQuery);

        if (!matchesSearch) return false;

        // Location Filter (Cascader)
        if (selectedDistrict) {
            const locationLower = campaign.location.toLowerCase();
            if (selectedWard) {
                // Specific ward selected
                if (!locationLower.includes(selectedWard.toLowerCase())) return false;
            } else {
                // Only district selected - check if location contains any ward in that district
                const wards = LOCATION_DATA[selectedDistrict as keyof typeof LOCATION_DATA];
                const matchesAnyWard = wards.some(ward => locationLower.includes(ward.toLowerCase()));
                if (!matchesAnyWard) return false;
            }
        }

        // Date Filter
        if (!filterDate) return true;

        const { start: campaignStart, end: campaignEnd } = parseCampaignDate(campaign.date || "");
        const selectedTime = new Date(filterDate).getTime();

        return selectedTime >= campaignStart && selectedTime <= campaignEnd;
    });

    // Pagination for Active
    const totalActivePages = Math.ceil(filteredCampaigns.length / ACTIVE_ITEMS_PER_PAGE);
    const paginatedActive = filteredCampaigns.slice(
        (activePage - 1) * ACTIVE_ITEMS_PER_PAGE,
        activePage * ACTIVE_ITEMS_PER_PAGE
    );

    useEffect(() => {
        setActivePage(1);
    }, [searchQuery, filterDate, selectedDistrict, selectedWard]);

    // Filter History Campaigns (Ended OR Expired)
    const historyList = activeCampaigns
        .filter(c =>
            (c.operationalStatus === "Đã kết thúc" || isCampaignExpired(c)) &&
            c.operationalStatus !== "Bản nháp"
        )
        .sort((a, b) => {
            const dateA = parseCampaignDate(a.date || "").end;
            const dateB = parseCampaignDate(b.date || "").end;
            return dateB - dateA; // Sắp xếp từ mới nhất đến cũ nhất
        });

    const filteredHistory = historyList.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(historySearch.toLowerCase()) ||
            c.location.toLowerCase().includes(historySearch.toLowerCase());

        if (!matchesSearch) return false;

        // Location Filter (Cascader)
        if (selectedDistrict) {
            const locationLower = c.location.toLowerCase();
            if (selectedWard) {
                if (!locationLower.includes(selectedWard.toLowerCase())) return false;
            } else {
                const wards = LOCATION_DATA[selectedDistrict as keyof typeof LOCATION_DATA];
                const matchesAnyWard = wards.some(ward => locationLower.includes(ward.toLowerCase()));
                if (!matchesAnyWard) return false;
            }
        }
        return true;
    });

    // Pagination logic for history
    const totalHistoryPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const paginatedHistory = filteredHistory.slice(
        (historyPage - 1) * ITEMS_PER_PAGE,
        historyPage * ITEMS_PER_PAGE
    );

    // Reset page when search changes
    useEffect(() => {
        setHistoryPage(1);
    }, [historySearch]);

    // Filter Drafts
    const draftList = activeCampaigns.filter(c => c.operationalStatus === "Bản nháp");
    const filteredDrafts = draftList.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination for Drafts
    const totalDraftPages = Math.ceil(filteredDrafts.length / DRAFT_ITEMS_PER_PAGE);
    const paginatedDrafts = filteredDrafts.slice(
        (draftPage - 1) * DRAFT_ITEMS_PER_PAGE,
        draftPage * DRAFT_ITEMS_PER_PAGE
    );

    useEffect(() => {
        setDraftPage(1);
    }, [searchQuery]);

    // Helper to strip HTML tags for text previews
    const stripHtml = (html: string) => {
        if (!html) return "";
        // Remove HTML tags and replace &nbsp; with space
        return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
    };



    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .locked-overlay {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(4px);
                }
            `}</style>
            return (
            <main className="p-8 max-w-[1400px] w-full mx-auto">


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chiến dịch Bệnh viện</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Theo dõi các đợt hiến máu đang diễn ra và dữ liệu lịch sử.</p>
                    </div>
                </div>

                {/* Quick Stats Widget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-[#6324eb]"><Droplet className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tổng lượng máu</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {todayList.reduce((sum, c) => sum + (c.current || 0), 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">ml</span>
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Thu thập hôm nay</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tỉ lệ hiến máu</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {(() => {
                                        const donated = todayList.reduce((sum, c) => sum + (c.completedCount || (c.appointments?.filter(a => a.status === 'Hoàn thành').length || 0)), 0);
                                        const registered = todayList.reduce((sum, c) => sum + (c.registeredCount || (c.appointments?.length || 0)), 0);
                                        const percent = registered > 0 ? Math.round((donated / registered) * 100) : 0;
                                        return (
                                            <>
                                                {donated}/{registered}
                                                <span className={`ml-1 text-[10px] px-1 py-0.5 rounded font-bold ${percent >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {percent}%
                                                </span>
                                            </>
                                        );
                                    })()}
                                </p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Đã hiến / Đăng ký</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Clock className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Hoãn hiến hôm nay</p>
                            <p className="text-2xl font-black text-orange-600">
                                {todayList.reduce((sum, c) => sum + (c.deferredCount || (c.appointments?.filter(a => a.status === 'Đã hoãn' || a.status === 'Hoãn hiến').length || 0)), 0)}
                                <span className="text-sm font-normal text-slate-400 ml-2 text-slate-400">Người</span>
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cần hỗ trợ hồ sơ</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-indigo-50 dark:border-indigo-900/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="size-12 rounded-full bg-indigo-100 flex items-center justify-center text-[#6324eb]"><AlertCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Thiếu hụt chỉ tiêu</p>
                            <p className="text-2xl font-black text-[#6324eb]">
                                {todayList.filter(c => (c.current < c.target)).length} <span className="text-sm font-normal text-slate-400">Đợt</span>
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cần đẩy mạnh truyền thông</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-3 transition-colors">
                    <div className="relative w-full lg:flex-1 group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6324eb] transition-colors text-[20px] pointer-events-none z-10">search</span>
                        <input
                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] text-slate-900 dark:text-white placeholder-slate-500 outline-none transition-all shadow-sm"
                            placeholder="Tìm kiếm tên chiến dịch hoặc ID..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-52" id="cascader-container">
                            <button
                                onClick={() => setIsLocationOpen(!isLocationOpen)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-[#6324eb]/50 text-slate-900 dark:text-white flex items-center justify-between outline-none transition-all"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{selectedWard ? `${selectedDistrict}, ${selectedWard}` : (selectedDistrict || "Thành phố / Khu vực")}</span>
                                </div>
                                <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {isLocationOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                                    <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800/50 mb-1">Khu vực / Địa điểm</div>

                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {/* Option: All Areas */}
                                        <button
                                            onClick={() => {
                                                setSelectedDistrict(null);
                                                setSelectedWard(null);
                                                setRegionFilter('');
                                                setIsLocationOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all ${!selectedDistrict ? 'bg-indigo-50 dark:bg-indigo-900/20 text-[#6324eb]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <span>Toàn thành phố</span>
                                            {!selectedDistrict && <span className="material-symbols-outlined text-[14px]">check</span>}
                                        </button>

                                        {/* Level 1: Districts */}
                                        {Object.keys(LOCATION_DATA).map((district) => {
                                            const isExpanded = hoveredDistrict === district;
                                            return (
                                                <div key={district} className="flex flex-col">
                                                    <div
                                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${selectedDistrict === district && !selectedWard ? 'bg-indigo-50 dark:bg-indigo-900/20 text-[#6324eb]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                    >
                                                        <span
                                                            className="flex-1"
                                                            onClick={() => {
                                                                setSelectedDistrict(district);
                                                                setSelectedWard(null);
                                                                setRegionFilter(district);
                                                                setIsLocationOpen(false);
                                                            }}
                                                        >
                                                            {district}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setHoveredDistrict(isExpanded ? null : district);
                                                            }}
                                                            className={`size-6 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${isExpanded ? 'rotate-90 bg-slate-100 dark:bg-slate-800' : ''}`}
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                        </button>
                                                    </div>

                                                    {/* Level 2: Wards (Accordion Content) */}
                                                    {isExpanded && (
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 border-y border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-1 duration-200">
                                                            {LOCATION_DATA[district as keyof typeof LOCATION_DATA].map((ward) => (
                                                                <button
                                                                    key={ward}
                                                                    onClick={() => {
                                                                        setSelectedDistrict(district);
                                                                        setSelectedWard(ward);
                                                                        setRegionFilter(`${district}, ${ward}`);
                                                                        setIsLocationOpen(false);
                                                                    }}
                                                                    className={`w-full flex items-center justify-between pl-8 pr-4 py-2 text-[11px] font-bold transition-all ${selectedWard === ward && selectedDistrict === district ? 'text-[#6324eb] bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'}`}
                                                                >
                                                                    <span>{ward}</span>
                                                                    {selectedWard === ward && selectedDistrict === district && (
                                                                        <span className="material-symbols-outlined text-[12px]">check</span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative w-full sm:w-36">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">calendar_month</span>
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-[#6324eb]/50 text-slate-900 dark:text-white outline-none transition-all placeholder-slate-500"
                                type="text"
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                placeholder="Chọn ngày"
                            />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Lọc
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <button
                        onClick={() => handleTabChange('active')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'active' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        Đang hoạt động
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">{activeList.length}</span>
                        {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                    </button>
                    <button
                        onClick={() => handleTabChange('history')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'history' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">history</span>
                        Lịch sử
                        {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                    </button>
                    <button
                        onClick={() => handleTabChange('drafts')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'drafts' ? 'text-[#6324eb]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        Bản nháp
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">{filteredDrafts.length}</span>
                        {activeTab === 'drafts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6324eb] rounded-t-full"></span>}
                    </button>
                </div>

                {/* Active Campaigns Content */}
                {activeTab === 'active' && (
                    <>
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
                                    onClick={() => setViewMode('timeline')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-slate-100 dark:bg-slate-800 text-[#6324eb]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Campaign Views */}
                        {filteredCampaigns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 mb-8 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Hiện tại chưa có chiến dịch nào hoạt động.</h3>

                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {paginatedActive.map(campaign => (
                                    <div key={campaign.id} className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg h-full ${campaign.isUrgent ? 'ring-2 ring-red-500/50 animate-pulse-border' : ''}`}>
                                        <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                            <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: `url('${campaign.image}')` }}></div>
                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${campaign.statusClass}`}>
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            {campaign.isUrgent && (
                                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-red-600/80 to-transparent p-3 pt-8">
                                                    <span className="flex items-center gap-1 text-white text-xs font-bold animate-pulse">
                                                        <span className="material-symbols-outlined text-[16px]">warning</span> Khẩn cấp
                                                    </span>
                                                </div>
                                            )}
                                            {/* Status Badge (Operational) */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${campaign.operationalStatus === 'Tạm dừng' ? 'bg-slate-600 text-white' : 'bg-white/90 text-slate-700'} border border-slate-200`}>
                                                    {campaign.operationalStatus || 'Đang hoạt động'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            {/* Time Badge moved here */}

                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate flex-1 pr-2" title={campaign.name}>{campaign.name}</h3>
                                                <div className={`flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black border uppercase ${campaign.bloodClass.replace('bg-', 'border-').replace('text-', 'text-')}`}>
                                                    {campaign.bloodType === 'Tất cả' ? <Droplet className="w-3 h-3 fill-current" /> : (
                                                        <span className="flex items-center gap-0.5">
                                                            <Droplet className="w-3 h-3 fill-current" /> {campaign.bloodType}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-2 leading-relaxed">{stripHtml(campaign.desc)}</p>

                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                {campaign.location}
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                    <span>Đã thu: {campaign.progress}%</span>
                                                    <span>Mục tiêu: {campaign.target}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${campaign.progress >= 100 ? 'bg-emerald-500' : campaign.progress >= 80 ? 'bg-green-500' : campaign.progress < 30 ? 'bg-red-500' : 'bg-[#6324eb]'}`} style={{ width: `${campaign.progress}%` }}></div>
                                                </div>
                                            </div>

                                            {/* Time Badge moved here */}
                                            <div className="mb-4 flex items-start">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 w-full justify-center">
                                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                    {campaign.startTime && campaign.endTime ? `${campaign.startTime} - ${campaign.endTime} • ` : ''}{campaign.date}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {campaign.timeLeft}
                                                </span>
                                                <Link className="text-[11px] font-bold text-[#6324eb] hover:text-[#6324eb]/80 transition-colors uppercase tracking-tight flex items-center gap-1" href={`/hospital/campaign/${campaign.id}?fromTab=${activeTab}`}>
                                                    Chi tiết <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Timeline View */
                            <div className="flex flex-col gap-4 mb-12 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                                {filteredCampaigns.map((campaign, idx) => (
                                    <div key={campaign.id} className="relative bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                                        {/* Timeline Dot */}
                                        <span className={`absolute -left-[31px] top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-white dark:border-slate-900 ${idx === 0 ? 'bg-green-500' : 'bg-slate-300'}`}></span>

                                        <div className="size-16 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${campaign.image}')` }}></div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${campaign.statusClass} bg-opacity-10 text-${campaign.statusClass.split(' ')[0].replace('bg-', '')}-600`}>
                                                    {campaign.status}
                                                </span>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{campaign.name}</h3>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{stripHtml(campaign.desc)}</p>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0">
                                            <div className="flex flex-col items-center min-w-[60px]">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Nhóm máu</span>
                                                <span className={`text-sm font-black ${campaign.bloodClass.split(' ')[0]}`}>{campaign.bloodType}</span>
                                            </div>
                                            <div className="flex flex-col justify-center w-32">
                                                <div className="flex justify-between text-[10px] mb-1 font-medium">
                                                    <span>{campaign.current.toLocaleString()}/{campaign.target.toLocaleString()} ml</span>
                                                    <span>{campaign.progress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${campaign.progress}%` }}></div>
                                                </div>
                                            </div>
                                            <Link className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-[#6324eb] transition-colors" href={`/hospital/campaign/${campaign.id}?fromTab=${activeTab}`}>
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination for Active */}
                        {totalActivePages > 1 && (
                            <div className="mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                                                className={activePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalActivePages }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={activePage === i + 1}
                                                    onClick={() => setActivePage(i + 1)}
                                                    className="cursor-pointer"
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setActivePage(p => Math.min(totalActivePages, p + 1))}
                                                className={activePage === totalActivePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}

                {/* Drafts Content */}
                {activeTab === 'drafts' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {filteredDrafts.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">post_add</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Chưa có bản nháp nào</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                    Các bản nháp bạn lưu sẽ xuất hiện ở đây.
                                </p>
                            </div>
                        ) : (
                            paginatedDrafts.map(campaign => (
                                <div key={campaign.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg h-full">
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden grayscale opacity-90 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${campaign.image || 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000'}')` }}></div>
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm bg-slate-100/90 text-slate-600 border border-slate-200 backdrop-blur-sm">
                                                Bản nháp
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Bạn có chắc chắn muốn xóa bản nháp này không?')) {
                                                    deleteCampaign(campaign.id);
                                                }
                                            }}
                                            className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg backdrop-blur-md transition-all shadow-sm z-10"
                                            title="Xóa bản nháp"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate pr-2" title={campaign.name}>{campaign.name}</h3>
                                        </div>

                                        <div className="space-y-2 mb-4 flex-1">
                                            <div className="flex items-center text-xs">
                                                <span className="w-28 text-slate-500 font-medium">Mục tiêu:</span>
                                                <span className={`font-bold ${campaign.target ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                                                    {campaign.target ? `${campaign.target} đơn vị` : 'Chưa rõ'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs">
                                                <span className="w-28 text-slate-500 font-medium">Thời gian bắt đầu:</span>
                                                <span className={`font-bold ${campaign.startTime ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                                                    {campaign.startTime || 'Chưa rõ'}
                                                </span>
                                            </div>
                                            <div className="flex items-start text-xs">
                                                <span className="w-28 text-slate-500 font-medium shrink-0">Địa điểm:</span>
                                                <span className={`font-bold line-clamp-2 leading-relaxed ${campaign.location ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                                                    {campaign.location || 'Chưa rõ'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <Link href={`/hospital/requests/create?id=${campaign.id}`} className="w-full py-2.5 bg-slate-50 text-[#6324eb] hover:bg-[#6324eb] hover:text-white border border-slate-200 hover:border-[#6324eb] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-md">
                                                <span className="material-symbols-outlined text-[16px]">edit_square</span>
                                                Tiếp tục chỉnh sửa
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination for Drafts */}
                        {totalDraftPages > 1 && (
                            <div className="col-span-full mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setDraftPage(p => Math.max(1, p - 1))}
                                                className={draftPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalDraftPages }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={draftPage === i + 1}
                                                    onClick={() => setDraftPage(i + 1)}
                                                    className="cursor-pointer"
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setDraftPage(p => Math.min(totalDraftPages, p + 1))}
                                                className={draftPage === totalDraftPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                )}

                {/* Campaign History */}
                {activeTab === 'history' && (
                    <>
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử Chiến dịch</h2>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#6324eb]/50 text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400"
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        placeholder="Tìm kiếm lịch sử..."
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên chiến dịch</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Địa điểm</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Đạt mục tiêu</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Tổng đơn vị</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Đánh giá</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {paginatedHistory.length > 0 ? paginatedHistory.map(campaign => {
                                            const diff = (campaign.current || 0) - campaign.target;
                                            const evalText = diff >= 0 ? (diff === 0 ? "Đủ" : `Dư ${diff.toLocaleString()}`) : `Thiếu ${Math.abs(diff).toLocaleString()}`;
                                            const evalColor = diff >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50";

                                            return (
                                                <tr key={campaign.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{campaign.name}</div>
                                                        <div className="text-[11px] text-slate-500">{stripHtml(campaign.desc)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{campaign.date}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{campaign.location}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                                                <div className={`h-full rounded-full ${campaign.progress >= 100 ? 'bg-green-500' : 'bg-[#6324eb]'}`} style={{ width: `${Math.min(campaign.progress, 100)}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{campaign.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-center">{campaign.current?.toLocaleString()} ml</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${evalColor}`}>
                                                            {evalText}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link className="text-[#6324eb] text-sm font-bold hover:underline" href={`/hospital/campaign/${campaign.id}?fromTab=${activeTab}`}>Xem</Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                                    Không có lịch sử chiến dịch nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                {totalHistoryPages > 1 && (
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                                    className={historyPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: totalHistoryPages }).map((_, i) => (
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        isActive={historyPage === i + 1}
                                                        onClick={() => setHistoryPage(i + 1)}
                                                        className="cursor-pointer"
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                                                    className={historyPage === totalHistoryPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>
                        </div>
                    </>
                )}
                <MiniFooter />
            </main>
        </>
    );
}
