"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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
    const { user } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);

    // Sử dụng is_verified thực tế từ Profile
    const isVerified = user?.profile?.is_verified === true;

    const itemsPerPage = 6; // Increased from 2 to show more in demo

    useEffect(() => {
        // Có thể thêm logic thông báo tại đây nếu cần
    }, [isVerified]);

    // Filter logic
    const filteredData = REQUESTS_DATA.filter(item => {
        if (activeFilter === "Tất cả") return true;
        if (activeFilter === "O-Negative") return item.bloodType.toLowerCase().includes("o-") || item.bloodType.includes("(O-)") || item.bloodType.toLowerCase().includes("o negative");
        if (activeFilter === "Khẩn cấp") return item.urgency === "Cần gấp";
        if (activeFilter === "Gần tôi") {
            const distance = parseFloat(item.distance.replace(" Km", ""));
            return distance < 10;
        }
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
                    <TopNav title="Yêu cầu hiến máu" />
                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1024px] flex-1 px-4 md:px-10">
                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Yêu cầu hiến máu</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Nhu cầu khẩn cấp từ các cơ sở y tế trong khu vực của bạn. {isVerified ? 'Cảm ơn bạn đã hoàn thành sàng lọc sức khỏe.' : 'Cần sàng lọc an toàn để xem chi tiết vị trí bệnh viện.'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isVerified ? (
                                        <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-600 px-5 py-3 rounded-xl border border-emerald-500/20">
                                            <ShieldCheck className="w-5 h-5" />
                                            <span className="text-sm font-black uppercase tracking-wider">Đã xác minh</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => router.push("/complete-profile/verification")}
                                            className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-8 bg-[#6324eb] text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-xl shadow-[#6324eb]/25 hover:bg-[#501ac2] hover:-translate-y-0.5 transition-all">
                                            <span className="truncate">Xác minh ngay</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                                {["Tất cả", "O-Negative", "Khẩn cấp", "Gần tôi"].map(f => (
                                    <Button
                                        key={f}
                                        onClick={() => handleFilterChange(f)}
                                        variant={activeFilter === f ? "default" : "outline"}
                                        className={`rounded-xl h-11 font-bold ${activeFilter === f ? "bg-[#6324eb] hover:bg-[#501ac2]" : "bg-white dark:bg-[#1c162e] border-slate-200 dark:border-slate-800"}`}
                                    >
                                        {f === "Tất cả" ? "Tất cả nhóm máu" : f === "Gần tôi" ? "Trong bán kính 10km" : f}
                                    </Button>
                                ))}
                                <Button variant="outline" className="h-11 gap-2 rounded-xl bg-white dark:bg-[#1c162e] border-slate-200 dark:border-slate-800">
                                    <span className="text-sm font-bold">Lọc thêm</span>
                                    <SlidersHorizontal className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Grid of Requests */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                                {(paginatedData ?? []).map((request) => (
                                    <Card
                                        key={request.id}
                                        onClick={() => setSelectedRequest(request)}
                                        className="flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group bg-white dark:bg-[#1c162e] border-[#ebe7f3] dark:border-[#2d263d]"
                                    >
                                        <div
                                            className="h-56 bg-center bg-no-repeat bg-cover relative"
                                            style={{ backgroundImage: `url("${request.image}")` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                            {!isVerified && (
                                                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                                    <div className="bg-white/90 dark:bg-[#1c162e]/90 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3 transform group-hover:scale-105 transition-transform">
                                                        <div className="size-12 rounded-full bg-[#6324eb]/10 flex items-center justify-center text-[#6324eb]">
                                                            <Lock className="w-6 h-6" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6324eb] mb-0.5">Vị trí bị khóa</p>
                                                            <p className="text-[10px] font-bold text-slate-500">Cần sàng lọc AI để xem</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className={`px-3 py-1.5 ${request.urgencyClass} text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg`}>{request.urgency}</span>
                                                <span className="px-3 py-1.5 bg-white/95 dark:bg-black/80 text-[#120e1b] dark:text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">{request.distance}</span>
                                            </div>

                                            {isVerified && (
                                                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white drop-shadow-lg">
                                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-sm font-bold truncate max-w-[200px]">{request.hospitalName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-[#120e1b] dark:text-white text-2xl font-black tracking-tight">{request.bloodType}</h3>
                                                    <p className="text-[#6324eb] text-xs font-black uppercase tracking-wider mt-1">{request.urgency === "Cần gấp" ? '⚡ Yêu cầu ưu tiên' : 'Thông thường'}</p>
                                                </div>
                                                <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:border-[#6324eb] transition-colors">
                                                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-[#6324eb]" />
                                                </div>
                                            </div>
                                            <p className="text-[#654d99] dark:text-[#a594c9] text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                                                {request.description}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="px-6 pb-6 pt-0 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-4">
                                                <Clock className="w-4 h-4 text-[#6324eb]" />
                                                <span>{request.timeLeft}</span>
                                            </div>
                                            <div className="flex -space-x-3 mt-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="size-8 rounded-full border-4 border-white dark:border-[#1c162e] bg-slate-200 overflow-hidden shadow-sm">
                                                        <img src={`https://i.pravatar.cc/100?u=${request.id + i}`} alt="User" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                <div className="size-8 rounded-full border-4 border-white dark:border-[#1c162e] bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black">+{request.unitsNeeded}</div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-12 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages || 1 }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={currentPage === i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className="cursor-pointer"
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                className={currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-[#1c162e] border-0 gap-0">
                    {selectedRequest && (
                        <>
                            {/* Modal Header Image */}
                            <div
                                className="h-56 bg-cover bg-center relative"
                                style={{ backgroundImage: `url("${selectedRequest.image}")` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute top-4 right-4 z-50">
                                    <DialogClose asChild>
                                        <div className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer">
                                            <X className="w-5 h-5" />
                                        </div>
                                    </DialogClose>
                                </div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-1 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> {isVerified ? selectedRequest.hospitalName : 'Vị trí đang khóa'}
                                    </p>
                                    <h2 className="text-4xl font-black tracking-tight">{selectedRequest.bloodType}</h2>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 flex flex-col gap-6">
                                <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${selectedRequest.urgencyColor === 'red' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-[#120e1b] dark:text-white text-lg tracking-tight uppercase text-xs opacity-50 mb-1">Tình trạng bệnh nhân</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{selectedRequest.patientCondition}"</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                        <MapPin className="w-5 h-5 text-[#6324eb] mb-2" />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Khoảng cách</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.distance}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Số lượng</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.unitsNeeded} đơn vị</p>
                                    </div>
                                </div>

                                {!isVerified && (
                                    <div className="p-5 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
                                        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                                            Để đảm bảo an toàn, địa chỉ chính xác của bệnh viện chỉ hiển thị sau khi bạn hoàn thành sàng lọc sức khỏe AI.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-4">
                                    {isVerified ? (
                                        <Button
                                            className="flex-1 h-12 py-0 bg-[#6324eb] text-white font-black rounded-xl hover:bg-[#501ac2] shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                                        >
                                            Liên hệ bệnh viện
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => router.push("/screening")}
                                            className="flex-1 h-12 py-0 bg-[#6324eb] text-white font-black rounded-xl hover:bg-[#501ac2] shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                                        >
                                            Kiểm tra ngay
                                        </Button>
                                    )}
                                    <Button variant="outline" className="h-12 w-12 p-0 rounded-xl hover:bg-slate-200 border-slate-200 dark:border-slate-800">
                                        <Phone className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
