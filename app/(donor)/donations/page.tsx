"use client";
import React, { useState } from 'react';
import MiniFooter from '@/components/shared/MiniFooter';
import {
    Droplet,
    Award,
    Users,
    Hospital,
    Activity,
    ChevronLeft,
    ChevronRight,
    FileText,
    Search,
    Filter,
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

const ALL_DONATIONS = [
    {
        id: 1,
        fullDate: "2023-10-24",
        date: "24 Th10",
        year: "2023",
        time: "10:30 Sáng",
        hospital: "Bệnh viện Chợ Rẫy",
        units: "1.0",
        points: 250,
        status: "Đã xác minh",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    {
        id: 2,
        fullDate: "2023-08-12",
        date: "12 Th08",
        year: "2023",
        time: "02:15 Chiều",
        hospital: "Bệnh viện Nhân Dân 115",
        units: "0.5",
        points: 150,
        status: "Hoàn thành",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    {
        id: 3,
        fullDate: "2023-05-30",
        date: "30 Th05",
        year: "2023",
        time: "09:00 Sáng",
        hospital: "Ngân hàng Máu Trung ương",
        units: "1.0",
        points: 300,
        status: "Đã xác minh",
        icon: Activity,
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
        id: 4,
        fullDate: "2022-02-15",
        date: "15 Th02",
        year: "2022",
        time: "08:45 Sáng",
        hospital: "Bệnh viện Thống Nhất",
        units: "1.0",
        points: 250,
        status: "Đã xác minh",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    // Adding more mock data for pagination testing
    {
        id: 5,
        fullDate: "2021-12-10",
        date: "10 Th12",
        year: "2021",
        time: "07:30 Sáng",
        hospital: "Bệnh viện Bạch Mai",
        units: "1.0",
        points: 250,
        status: "Đã xác minh",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    {
        id: 6,
        fullDate: "2021-09-05",
        date: "05 Th09",
        year: "2021",
        time: "14:20 Chiều",
        hospital: "Bệnh viện Việt Đức",
        units: "0.5",
        points: 150,
        status: "Hoàn thành",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    {
        id: 7,
        fullDate: "2021-05-20",
        date: "20 Th05",
        year: "2021",
        time: "08:00 Sáng",
        hospital: "Bệnh viện K",
        units: "1.0",
        points: 300,
        status: "Đã xác minh",
        icon: Activity,
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
        id: 8,
        fullDate: "2020-11-12",
        date: "12 Th11",
        year: "2020",
        time: "09:45 Sáng",
        hospital: "Viện Huyết học",
        units: "1.0",
        points: 250,
        status: "Đã xác minh",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    {
        id: 9,
        fullDate: "2020-03-08",
        date: "08 Th03",
        year: "2020",
        time: "10:15 Sáng",
        hospital: "Bệnh viện Chợ Rẫy",
        units: "1.0",
        points: 250,
        status: "Đã xác minh",
        icon: Hospital,
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/30"
    },
    {
        id: 10,
        fullDate: "2019-12-25",
        date: "25 Th12",
        year: "2019",
        time: "08:30 Sáng",
        hospital: "Bệnh viện Nhi Đồng 1",
        units: "0.5",
        points: 150,
        status: "Hoàn thành",
        icon: Activity,
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/30"
    }
];

export default function DonationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [dateFilter, setDateFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const filteredDonations = ALL_DONATIONS.filter(item => {
        const matchesSearch = item.hospital.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "Tất cả" || item.status === statusFilter;
        const matchesDate = !dateFilter || item.fullDate === dateFilter;
        return matchesSearch && matchesStatus && matchesDate;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);

    // Get current items
    const paginatedDonations = filteredDonations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, dateFilter]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8fafc] dark:bg-[#0f111a] font-sans text-[#1e1b4b] dark:text-white">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="" />

                    <main className="flex-1 flex justify-center py-10">
                        <div className="max-w-[1400px] w-full px-6 md:px-12">
                            {/* Page Heading */}
                            <div className="mb-10">
                                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                                    Lịch sử hiến máu
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-3xl leading-relaxed">
                                    Theo dõi những đóng góp cứu người, điểm thưởng đã đạt được và trạng thái xác minh của các lần hiến máu.
                                </p>
                            </div>

                            {/* Enhanced Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng lần hiến</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                                        <Droplet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng lượng máu</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">12.5 <span className="text-sm font-medium text-slate-400 ml-1">Lít</span></p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm thưởng</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">2,450</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Người đã cứu</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">36</p>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Bar - Modern Rounded Full Style */}
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
                                            <option value="Hoàn thành">Hoàn thành</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Shadcn Table Design */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bệnh viện / Cơ sở</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Khối lượng</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Điểm</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</TableHead>
                                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedDonations.length > 0 ? (
                                            paginatedDonations.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-900 dark:text-white font-bold">{item.date}, {item.year}</span>
                                                            <span className="text-slate-400 text-[10px] font-medium uppercase mt-0.5">{item.time}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`${item.iconBg} h-10 w-10 rounded-lg flex items-center justify-center ${item.iconColor}`}>
                                                                <item.icon className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.hospital}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-center">
                                                        <span className="text-slate-900 dark:text-white font-bold text-lg">{item.units}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Đơn vị</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-center">
                                                        <span className="text-emerald-600 font-bold text-lg">+{item.points}</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${item.status === "Đã xác minh"
                                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                                            : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right">
                                                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg font-bold text-xs transition-colors">
                                                            <FileText className="w-4 h-4" />
                                                            Chứng nhận
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="px-8 py-20 text-center">
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

                            {/* Shadcn Pagination */}
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
        </div>
    );
}
