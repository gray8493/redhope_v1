"use client";

import React, { useState, useEffect } from 'react';
import MiniFooter from '@/components/shared/MiniFooter';
import {
    Droplet,
    Award,
    Users,
    Hospital,
    Activity,
    FileText,
    Search,
    Calendar
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { bloodService } from "@/services/blood.service";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function DonationsPage() {
    const { user, profile } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [dateFilter, setDateFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchDonations = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const data = await bloodService.getDonations(user.id);
                setDonations(data);
            } catch (error: any) {
                console.error("Fetch donations error:", error.message || error.details || error);
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, [user?.id]);

    const filteredDonations = donations.filter(item => {
        const hospitalName = item.hospital?.hospital_name || "";
        const matchesSearch = hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "Tất cả" || (statusFilter === "Đã xác minh" && item.verified_at);
        const matchesDate = !dateFilter || item.verified_at?.startsWith(dateFilter);
        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
    const paginatedDonations = filteredDonations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, dateFilter]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Calculate aggregated stats
    const totalUnits = donations.length;
    const totalVolume = donations.reduce((sum, d) => sum + (d.volume_ml || 0), 0) / 1000;
    const currentPoints = profile?.current_points || 0;
    const livesSaved = totalUnits * 3;

    return (
        <div className="flex h-screen w-full flex-row overflow-hidden bg-[#f8fafc] dark:bg-[#0f111a] font-sans text-[#1e1b4b] dark:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
                <TopNav title="" />
                <main className="flex-1 flex justify-center py-10">
                    <div className="max-w-[1400px] w-full px-6 md:px-12 text-left">
                        <div className="mb-10">
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                                Lịch sử hiến máu
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-3xl leading-relaxed">
                                Theo dõi những đóng góp cứu người, điểm thưởng đã đạt được và trạng thái xác minh của các lần hiến máu.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                <div className="h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng lần hiến</p>
                                    {loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUnits}</p>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                <div className="h-12 w-12 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                                    <Droplet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng lượng máu</p>
                                    {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVolume.toFixed(1)} <span className="text-sm font-medium text-slate-400 ml-1">Lít</span></p>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm đã nhận</p>
                                    {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold text-slate-900 dark:text-white">+{currentPoints.toLocaleString()}</p>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Người đã cứu</p>
                                    {loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold text-slate-900 dark:text-white">{livesSaved}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bệnh viện, địa điểm..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6324eb] w-4 h-4 pointer-events-none" />
                                    <input
                                        type="date"
                                        className="pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] outline-none text-sm font-semibold [color-scheme:light] dark:[color-scheme:dark]"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                </div>
                                <div className="relative min-w-[180px]">
                                    <select
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] outline-none text-sm font-semibold appearance-none cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="Tất cả">Tất cả trạng thái</option>
                                        <option value="Đã xác minh">Đã xác minh</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-10 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bệnh viện / Cơ sở</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Khối lượng</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={5}><Skeleton className="h-16 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : paginatedDonations.length > 0 ? (
                                        paginatedDonations.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <TableCell className="px-6 py-5">
                                                    <div className="flex flex-col whitespace-nowrap">
                                                        <span className="text-slate-900 dark:text-white font-bold">
                                                            {new Date(item.verified_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-slate-400 text-[10px] font-medium uppercase mt-0.5">
                                                            {new Date(item.verified_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-red-50 dark:bg-red-900/20 h-10 w-10 rounded-lg flex items-center justify-center text-red-600">
                                                            <Hospital className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.hospital?.hospital_name}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase">{item.hospital?.district}, {item.hospital?.city}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-5 text-center">
                                                    <span className="text-slate-900 dark:text-white font-bold text-lg">{item.volume_ml}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">ML</span>
                                                </TableCell>
                                                <TableCell className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                                                        Đã xác minh
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-5 text-right whitespace-nowrap">
                                                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg font-bold text-xs transition-colors">
                                                        <FileText className="w-4 h-4" />
                                                        Chứng nhận
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-30">
                                                    <Search className="w-12 h-12 mb-2" />
                                                    <p className="font-bold text-xl">Không tìm thấy dữ liệu</p>
                                                    <p className="text-sm">Vui lòng kiểm tra lại từ khóa hoặc bộ lọc</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center mb-16">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </main>
                <MiniFooter />
            </div>
        </div>
    );
}
