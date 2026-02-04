"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { screeningService } from "@/services/screening.service";
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
    ArrowRight,
    HeartPulse,
    XCircle
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
    // Screening status: 'not_done' | 'passed' | 'failed'
    const [screeningStatus, setScreeningStatus] = useState<'not_done' | 'passed' | 'failed'>('not_done');

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/requests");
        }
    }, [user, loading, router]);



    // Check screening status on mount and periodically
    useEffect(() => {
        const checkScreeningStatus = async () => {
            if (!user?.id) {
                setScreeningStatus('not_done');
                return;
            }

            const { status } = await screeningService.getScreeningStatus(user.id);
            setScreeningStatus(status);
        };

        checkScreeningStatus();

        // Re-check when window regains focus (user might return from screening page)
        const handleFocus = () => checkScreeningStatus();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user?.id]);

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

        // 1. Check Mandatory AI Screening via Database Service
        const eligibility = await screeningService.checkEligibility(profile.id);

        if (!eligibility.eligible) {
            if (eligibility.status === 'failed') {
                // Đã làm test nhưng FAIL
                toast.error("Bạn chưa đủ điều kiện hiến máu", {
                    description: eligibility.reason,
                    action: {
                        label: "Xem chi tiết",
                        onClick: () => router.push('/screening')
                    },
                    duration: 6000,
                });
            } else {
                // Chưa làm hoặc status not_done (bao gồm hết hạn)
                toast.error("Yêu cầu sàng lọc sức khỏe", {
                    description: eligibility.reason,
                    action: {
                        label: "Làm test ngay",
                        onClick: () => router.push(`/screening?campaignId=${item.id}`)
                    },
                    duration: 5000,
                });
                setTimeout(() => router.push(`/screening?campaignId=${item.id}`), 1000);
            }
            return;
        }

        // 2. Check Single Active Registration Constraint
        // Users can only have ONE 'Booked' appointment at a time.
        const activeAppointment = userAppointments.find(app => app.status === 'Booked');
        if (activeAppointment) {
            const activeName = activeAppointment.campaign?.name || "Yêu cầu khẩn cấp";
            toast.error("Bạn đang có lịch hẹn chưa hoàn thành!", {
                description: `Bạn đang đăng ký tham gia "${activeName}". Vui lòng hủy đăng ký cũ trước khi đăng ký mới.`,
                duration: 5000,
            });
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
            // Xử lý các loại error khác nhau
            let errorMessage = "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.";

            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error_description) {
                errorMessage = error.error_description;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.details) {
                errorMessage = error.details;
            }

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRegistration = async (item: any) => {
        if (!item) return;

        // Find appointment ID
        const appointment = userAppointments.find(appt =>
            (item.type === 'campaign' && appt.campaign_id === item.id && appt.status === 'Booked') ||
            (item.type === 'request' && appt.blood_request_id === item.id && appt.status === 'Booked')
        );

        if (!appointment) {
            toast.error("Không tìm thấy lịch hẹn hợp lệ để hủy.");
            return;
        }

        if (!confirm("Bạn có chắc chắn muốn hủy đăng ký tham gia này không?")) return;

        setIsSubmitting(true);
        try {
            await campaignService.cancelRegistration(appointment.id);
            toast.success("Đã hủy đăng ký thành công.", {
                description: "Lịch hẹn của bạn đã được hủy bỏ."
            });

            // Refresh
            if (profile?.id) {
                const appointments = await campaignService.getUserAppointments(profile.id);
                setUserAppointments(appointments || []);
            }
            setSelectedRequest(null);
        } catch (error: any) {
            console.error("Cancel error:", error);
            toast.error("Lỗi khi hủy đăng ký: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAlreadyRegistered = (item: any) => {
        if (!item) return false;
        return userAppointments.some(appt =>
            ((item.type === 'campaign' && appt.campaign_id === item.id) ||
                (item.type === 'request' && appt.blood_request_id === item.id)) &&
            appt.status === 'Booked'
        );
    };

    return (
        <div className="flex h-screen w-full flex-row overflow-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
                <TopNav title="Yêu cầu hiến máu" />
                <main className="flex flex-1 justify-center py-8">
                    <div className="flex flex-col max-w-[1440px] flex-1 px-4 md:px-10">
                        {/* Page Heading */}
                        <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                            <div className="flex min-w-72 flex-col gap-2">
                                <h1 className="text-[#120e1b] dark:text-white text-4xl font-black tracking-tight">Yêu cầu hiến máu</h1>
                                <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                    Nhu cầu khẩn cấp từ các cơ sở y tế trong khu vực của bạn.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Nút trạng thái Sàng lọc Sức khỏe AI */}
                                {screeningStatus === 'passed' ? (
                                    <button
                                        onClick={() => router.push('/screening')}
                                        className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2.5 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                    >
                                        <HeartPulse className="w-5 h-5" />
                                        <span className="text-sm font-bold">Đủ điều kiện sức khỏe</span>
                                    </button>
                                ) : screeningStatus === 'failed' ? (
                                    <button
                                        onClick={() => router.push('/screening')}
                                        className="flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span className="text-sm font-bold">Không đủ điều kiện</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push('/screening')}
                                        className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer animate-pulse"
                                    >
                                        <HeartPulse className="w-5 h-5" />
                                        <span className="text-sm font-bold">Kiểm tra sức khỏe AI</span>
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
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 flex-1 mr-2 overflow-hidden">
                                                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                        <span className="text-[11px] font-bold truncate">
                                                            {request.location_name || request.hospital?.hospital_name || request.hospital?.address || "Địa điểm chưa xác định"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span className="text-[#6324eb] text-xs font-black whitespace-nowrap">
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

            {/* Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#1c162e] border-0 gap-0">
                    <VisuallyHidden>
                        <DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
                    </VisuallyHidden>
                    {selectedRequest && (
                        <>
                            <div className="relative shrink-0">
                                <div
                                    className="h-52 bg-cover bg-center relative bg-slate-200"
                                    style={{ backgroundImage: `url("${selectedRequest.imageUrl || selectedRequest.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600"}")` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                                    <div className="absolute top-4 right-4 z-50">
                                        <DialogClose asChild>
                                            <div className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer">
                                                <X className="w-5 h-5" />
                                            </div>
                                        </DialogClose>
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className={`px-2.5 py-1 ${getUrgencyClass(selectedRequest.urgency_level)} text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm`}>
                                                {selectedRequest.urgency_level === 'Emergency' ? 'Cấp cứu' : selectedRequest.urgency_level === 'Urgent' ? 'Khẩn cấp' : 'Tiêu chuẩn'}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2 line-clamp-2 capitalize">
                                            {selectedRequest.title}
                                        </h2>
                                        <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-emerald-400" />
                                            <span className="truncate max-w-[300px]">
                                                {selectedRequest.hospital?.hospital_name || "Bệnh viện"}
                                                {selectedRequest.hospital?.district ? ` • ${selectedRequest.hospital.district}` : ""}
                                                {selectedRequest.hospital?.city ? ` • ${selectedRequest.hospital.city}` : ""}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
                                {/* Key Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-500">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Thời gian</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {selectedRequest.start_time ? new Date(selectedRequest.start_time).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Đang cập nhật"}
                                            </p>
                                            {selectedRequest.start_time && selectedRequest.end_time && (
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(selectedRequest.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedRequest.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-rose-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Địa điểm</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                                                {selectedRequest.location_name || selectedRequest.hospital?.address || "Đang cập nhật"}
                                            </p>
                                            {(selectedRequest.hospital?.district || selectedRequest.hospital?.city) && (
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {selectedRequest.hospital?.district}, {selectedRequest.hospital?.city}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-emerald-500">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Mục tiêu huy động</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {selectedRequest.displayUnits || selectedRequest.required_units || "0"} đơn vị máu
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Nhóm: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedRequest.required_blood_group === 'Tất cả' ? 'Tất cả các nhóm' : selectedRequest.required_blood_group}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-amber-500">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Đơn vị tổ chức</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                                {selectedRequest.hospital?.hospital_name || "Bệnh viện"}
                                            </p>
                                            {selectedRequest.hospital?.phone && (
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Liên hệ: {selectedRequest.hospital.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="font-black text-[#120e1b] dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
                                        <div className="w-1 h-4 bg-[#6324eb] rounded-full"></div>
                                        Thông tin chi tiết
                                    </h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        {selectedRequest.description || "Chưa có mô tả chi tiết cho chương trình này."}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 md:p-8 pt-0 mt-auto shrink-0 flex gap-4 bg-white dark:bg-[#1c162e]">
                                {isAlreadyRegistered(selectedRequest) ? (
                                    <Button
                                        onClick={() => handleCancelRegistration(selectedRequest)}
                                        disabled={isSubmitting}
                                        className="flex-1 h-14 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-black rounded-xl hover:bg-red-200 dark:hover:bg-red-900/30 shadow-none uppercase tracking-widest text-sm border-2 border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all"
                                    >
                                        {isSubmitting ? "Đang xử lý..." : "Hủy đăng ký"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleRegister(selectedRequest)}
                                        disabled={isSubmitting}
                                        className="flex-1 h-14 bg-[#6324eb] text-white font-black rounded-xl hover:bg-[#501ac2] shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                                    >
                                        {isSubmitting ? "Đang xử lý..." : "Đăng ký tham gia ngay"}
                                    </Button>
                                )}
                                <Button variant="outline" className="h-14 w-14 p-0 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <Phone className="w-5 h-5 text-slate-500" />
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
