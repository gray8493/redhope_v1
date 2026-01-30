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
    ChevronUp
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
                return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg border border-red-200">Cấp cứu</span>;
            case 'Urgent':
                return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-lg border border-orange-200">Khẩn cấp</span>;
            default:
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-200">Tiêu chuẩn</span>;
        }
    };

    return (
        <main className="flex-1 bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 text-left min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Yêu cầu Máu Khẩn cấp</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Quản lý và theo dõi các yêu cầu huy động máu khẩn cấp từ cộng đồng.</p>
                </div>
                <Link href="/hospital-requests/create">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#6324eb] hover:bg-[#501ac2] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        TẠO YÊU CẦU MỚI
                    </button>
                </Link>
            </header>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#6324eb]/20 outline-none"
                        placeholder="Tìm kiếm yêu cầu theo mô tả hoặc nhóm máu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Droplet className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Chưa có yêu cầu nào</h3>
                        <p className="text-slate-500 text-sm">Tạo yêu cầu khẩn cấp để nhận sự hỗ trợ từ cộng đồng người hiến máu.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                            <div
                                className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                                onClick={() => toggleExpand(req.id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex flex-col items-center justify-center text-red-600 border border-red-100 dark:border-red-900/30">
                                        <span className="text-[10px] font-black uppercase opacity-60">Máu</span>
                                        <span className="text-xl font-black">{req.required_blood_group}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white">Cần {req.required_units} đơn vị</h3>
                                            {getUrgencyBadge(req.urgency_level)}
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${req.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {req.status === 'Open' ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1 max-w-lg">{req.description}</p>
                                        <p className="text-[11px] text-slate-400 mt-1 font-medium italic">
                                            Ngày tạo: {new Date(req.created_at).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đăng ký giúp</p>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-[#6324eb]" />
                                            <span className="text-lg font-black text-slate-900 dark:text-white">
                                                {req.appointments?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                    {expandedRequestId === req.id ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
                                </div>
                            </div>

                            {expandedRequestId === req.id && (
                                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Danh sách người đăng ký giúp đỡ</h4>
                                        <span className="text-xs text-slate-400 font-medium italic">Tổng cộng {registrations[req.id]?.length || 0} người</span>
                                    </div>

                                    {loadingRegs[req.id] ? (
                                        <div className="space-y-3">
                                            <Skeleton className="h-12 w-full rounded-xl" />
                                            <Skeleton className="h-12 w-full rounded-xl" />
                                        </div>
                                    ) : !registrations[req.id] || registrations[req.id].length === 0 ? (
                                        <div className="py-8 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-sm text-slate-400 italic">Chưa có ai đăng ký cho yêu cầu này.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {registrations[req.id].map((reg: any) => (
                                                <div key={reg.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 hover:shadow-md transition-all">
                                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#6324eb] font-black text-sm">
                                                        {reg.user?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{reg.user?.full_name}</p>
                                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                                                                Nhóm {reg.user?.blood_group || '??'}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                                <Phone className="w-3 h-3" />
                                                                {reg.user?.phone || 'Chưa cập nhật'}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                                <Mail className="w-3 h-3" />
                                                                <span className="truncate">{reg.user?.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                                <MapPin className="w-3 h-3" />
                                                                {reg.user?.district && reg.user?.city ? `${reg.user.district}, ${reg.user.city}` : 'Vị trí ẩn'}
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                                            <span className="text-[10px] text-slate-400 font-medium">Đăng ký: {new Date(reg.created_at).toLocaleString('vi-VN')}</span>
                                                            <button className="text-[10px] font-black text-[#6324eb] uppercase tracking-wide hover:underline">Liên hệ</button>
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

            <div className="mt-12">
                <MiniFooter />
            </div>
        </main>
    );
}
