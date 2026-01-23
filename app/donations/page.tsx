"use client";
import React, { useState } from 'react';
import MiniFooter from '@/components/MiniFooter';
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
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

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
    }
];

export default function DonationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [dateFilter, setDateFilter] = useState("");

    const filteredDonations = ALL_DONATIONS.filter(item => {
        const matchesSearch = item.hospital.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "Tất cả" || item.status === statusFilter;
        const matchesDate = !dateFilter || item.fullDate === dateFilter;
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1024px] flex-1 px-4 md:px-10">
                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Lịch sử hiến máu</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Theo dõi những đóng góp cứu người, điểm thưởng đã đạt được và trạng thái xác minh của các lần hiến máu trước đây.
                                    </p>
                                </div>

                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white dark:bg-[#1c162e] p-5 rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-xs font-semibold uppercase tracking-wider mb-1">Tổng lần hiến</p>
                                    <p className="text-2xl font-black text-[#6324eb]">12</p>
                                </div>
                                <div className="bg-white dark:bg-[#1c162e] p-5 rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-xs font-semibold uppercase tracking-wider mb-1">Tổng lượng máu</p>
                                    <p className="text-2xl font-black text-[#6324eb]">12.5 <span className="text-sm font-normal text-[#654d99]">Lít</span></p>
                                </div>
                                <div className="bg-white dark:bg-[#1c162e] p-5 rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-xs font-semibold uppercase tracking-wider mb-1">Điểm thưởng</p>
                                    <p className="text-2xl font-black text-[#10b981]">2,450</p>
                                </div>
                                <div className="bg-white dark:bg-[#1c162e] p-5 rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-xs font-semibold uppercase tracking-wider mb-1">Người đã cứu</p>
                                    <p className="text-2xl font-black text-[#6324eb]">36</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo bệnh viện, địa điểm..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d7d0e7] dark:border-[#2d263d] bg-white dark:bg-[#1c162e] text-[#120e1b] dark:text-white focus:ring-2 focus:ring-[#6324eb] outline-none transition-all placeholder:text-[#654d99]/50"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6324eb] w-5 h-5 pointer-events-none" />
                                        <input
                                            type="date"
                                            className="pl-10 pr-10 py-3 bg-white dark:bg-[#1c162e] border border-[#d7d0e7] dark:border-[#2d263d] text-[#120e1b] dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-[#251e36] transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#6324eb] [color-scheme:light] dark:[color-scheme:dark]"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                        />
                                        {dateFilter && (
                                            <button
                                                onClick={() => setDateFilter("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </div>

                                    <select
                                        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#1c162e] border border-[#d7d0e7] dark:border-[#2d263d] text-[#120e1b] dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-[#251e36] transition-colors appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-[#6324eb]"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="Tất cả">Trạng thái</option>
                                        <option value="Đã xác minh">Đã xác minh</option>
                                        <option value="Hoàn thành">Hoàn thành</option>
                                    </select>
                                </div>
                            </div>

                            {/* History Table */}
                            <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f8f7fb] dark:bg-[#251e38] border-b border-[#ebe7f3] dark:border-[#2d263d]">
                                                <th className="px-6 py-4 text-[#654d99] dark:text-[#a594c9] text-xs font-bold uppercase tracking-wider">Ngày</th>
                                                <th className="px-6 py-4 text-[#654d99] dark:text-[#a594c9] text-xs font-bold uppercase tracking-wider">Bệnh viện / Cơ sở</th>
                                                <th className="px-6 py-4 text-[#654d99] dark:text-[#a594c9] text-xs font-bold uppercase tracking-wider text-center">Đơn vị</th>
                                                <th className="px-6 py-4 text-[#654d99] dark:text-[#a594c9] text-xs font-bold uppercase tracking-wider text-center">Điểm</th>
                                                <th className="px-6 py-4 text-[#654d99] dark:text-[#a594c9] text-xs font-bold uppercase tracking-wider">Trạng thái</th>
                                                <th className="px-6 py-4 text-[#654d99] dark:text-[#a594c9] text-xs font-bold uppercase tracking-wider text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#ebe7f3] dark:divide-[#2d263d]">
                                            {filteredDonations.length > 0 ? (
                                                filteredDonations.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#241c38] transition-colors">
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span className="text-[#120e1b] dark:text-white font-bold">{item.date}, {item.year}</span>
                                                                <span className="text-[#654d99] dark:text-[#a594c9] text-xs">{item.time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`${item.iconBg} p-2 rounded-lg ${item.iconColor}`}>
                                                                    <item.icon className="w-5 h-5" />
                                                                </div>
                                                                <span className="text-[#120e1b] dark:text-white font-medium">{item.hospital}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-center text-[#120e1b] dark:text-white font-semibold">{item.units} Đơn vị</td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-center font-bold text-[#10b981]">+{item.points}</td>
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.status === "Đã xác minh"
                                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                                }`}>
                                                                <span className={`size-1.5 rounded-full ${item.status === "Đã xác minh" ? "bg-green-600 dark:bg-green-400" : "bg-blue-600 dark:bg-blue-400"
                                                                    }`}></span>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                                            <button className="text-[#6324eb] hover:text-[#6324eb]/80 font-bold text-sm flex items-center gap-1 ml-auto">
                                                                <FileText className="w-4 h-4" /> Chứng nhận
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-10 text-center text-[#654d99] dark:text-[#a594c9]">
                                                        Không tìm thấy dữ liệu phù hợp.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="mt-12 flex justify-center mb-10">
                                <nav className="flex items-center gap-2">
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#6324eb] text-white font-bold">1</button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors text-[#120e1b] dark:text-white">2</button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors text-[#120e1b] dark:text-white">3</button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>
        </div>
    );
}
