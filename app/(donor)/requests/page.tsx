"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    SlidersHorizontal,
    Lock,
    Clock,
    ShieldCheck,
    MapPin,
    Phone,
    X,
    Building2,
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
import { campaignService } from "@/services/campaign.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsPage() {
    const router = useRouter();
    const { profile } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);

    const isVerified = profile?.is_verified === true;
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await campaignService.getRequests();
                setRequests(data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Filter logic
    const filteredData = requests.filter(item => {
        if (activeFilter === "Tất cả") return true;
        if (activeFilter === "Nhóm của tôi") return item.required_blood_group === profile?.blood_group;
        if (activeFilter === "Khẩn cấp") return item.urgency_level === "Emergency";
        return true;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getUrgencyClass = (level: string) => {
        switch (level) {
            case 'Emergency': return 'bg-red-500';
            case 'High': return 'bg-orange-500';
            case 'Medium': return 'bg-amber-500';
            default: return 'bg-emerald-500';
        }
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Yêu cầu hiến máu" />
                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1024px] flex-1 px-4 md:px-10">
                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black tracking-tight">Yêu cầu hiến máu</h1>
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
                                            onClick={() => router.push("/complete-profile")}
                                            className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-8 bg-[#6324eb] text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-xl shadow-[#6324eb]/25 hover:bg-[#501ac2] hover:-translate-y-0.5 transition-all">
                                            <span className="truncate">Xác minh ngay</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                                {["Tất cả", "Nhóm của tôi", "Khẩn cấp"].map(f => (
                                    <Button
                                        key={f}
                                        onClick={() => handleFilterChange(f)}
                                        variant={activeFilter === f ? "default" : "outline"}
                                        className={`rounded-xl h-11 font-bold ${activeFilter === f ? "bg-[#6324eb] hover:bg-[#501ac2]" : "bg-white dark:bg-[#1c162e] border-slate-200 dark:border-slate-800"}`}
                                    >
                                        {f}
                                    </Button>
                                ))}
                                <Button variant="outline" className="h-11 gap-2 rounded-xl bg-white dark:bg-[#1c162d] border-slate-200 dark:border-slate-800">
                                    <span className="text-sm font-bold">Lọc thêm</span>
                                    <SlidersHorizontal className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Grid of Requests */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((request) => (
                                        <Card
                                            key={request.id}
                                            onClick={() => setSelectedRequest(request)}
                                            className="flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]"
                                        >
                                            <div
                                                className="h-56 bg-center bg-no-repeat bg-cover relative bg-slate-200"
                                                style={{ backgroundImage: `url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600")` }}
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
                                                                <p className="text-[10px] font-bold text-slate-500">Cần xác minh để xem</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className={`px-3 py-1.5 ${getUrgencyClass(request.urgency_level)} text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg`}>{request.urgency_level}</span>
                                                </div>

                                                {isVerified && (
                                                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white drop-shadow-lg">
                                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-sm font-bold truncate max-w-[200px]">{request.hospital?.hospital_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-[#120e1b] dark:text-white text-2xl font-black tracking-tight">Nhóm {request.required_blood_group}</h3>
                                                        <p className="text-[#6324eb] text-xs font-black uppercase tracking-wider mt-1">{request.urgency_level === 'Emergency' ? '⚡ Yêu cầu ưu tiên' : 'Thông thường'}</p>
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
                                                    <span>Mới cập nhật</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <div className="size-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black">{request.required_units}</div>
                                                    <span className="text-xs font-bold text-slate-400">Đơn vị</span>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 text-slate-400">Không tìm thấy yêu cầu hiến máu nào.</div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: totalPages }).map((_, i) => (
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
                                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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

            {/* Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-[#1c162e] border-0 gap-0">
                    {selectedRequest && (
                        <>
                            <div
                                className="h-56 bg-cover bg-center relative bg-slate-200"
                                style={{ backgroundImage: `url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600")` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute top-4 right-4 z-50">
                                    <DialogClose asChild>
                                        <div className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer">
                                            <X className="w-5 h-5" />
                                        </div>
                                    </DialogClose>
                                </div>
                                <div className="absolute bottom-6 left-6 text-white text-left">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-1 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> {isVerified ? selectedRequest.hospital?.hospital_name : 'Vị trí đang khóa'}
                                    </p>
                                    <h2 className="text-4xl font-black tracking-tight">Nhóm {selectedRequest.required_blood_group}</h2>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col gap-6">
                                <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${getUrgencyClass(selectedRequest.urgency_level)} text-white`}>
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-black text-[#120e1b] dark:text-white text-lg tracking-tight uppercase text-xs opacity-50 mb-1">Mô tả chi tiết</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{selectedRequest.description}"</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left">
                                        <MapPin className="w-5 h-5 text-[#6324eb] mb-2" />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Khu vực</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {isVerified ? `${selectedRequest.hospital?.district}, ${selectedRequest.hospital?.city}` : '--'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Yêu cầu</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.required_units} đơn vị</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    {isVerified ? (
                                        <Button className="flex-1 h-12 bg-[#6324eb] text-white font-black rounded-xl hover:bg-[#501ac2] shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-sm">
                                            Đăng ký giúp đỡ
                                        </Button>
                                    ) : (
                                        <Button onClick={() => router.push("/complete-profile")} className="flex-1 h-12 bg-[#6324eb] text-white font-black rounded-xl hover:bg-[#501ac2] shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-sm">
                                            Xác minh để hỗ trợ
                                        </Button>
                                    )}
                                    <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-slate-200 dark:border-slate-800">
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
