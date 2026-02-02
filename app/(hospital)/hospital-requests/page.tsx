"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services/campaign.service';
import { toast } from 'sonner';
import {
    Droplet,
    AlertCircle,
    Clock,
    Users,
    Search,
    Plus,
    ChevronRight,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    Calendar,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    UserCheck,
    Contact,
    Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MiniFooter from "@/components/shared/MiniFooter";

export default function HospitalRequestsListPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
    const [registrations, setRegistrations] = useState<Record<string, any[]>>({});
    const [loadingRegs, setLoadingRegs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!user?.id) return;
        fetchRequests();
    }, [user?.id]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await campaignService.getHospitalRequests(user!.id);
            setRequests(data || []);
        } catch (error: any) {
            console.error('Error fetching requests:', error);
            toast.error('Không thể tải các yêu cầu máu');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (requestId: string) => {
        if (expandedRequestId === requestId) {
            setExpandedRequestId(null);
            return;
        }

        setExpandedRequestId(requestId);

        if (!registrations[requestId]) {
            try {
                setLoadingRegs(prev => ({ ...prev, [requestId]: true }));
                const data = await campaignService.getRequestRegistrations(requestId);
                setRegistrations(prev => ({ ...prev, [requestId]: data }));
            } catch (error) {
                console.error('Error fetching registrations:', error);
                toast.error('Không thể tải danh sách người đăng ký');
            } finally {
                setLoadingRegs(prev => ({ ...prev, [requestId]: false }));
            }
        }
    };

    const filteredRequests = requests.filter(r =>
        (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.required_blood_group || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getUrgencyBadge = (level: string) => {
        switch (level) {
            case 'Emergency':
                return <span className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg shadow-rose-500/20 animate-pulse border border-rose-400/50">Cấp cứu</span>;
            case 'Urgent':
                return <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg shadow-amber-500/20 border border-amber-400/50">Khẩn cấp</span>;
            default:
                return <span className="px-3 py-1 bg-med-blue text-white text-[9px] font-black uppercase rounded-full shadow-lg shadow-med-blue/20 border border-sky-400/50">Tiêu chuẩn</span>;
        }
    };

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-6 md:p-10 text-left medical-gradient">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-med-primary/10 text-med-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-med-primary/20">Trung tâm Điều phối Khẩn cấp</span>
                        <span className="size-1.5 bg-rose-500 rounded-full animate-ping"></span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-medical-header text-slate-900 dark:text-white tracking-tight leading-none">Yêu cầu Máu <span className="text-rose-600 underline decoration-rose-200 decoration-8 underline-offset-4">Huy động</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-2xl italic opacity-80">Quản lý và theo dõi hiệu quả các yêu cầu máu khẩn cấp tại địa bàn.</p>
                </div>
                <Link href="/hospital-requests/create">
                    <button className="flex items-center gap-3 px-6 py-4 bg-med-primary text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-med-primary/30 hover:shadow-med-primary/40 hover:-translate-y-0.5 transition-all border-b-4 border-teal-800 active:translate-y-0.5 active:border-b-0">
                        <Plus className="size-4" /> Tạo Yêu cầu Mới
                    </button>
                </Link>
            </header>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
                <div className="relative w-full lg:max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-med-primary transition-colors" />
                    <input
                        className="w-full h-14 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl pl-14 pr-6 text-sm focus:ring-2 focus:ring-med-primary/20 focus:border-med-primary placeholder-slate-400 font-medium outline-none transition-all shadow-med group-focus-within:shadow-xl"
                        placeholder="Mã nhóm máu, mức độ hoặc nội dung yêu cầu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <ShieldAlert className="size-3 text-rose-500" /> Cảnh báo: {requests.filter(r => r.urgency_level === 'Emergency').length}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-med">
                            <div className="flex gap-6 items-center">
                                <Skeleton className="size-16 rounded-[24px]" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-1/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-md py-24 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                        <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Droplet className="size-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-medical-header text-slate-900 mb-2">Hệ thống Đang ổn định</h3>
                        <p className="text-slate-400 text-sm italic">Không có yêu cầu huy động nào được ghi nhận trong khu vực.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-med overflow-hidden transition-all hover:shadow-med-hover hover:-translate-y-1 group"
                        >
                            <div
                                className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
                                onClick={() => toggleExpand(req.id)}
                            >
                                <div className="flex items-center gap-8">
                                    <div className="size-20 rounded-[28px] bg-rose-50 dark:bg-rose-900/10 flex flex-col items-center justify-center text-rose-600 border border-rose-100 shadow-inner group-hover:scale-105 transition-transform">
                                        <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">Nhóm</span>
                                        <span className="text-3xl font-medical-header tracking-tighter">{req.required_blood_group}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-xl font-medical-header text-slate-900 dark:text-white leading-none">Cần {req.required_units} đơn vị (đv)</h3>
                                            {getUrgencyBadge(req.urgency_level)}
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-1 max-w-xl italic">{req.description}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar className="size-3" /> {new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                                            <span className={`flex items-center gap-1.5 ${req.status === 'Open' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                <Activity className="size-3" /> {req.status === 'Open' ? 'HÀNH CHÍNH MỞ' : 'LƯU TRỮ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Đã sẵn sàng</p>
                                        <div className="flex items-center justify-end gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-med-primary/5 group-hover:border-med-primary/20 transition-colors">
                                            <Users className="size-4 text-med-primary" />
                                            <span className="text-2xl font-medical-header text-slate-900">
                                                {req.appointments?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${expandedRequestId === req.id ? 'bg-med-primary text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                                        <ChevronDown className="size-5" />
                                    </div>
                                </div>
                            </div>

                            {expandedRequestId === req.id && (
                                <div className="border-t border-slate-100 bg-slate-50/30 p-10 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <UserCheck className="size-4 text-med-primary" /> Danh sách Phản hồi Lâm sàng
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-medium ml-6">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-black text-slate-500">TỔNG {registrations[req.id]?.length || 0} CA</span>
                                    </div>

                                    {loadingRegs[req.id] ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Skeleton className="h-32 rounded-[28px]" />
                                            <Skeleton className="h-32 rounded-[28px]" />
                                        </div>
                                    ) : !registrations[req.id] || registrations[req.id].length === 0 ? (
                                        <div className="py-16 text-center bg-white/50 rounded-[32px] border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 italic font-medium">Đang chờ sự phản hồi từ mạng lưới tình nguyện viên...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {registrations[req.id].map((reg: any) => (
                                                <div key={reg.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-6 group/item hover:border-med-primary/30 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                                                    <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-med-primary font-black text-xl border border-slate-100 group-hover/item:bg-med-primary group-hover/item:text-white transition-all">
                                                        {reg.user?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-sm font-black text-slate-900 truncate">{reg.user?.full_name}</h5>
                                                            <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-lg border border-rose-100">
                                                                NHÓM {reg.user?.blood_group || '??'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                                <Phone className="size-3" /> {reg.user?.phone || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                                <Mail className="size-3" /> <span className="truncate max-w-[120px]">{reg.user?.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                                <MapPin className="size-3" /> {reg.user?.district || 'Vùng ẩn'}
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{new Date(reg.created_at).toLocaleDateString('vi-VN')}</span>
                                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[9px] font-black text-med-primary uppercase tracking-widest hover:bg-med-primary hover:text-white transition-all cursor-pointer">
                                                                <Contact className="size-3" /> Liên hệ ngay
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-16">
                <MiniFooter />
            </div>
        </main>
    );
}
