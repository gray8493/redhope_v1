"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ChevronDown,
    SlidersHorizontal,
    Lock,
    Clock,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    MapPin,
    Phone,
    X,
    Building2,
    Calendar,
    AlertCircle
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

// Type Definition
interface BloodRequest {
    id: number;
    bloodType: string;
    urgency: string;
    urgencyClass: string; // Tailwind class for badge
    urgencyColor: string; // 'red', 'amber', 'emerald'
    distance: string;
    timeLeft: string;
    description: string;
    hospitalName: string;
    address: string;
    image: string;
    unitsNeeded: number;
    patientCondition: string;
}

// Mock Data
const REQUESTS_DATA: BloodRequest[] = [
    {
        id: 1,
        bloodType: "O Positive (O+)",
        urgency: "Cần gấp",
        urgencyClass: "bg-red-500",
        urgencyColor: "red",
        distance: "2.4 Km",
        timeLeft: "Hết hạn trong 4h",
        description: "Yêu cầu từ trung tâm chấn thương cấp độ 1 cho kho dự trữ phẫu thuật khẩn cấp.",
        hospitalName: "Bệnh viện Chợ Rẫy",
        address: "201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
        unitsNeeded: 5,
        patientCondition: "Tai nạn giao thông nghiêm trọng, cần phẫu thuật khẩn cấp.",
    },
    {
        id: 2,
        bloodType: "B Negative (B-)",
        urgency: "Kho thấp",
        urgencyClass: "bg-amber-500",
        urgencyColor: "amber",
        distance: "4.1 Km",
        timeLeft: "Hết hạn trong 12h",
        description: "Ngân hàng máu khu vực tìm kiếm người hiến nhóm máu hiếm cho điều trị ung thư.",
        hospitalName: "Bệnh viện Ung Bướu",
        address: "47 Nguyễn Huy Lượng, Phường 14, Bình Thạnh, TP.HCM",
        image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=600",
        unitsNeeded: 3,
        patientCondition: "Điều trị hóa trị liệu, thiếu máu mãn tính.",
    },
    {
        id: 3,
        bloodType: "A Positive (A+)",
        urgency: "Định kỳ",
        urgencyClass: "bg-emerald-500",
        urgencyColor: "emerald",
        distance: "1.2 Km",
        timeLeft: "Hết hạn trong 2 ngày",
        description: "Phòng khám sức khỏe tổng quát duy trì nguồn cung cấp máu cho các thủ tục ngoại trú.",
        hospitalName: "Bệnh viện Quận 7",
        address: "101 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM",
        image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=600",
        unitsNeeded: 10,
        patientCondition: "Dự trữ cho các ca phẫu thuật định kỳ trong tuần.",
    },
    {
        id: 4,
        bloodType: "O Negative (O-)",
        urgency: "Cần gấp",
        urgencyClass: "bg-red-500",
        urgencyColor: "red",
        distance: "0.5 Km",
        timeLeft: "Hết hạn trong 1h",
        description: "Bệnh nhân cấp cứu cần nhóm máu hiếm O Negative ngay lập tức.",
        hospitalName: "Bệnh viện Việt Đức",
        address: "40 Tràng Thi, Hoàn Kiếm, Hà Nội",
        image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=600",
        unitsNeeded: 2,
        patientCondition: "Mất máu cấp do chấn thương bụng.",
    }
];

