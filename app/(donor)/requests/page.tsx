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
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { toast } from "sonner";

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

export default function RequestsPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const [userAppointments, setUserAppointments] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/requests");
        }
    }, [user, loading, router]);

    const isVerified = profile?.is_verified === true;
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id && !loading) return;
            if (loading) return;

            try {
                const [requestsData, campaignsData] = await Promise.all([
                    campaignService.getRequests(),
                    campaignService.getActive()
                ]);

                // Normalize requests
                const normalizedRequests = requestsData.map((r: any) => ({
                    ...r,
                    type: 'request',
                    title: `Cần máu ${r.required_blood_group}`,
                    displayUnits: r.required_units,
                    description: stripHtml(r.description || "")
                }));

                // Normalize campaigns
                const normalizedCampaigns = campaignsData.map((c: any) => {
                    const groups = parseBloodGroups(c.target_blood_group);
                    let displayBloodGroup = 'Tất cả';
                    if (groups.length > 0 && groups.length < 8) {
                        displayBloodGroup = groups.length >= 5 ? `Hỗn hợp (${groups.length})` : groups.join(", ");
                    }

                    // Extract image
                    let img = c.image || c.image_url || '';
                    if (!img && c.description) {
                        const match = c.description.match(/<div data-cover="([^"]+)"/);
                        if (match) img = match[1];
                    }

                    return {
                        ...c,
                        type: 'campaign',
                        required_blood_group: displayBloodGroup,
                        urgency_level: c.is_urgent ? 'Urgent' : 'Standard',
                        title: c.name,
                        displayUnits: c.target_units,
                        description: stripHtml(c.description),
                        imageUrl: img
                    };
                });

                const combined = [...normalizedRequests, ...normalizedCampaigns].sort((a, b) => {
                    // Requests usually take precedence if they are urgent
                    if (a.urgency_level === 'Emergency' && b.urgency_level !== 'Emergency') return -1;
                    if (b.urgency_level === 'Emergency' && a.urgency_level !== 'Emergency') return 1;
                    return new Date(b.created_at || b.start_time).getTime() - new Date(a.created_at || a.start_time).getTime();
                });

                setRequests(combined);

                // Fetch user appointments if logged in
                if (profile?.id) {
                    const appointments = await campaignService.getUserAppointments(profile.id);
                    setUserAppointments(appointments || []);
                }
            } catch (error: any) {
                console.error("Error fetching requests:", error.message || error.details || error);
            } finally {
                setRequestsLoading(false);
            }
        };
        fetchData();
    }, [profile?.id, user?.id, loading]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#161121]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                    <p className="text-sm font-bold text-slate-500">Đang chuẩn bị dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Filter logic
    const filteredData = requests.filter(item => {
        if (activeFilter === "Tất cả") return true;
        if (activeFilter === "Nhóm của tôi") return item.required_blood_group === profile?.blood_group || item.required_blood_group === 'Tất cả';
        if (activeFilter === "Khẩn cấp") return item.urgency_level === "Emergency" || item.urgency_level === "High" || item.urgency_level === "Urgent";
        if (activeFilter === "Gần tôi") return item.hospital?.city === profile?.city;
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

    const handleRegister = async (item: any) => {


        if (!profile?.id) {
            toast.error("Vui lòng đăng nhập để thực hiện hành động này!");
            return;
        }

        setIsSubmitting(true);
        try {
            if (item.type === 'campaign') {
                await campaignService.registerToCampaign(profile.id, item.id);
                toast.success(`Đăng ký chiến dịch "${item.title}" thành công!`, {
                    description: "Bệnh viện đã nhận được thông tin tham gia của bạn.",
                });
            } else {
                await campaignService.registerToBloodRequest(profile.id, item.id);
                toast.success("Đăng ký giúp đỡ khẩn cấp thành công!", {
                    description: "Cảm ơn bạn đã sẵn sàng hỗ trợ cộng đồng.",
                });
            }

            // Refresh user appointments
            const appointments = await campaignService.getUserAppointments(profile.id);
            setUserAppointments(appointments || []);
            setSelectedRequest(null);
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAlreadyRegistered = (item: any) => {
        if (!item) return false;
        return userAppointments.some(appt =>
            (item.type === 'campaign' && appt.campaign_id === item.id) ||
            (item.type === 'request' && appt.blood_request_id === item.id)
        );
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
                                        Nhu cầu khẩn cấp từ các cơ sở y tế trong khu vực của bạn.
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
                                {["Tất cả", "Nhóm của tôi", "Gần tôi", "Khẩn cấp"].map(f => (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {requestsLoading ? (
                                    [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((request) => {
                                        // Helper to get diverse status visuals based on urgency
                                        const getStatusHelper = (level: string) => {
                                            switch (level) {
                                                case 'Emergency':
                                                    return { label: 'Cần gấp', color: 'text-purple-600 bg-purple-100' };
                                                case 'High':
                                                    return { label: 'Sắp hết', color: 'text-purple-600 bg-purple-100' };
                                                default:
                                                    return { label: 'Bổ sung', color: 'text-purple-600 bg-purple-100' };
                                            }
                                        };
                                        const statusInfo = getStatusHelper(request.urgency_level);

                                        return (
                                            <Card
                                                key={request.id}
                                                onClick={() => setSelectedRequest(request)}
                                                className="flex flex-col overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d] rounded-2xl h-full"
                                            >
                                                {/* Header Image Section */}
                                                <div
                                                    className="h-48 bg-center bg-no-repeat bg-cover relative bg-slate-200"
                                                    style={{ backgroundImage: `url("${request.imageUrl || request.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600"}")` }}
                                                >
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                                    {/* Blur Overlay if Locked */}


                                                    {/* Top Badges */}
                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                                        <span className={`px-2.5 py-1 ${getUrgencyClass(request.urgency_level)} text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm`}>
                                                            {request.urgency_level === 'Emergency' ? 'Cấp cứu' : request.urgency_level === 'Urgent' ? 'Khẩn cấp' : 'Tiêu chuẩn'}
                                                        </span>
                                                        <span className="bg-white/90 text-[#6324eb] text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {request.hospital?.district || "Gần bạn"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Body Content */}
                                                <div className="flex flex-col flex-1 p-5">
                                                    <div className="flex justify-between items-start mb-3 gap-2">
                                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-black tracking-tight leading-tight">
                                                            {request.title}
                                                        </h3>
                                                        <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${statusInfo.color}`}>
                                                            {request.displayUnits} đơn vị
                                                        </span>
                                                    </div>

                                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-3 leading-relaxed mb-4 flex-1">
                                                        {request.description || "Hỗ trợ cộng đồng bằng cách hiến máu tại sự kiện này."}
                                                    </p>

                                                    {request.type === 'campaign' && (
                                                        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md w-fit uppercase">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(request.start_time).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    )}

                                                    {/* Divider */}
                                                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-4"></div>

                                                    {/* Footer Info */}
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                                            <span className="text-[11px] font-bold truncate max-w-[150px]">
                                                                {request.hospital?.hospital_name || "Bệnh viện ẩn"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[#6324eb] text-xs font-black">
                                                                Chi tiết
                                                            </span>
                                                            <ArrowRight className="w-3 h-3 text-[#6324eb]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })
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
                    <VisuallyHidden>
                        <DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
                    </VisuallyHidden>
                    {selectedRequest && (
                        <>
                            <div
                                className="h-56 bg-cover bg-center relative bg-slate-200"
                                style={{ backgroundImage: `url("${selectedRequest.imageUrl || selectedRequest.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600"}")` }}
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
                                        <Building2 className="w-4 h-4" /> {selectedRequest.hospital?.hospital_name}
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
                                            {selectedRequest.hospital?.district}, {selectedRequest.hospital?.city}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Yêu cầu</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.required_units} đơn vị</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button
                                        onClick={() => handleRegister(selectedRequest)}
                                        disabled={isSubmitting || isAlreadyRegistered(selectedRequest)}
                                        className="flex-1 h-12 bg-[#6324eb] text-white font-black rounded-xl hover:bg-[#501ac2] shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                                    >
                                        {isSubmitting ? "Đang xử lý..." : isAlreadyRegistered(selectedRequest) ? "Đã đăng ký tham gia" : "Đăng ký tham gia"}
                                    </Button>
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
