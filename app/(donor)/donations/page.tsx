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
    Calendar as CalendarIcon,
    X
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
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { bloodService } from "@/services/blood.service";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function DonationsPage() {
    const { user, profile } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [dateInput, setDateInput] = useState("");

    // Sync input with date filter
    useEffect(() => {
        if (dateFilter) {
            setDateInput(format(dateFilter, "dd/MM/yyyy"));
        } else {
            setDateInput("");
        }
    }, [dateFilter]);

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateInput(val);

        if (val.trim() === "") {
            setDateFilter(undefined);
            return;
        }

        // Try to parse dd/MM/yyyy
        const parsedDate = parse(val, "dd/MM/yyyy", new Date());
        if (isValid(parsedDate)) {
            setDateFilter(parsedDate);
        } else {
            // Keep the filter as undefined if invalid date while typing?
            // Or keep the previous filter?
            // Safer to clear filter while typing invalid date to avoid confusion
            if (val.length >= 8) { // Only clear if user typed enough
                setDateFilter(undefined);
            }
        }
    };

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

        const matchesDate = !dateFilter || (item.verified_at && new Date(item.verified_at).toDateString() === dateFilter.toDateString());
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
        <div className="flex h-full w-full flex-row overflow-hidden bg-[#f8fafc] dark:bg-[#0f111a] font-sans text-[#1e1b4b] dark:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
                <TopNav title="" />
                <main className="flex-1 py-4 md:py-10">
                    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 md:px-12 text-left">
                        <div className="mb-8 md:mb-10 text-left">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 md:mb-3">
                                Lịch sử hiến máu
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-3xl leading-relaxed">
                                Theo dõi những đóng góp cứu người, điểm thưởng đã đạt được và trạng thái xác minh của các lần hiến máu.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 text-left">
                            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-5">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                                    <Activity className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1">Tổng lần</p>
                                    {loading ? <Skeleton className="h-6 w-10 mx-auto md:mx-0" /> : <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{totalUnits}</p>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-5">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
                                    <Droplet className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1">Lượng máu</p>
                                    {loading ? <Skeleton className="h-6 w-14 mx-auto md:mx-0" /> : <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{totalVolume.toFixed(1)} <span className="text-[10px] md:text-sm font-medium text-slate-400">L</span></p>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-5">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
                                    <Award className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1">Điểm nhận</p>
                                    {loading ? <Skeleton className="h-6 w-16 mx-auto md:mx-0" /> : <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">+{currentPoints.toLocaleString()}</p>}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-5">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1">Đã cứu</p>
                                    {loading ? <Skeleton className="h-6 w-10 mx-auto md:mx-0" /> : <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{livesSaved}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-6">
                            <div className="relative flex-1 order-2 lg:order-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo bệnh viện..."
                                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] outline-none transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 md:gap-4 order-1 lg:order-2">
                                <div className="relative w-full">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="absolute left-0 top-0 bottom-0 pl-3 md:pl-4 pr-2 flex items-center group z-10 w-10 outline-none">
                                                <CalendarIcon className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition-colors" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateFilter}
                                                onSelect={setDateFilter}
                                                initialFocus
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <input
                                        type="text"
                                        placeholder="dd/MM/yyyy"
                                        className={cn(
                                            "w-full pl-9 md:pl-11 pr-8 h-[46px] md:h-[50px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] outline-none text-[13px] md:text-sm font-semibold",
                                            !dateInput && "text-slate-500 font-normal"
                                        )}
                                        value={dateInput}
                                        onChange={handleDateInputChange}
                                        maxLength={10}
                                    />
                                    {(dateFilter || dateInput) && (
                                        <button
                                            onClick={() => {
                                                setDateFilter(undefined);
                                                setDateInput("");
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-slate-100 p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors z-10"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="relative min-w-[140px]">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-[46px] md:h-[50px] px-4 text-[13px] md:text-sm font-semibold focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF]">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="Tất cả">Tất cả</SelectItem>
                                            <SelectItem value="Đã xác minh" className="font-medium text-emerald-600">Đã xác minh</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Mobile view cards / Desktop view table */}
                        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-10">
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

                        {/* Mobile Grid */}
                        <div className="md:hidden space-y-4 mb-10">
                            {loading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                            ) : paginatedDonations.length > 0 ? (
                                paginatedDonations.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-50 dark:bg-red-900/20 h-10 w-10 rounded-lg flex items-center justify-center text-red-600 shrink-0">
                                                    <Hospital className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-[13px] leading-tight">{item.hospital?.hospital_name}</h3>
                                                    <p className="text-[10px] text-slate-500 uppercase mt-0.5 font-medium">{item.hospital?.district}, {item.hospital?.city}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                                                VERIFIED
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 dark:border-slate-800/50">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Thời gian</p>
                                                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(item.verified_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Lượng máu</p>
                                                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{item.volume_ml} ML</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95">
                                                <FileText className="w-4 h-4" />
                                                Tải chứng nhận
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-30">
                                    <Search className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-bold">Không có dữ liệu</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center mb-16">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"}
                                            />
                                        </PaginationItem>

                                        {totalPages <= 5 ? (
                                            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(page)}
                                                        isActive={currentPage === page}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg transition-all",
                                                            currentPage === page
                                                                ? "bg-[#0065FF] text-white hover:bg-[#0052CC] hover:text-white border-transparent shadow-md shadow-blue-500/20"
                                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))
                                        ) : (
                                            <>
                                                <PaginationItem>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(1)}
                                                        isActive={currentPage === 1}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg transition-all",
                                                            currentPage === 1
                                                                ? "bg-[#0065FF] text-white hover:bg-[#0052CC] hover:text-white border-transparent shadow-md shadow-blue-500/20"
                                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        1
                                                    </PaginationLink>
                                                </PaginationItem>

                                                {currentPage > 3 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis className="text-slate-400" />
                                                    </PaginationItem>
                                                )}

                                                {currentPage > 2 && currentPage < totalPages - 1 && (
                                                    <PaginationItem>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(currentPage)}
                                                            isActive={true}
                                                            className="cursor-pointer rounded-lg bg-[#0065FF] text-white hover:bg-[#0052CC] hover:text-white border-transparent shadow-md shadow-blue-500/20 transition-all"
                                                        >
                                                            {currentPage}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )}

                                                {currentPage < totalPages - 2 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis className="text-slate-400" />
                                                    </PaginationItem>
                                                )}

                                                <PaginationItem>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(totalPages)}
                                                        isActive={currentPage === totalPages}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg transition-all",
                                                            currentPage === totalPages
                                                                ? "bg-[#0065FF] text-white hover:bg-[#0052CC] hover:text-white border-transparent shadow-md shadow-blue-500/20"
                                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        {totalPages}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            </>
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"}
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
