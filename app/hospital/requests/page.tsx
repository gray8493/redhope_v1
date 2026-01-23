"use client";

import { useState } from "react";
import {
    ChevronDown,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit2,
    Trash2,
    MoreVertical,
    ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

// Type Definition
interface BloodRequest {
    id: string;
    patientCode: string;
    bloodType: string;
    quantity: number;
    urgency: string;
    urgencyClass: string;
    progress: number;
    status: "pending" | "active" | "completed" | "cancelled";
    createdDate: string;
    hospitalName: string;
}

// Mock Data - Extended list
const REQUESTS_DATA: BloodRequest[] = [
    {
        id: "1",
        patientCode: "P-9821",
        bloodType: "O Positive (O+)",
        quantity: 2,
        urgency: "Nguy kịch",
        urgencyClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        progress: 80,
        status: "active",
        createdDate: "2026-01-23",
        hospitalName: "Bệnh viện Chợ Rẫy"
    },
    {
        id: "2",
        patientCode: "P-9844",
        bloodType: "AB Negative (AB-)",
        quantity: 1,
        urgency: "Cao",
        urgencyClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        progress: 25,
        status: "active",
        createdDate: "2026-01-22",
        hospitalName: "Bệnh viện Ung Bướu"
    },
    {
        id: "3",
        patientCode: "P-9850",
        bloodType: "B Positive (B+)",
        quantity: 4,
        urgency: "Trung bình",
        urgencyClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        progress: 50,
        status: "active",
        createdDate: "2026-01-21",
        hospitalName: "Bệnh viện Quận 7"
    },
    {
        id: "4",
        patientCode: "P-9851",
        bloodType: "A Negative (A-)",
        quantity: 3,
        urgency: "Nguy kịch",
        urgencyClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        progress: 60,
        status: "active",
        createdDate: "2026-01-20",
        hospitalName: "Bệnh viện 115"
    },
    {
        id: "5",
        patientCode: "P-9852",
        bloodType: "O Negative (O-)",
        quantity: 5,
        urgency: "Nguy kịch",
        urgencyClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        progress: 40,
        status: "active",
        createdDate: "2026-01-19",
        hospitalName: "Bệnh viện Nhi Đồng"
    },
    {
        id: "6",
        patientCode: "P-9853",
        bloodType: "AB Positive (AB+)",
        quantity: 2,
        urgency: "Cao",
        urgencyClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        progress: 70,
        status: "active",
        createdDate: "2026-01-18",
        hospitalName: "Bệnh viện Quân Y 103"
    },
    {
        id: "7",
        patientCode: "P-9854",
        bloodType: "B Negative (B-)",
        quantity: 6,
        urgency: "Cao",
        urgencyClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        progress: 35,
        status: "pending",
        createdDate: "2026-01-17",
        hospitalName: "Bệnh viện Gia Định"
    },
    {
        id: "8",
        patientCode: "P-9855",
        bloodType: "A Positive (A+)",
        quantity: 4,
        urgency: "Trung bình",
        urgencyClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        progress: 55,
        status: "completed",
        createdDate: "2026-01-16",
        hospitalName: "Bệnh viện Từ Dũ"
    },
    {
        id: "9",
        patientCode: "P-9856",
        bloodType: "O Positive (O+)",
        quantity: 3,
        urgency: "Trung bình",
        urgencyClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        progress: 45,
        status: "active",
        createdDate: "2026-01-15",
        hospitalName: "Bệnh viện Thống Nhất"
    }
];

export default function HospitalRequestsPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const itemsPerPage = 10;

    // Filter logic
    const filteredData = REQUESTS_DATA.filter(item => {
        if (activeFilter === "Tất cả") return true;
        if (activeFilter === "Nguy kịch") return item.urgency === "Nguy kịch";
        if (activeFilter === "Cao") return item.urgency === "Cao";
        if (activeFilter === "Trung bình") return item.urgency === "Trung bình";
        return true;
    });

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const paginatedData = filteredData.length === 0 ? [] : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <HospitalSidebar />
                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Quản lý Yêu cầu Máu" />
                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1400px] flex-1 px-4 md:px-10">
                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Yêu cầu Máu</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Tất cả các yêu cầu máu từ bệnh viện. Quản lý và theo dõi tiến độ của từng yêu cầu.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/hospital")}
                                    className="flex items-center gap-2 px-6 h-12 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-lg text-[#120e1b] dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Quay về</span>
                                </button>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => handleFilterChange("Tất cả")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "Tất cả" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">Tất cả</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange("Nguy kịch")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "Nguy kịch" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">Nguy kịch</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange("Cao")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "Cao" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">Cao</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange("Trung bình")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "Trung bình" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">Trung bình</span>
                                </button>
                                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#ebe7f3] dark:bg-[#2d263d] px-4 text-[#120e1b] dark:text-white hover:bg-[#dcd6e8] transition-colors">
                                    <span className="text-sm font-medium">Bộ lọc khác</span>
                                    <SlidersHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-2xl overflow-hidden shadow-sm mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-[#251e36] text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-[#ebe7f3] dark:border-[#2d263d]">
                                            <tr>
                                                <th className="px-6 py-4">Mã Bệnh nhân</th>
                                                <th className="px-6 py-4">Nhóm máu</th>
                                                <th className="px-6 py-4">Số lượng</th>
                                                <th className="px-6 py-4">Khẩn cấp</th>
                                                <th className="px-6 py-4">Tiến độ</th>
                                                <th className="px-6 py-4">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#ebe7f3] dark:divide-[#2d263d]">
                                            {paginatedData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 font-medium">
                                                        Không tìm thấy yêu cầu máu nào phù hợp với bộ lọc này.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedData.map((request) => (
                                                    <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors">
                                                        <td className="px-6 py-5 text-sm font-bold text-[#120e1b] dark:text-white">{request.patientCode}</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-[#251e36] text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">{request.bloodType}</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{request.quantity} Đơn vị</td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2.5 py-1 ${request.urgencyClass} rounded-md text-[10px] font-bold uppercase tracking-wide`}>
                                                                {request.urgency}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 bg-slate-200 dark:bg-[#2d263d] rounded-full h-2">
                                                                    <div
                                                                        className="bg-[#6324eb] h-2 rounded-full transition-all"
                                                                        style={{ width: `${request.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-8">{request.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#251e36] rounded-lg transition-colors text-slate-500 hover:text-[#6324eb]">
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#251e36] rounded-lg transition-colors text-slate-500 hover:text-[#6324eb]">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#251e36] rounded-lg transition-colors text-slate-500 hover:text-red-500">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="mt-8 flex justify-between items-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Hiển thị {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filteredData.length)} của {filteredData.length} yêu cầu
                                </p>
                                <nav className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`h-10 w-10 flex items-center justify-center rounded-lg font-bold transition-all ${currentPage === i + 1
                                                ? "bg-[#6324eb] text-white shadow-lg shadow-[#6324eb]/30"
                                                : "border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors disabled:opacity-50"
                                    >
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