export default function RequestsPage() {
    const router = useRouter();
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    // Filter logic
    const filteredData = REQUESTS_DATA.filter(item => {
        if (activeFilter === "Tất cả") return true;
        if (activeFilter === "O-Negative") return item.bloodType.toLowerCase().includes("o negative") || item.bloodType.includes("(O-)") || item.bloodType.includes("O-");
        if (activeFilter === "Khẩn cấp") return item.urgency === "Cần gấp";
        return true;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setCurrentPage(1); // Reset to first page on filter change
    };

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
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Yêu cầu hiến máu</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Nhu cầu khẩn cấp từ các cơ sở y tế trong khu vực của bạn. Cần sàng lọc an toàn để xem chi tiết vị trí bệnh viện.
                                    </p>
                                </div>

                            </div>

                            {/* Eligibility Action Panel */}


                            {/* Filter Chips */}
                            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => handleFilterChange("Tất cả")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "Tất cả" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">Tất cả nhóm máu</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange("O-Negative")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "O-Negative" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">O-Negative</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleFilterChange("Khẩn cấp")}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${activeFilter === "Khẩn cấp" ? "bg-[#6324eb] text-white shadow-md shadow-[#6324eb]/20" : "bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white"
                                        }`}
                                >
                                    <span className="text-sm font-medium">Khẩn cấp cao</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#ebe7f3] dark:bg-[#2d263d] px-4 text-[#120e1b] dark:text-white hover:bg-[#dcd6e8] transition-colors">
                                    <span className="text-sm font-medium">Khoảng cách &lt; 10 km</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedData.map((request) => (
                                    <div
                                        key={request.id}
                                        onClick={() => setSelectedRequest(request)}
                                        className="flex flex-col bg-white dark:bg-[#1c162e] rounded-xl overflow-hidden shadow-sm border border-[#ebe7f3] dark:border-[#2d263d] hover:shadow-md transition-shadow group cursor-pointer"
                                    >
                                        <div
                                            className="h-40 bg-center bg-no-repeat bg-cover relative"
                                            style={{ backgroundImage: `linear-gradient(rgba(99, 36, 235, 0.1), rgba(99, 36, 235, 0.2)), url("${request.image}")` }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/90 dark:bg-[#1c162e]/90 p-2 rounded-lg shadow-xl flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-[#6324eb]" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-[#6324eb]">Click để xem chi tiết</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className={`px-3 py-1 ${request.urgencyClass} text-white text-[10px] font-bold uppercase rounded-full`}>{request.urgency}</span>
                                                <span className="px-3 py-1 bg-white/90 dark:bg-black/80 text-[#120e1b] dark:text-white text-[10px] font-bold rounded-full">{request.distance}</span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">{request.bloodType}</h3>
                                                <div className="text-[#6324eb] bg-[#6324eb]/10 px-2 py-1 rounded text-xs font-bold">{request.distance}</div>
                                            </div>
                                            <p className="text-[#654d99] dark:text-[#a594c9] text-sm font-normal mb-4 line-clamp-2">
                                                {request.description}
                                            </p>
                                            <div className="pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d] flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-[#654d99] dark:text-[#a594c9]">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{request.timeLeft}</span>
                                                </div>
                                                <button className="text-[#6324eb] text-sm font-bold hover:underline">Chi tiết</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center">
                                    <nav className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] hover:bg-[#ebe7f3] dark:hover:bg-[#2d263d] transition-colors disabled:opacity-50"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedRequest(null)}
                    ></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#1c162e] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header Image */}
                        <div
                            className="h-48 bg-cover bg-center relative"
                            style={{ backgroundImage: `url("${selectedRequest.image}")` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-6 text-white">
                                <p className="text-sm font-medium opacity-90 mb-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> {selectedRequest.hospitalName}
                                </p>
                                <h2 className="text-3xl font-black">{selectedRequest.bloodType}</h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-2 rounded-lg ${selectedRequest.urgencyClass}/10 text-${selectedRequest.urgencyColor}-500 font-bold flex flex-col items-center`}>
                                    <AlertCircle className="w-6 h-6 mb-1" />
                                    <span className="text-xs uppercase">{selectedRequest.urgency}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[#120e1b] dark:text-white text-lg">Chi tiết tình trạng</h3>
                                    <p className="text-sm text-[#654d99] dark:text-[#a594c9]">{selectedRequest.patientCondition}</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-[#ebe7f3] dark:border-[#2d263d] pt-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-[#6324eb] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-[#120e1b] dark:text-white">Địa chỉ tiếp nhận</p>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9]">{selectedRequest.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-[#6324eb] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-[#120e1b] dark:text-white">Thời hạn</p>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9]">{selectedRequest.timeLeft}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#6324eb] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-[#120e1b] dark:text-white">Số lượng cần thiết</p>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9]">{selectedRequest.unitsNeeded} đơn vị máu</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => router.push("/screening")}
                                    className="flex-1 py-3 bg-[#6324eb] text-white font-bold rounded-xl hover:bg-[#501ac2] shadow-lg shadow-[#6324eb]/20 transition-all active:scale-[0.98]"
                                >
                                    Đăng ký hiến máu
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
