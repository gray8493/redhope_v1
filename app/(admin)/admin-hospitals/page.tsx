"use client";

import React, { useEffect, useState } from 'react';
import { hospitalService } from '@/services/hospital.service';
import { Hospital, User, VerificationStatus } from '@/lib/database.types';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Search, Trash2, Edit, X, Save, AlertCircle, CheckCircle, XCircle, Eye, Clock, MessageCircle, ShieldCheck, Building2, Filter } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { LocationSelector } from "@/components/shared/LocationSelector";

// Extended interface to handle UI specific fields if not in DB types yet
interface UIHospital extends Hospital {
    city?: string;
    district?: string;
    verification_status?: VerificationStatus | null;
    verification_note?: string | null;
    verified_at?: string | null;
    full_name?: string;
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export default function HospitalDirectoryPage() {
    const { user } = useAuth();
    const [hospitals, setHospitals] = useState<UIHospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Partial<UIHospital>>({});
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    // Verification modal
    const [verifyingHospital, setVerifyingHospital] = useState<UIHospital | null>(null);
    const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | 'in_review' | null>(null);
    const [verifyNote, setVerifyNote] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Focus management for modal
    const modalRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (isModalOpen) {
            if (document.activeElement instanceof HTMLButtonElement) {
                triggerRef.current = document.activeElement;
            }
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setIsModalOpen(false);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => modalRef.current?.focus(), 100);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                triggerRef.current?.focus();
            };
        }
    }, [isModalOpen]);

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await hospitalService.getAll();
            setHospitals(data.map(u => ({
                id: u.id,
                hospital_name: u.hospital_name,
                license_number: u.license_number,
                hospital_address: u.hospital_address,
                is_verified: u.is_verified,
                role: 'hospital' as const,
                created_at: u.created_at,
                email: u.email,
                phone: u.phone,
                city: (u as any).city,
                district: (u as any).district,
                verification_status: u.verification_status,
                verification_note: u.verification_note,
                verified_at: u.verified_at,
                full_name: u.full_name,
            })));
        } catch (error: any) {
            console.error('Failed to load hospitals:', error);
            const msg = error.message || 'Failed to load hospitals';
            setLoadError(msg);
            toast.error("Lỗi tải dữ liệu: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setDeletingId(id);
    };

    const handleDeleteConfirmed = async () => {
        if (!deletingId) return;
        try {
            await hospitalService.delete(deletingId);
            setHospitals(prev => prev.filter(h => h.id !== deletingId));
            toast.success("Đã xóa bệnh viện thành công!");
        } catch (error: any) {
            console.error('Delete failed:', error);
            toast.error("Xóa thất bại: " + (error.message || 'Lỗi không xác định'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                hospital_name: currentHospital.hospital_name || undefined,
                hospital_address: currentHospital.hospital_address || undefined,
                license_number: currentHospital.license_number || undefined,
                is_verified: currentHospital.is_verified || false,
                city: currentHospital.city,
                district: currentHospital.district
            };

            if (mode === 'add') {
                const newHospital = await hospitalService.create(payload);
                const mapped: UIHospital = {
                    id: newHospital.id,
                    hospital_name: newHospital.hospital_name,
                    license_number: newHospital.license_number,
                    hospital_address: newHospital.hospital_address,
                    is_verified: newHospital.is_verified,
                    role: 'hospital',
                    email: newHospital.email,
                    phone: newHospital.phone,
                    city: (newHospital as any).city || currentHospital.city,
                    district: (newHospital as any).district || currentHospital.district,
                    verification_status: 'pending',
                };
                setHospitals([mapped, ...hospitals]);
                toast.success("Thêm bệnh viện mới thành công!");
            } else {
                if (!currentHospital.id) {
                    toast.error("Lỗi: Không tìm thấy ID bệnh viện để cập nhật.");
                    return;
                }
                const updatedHospital = await hospitalService.update(currentHospital.id, payload);
                const mapped: UIHospital = {
                    id: updatedHospital.id,
                    hospital_name: updatedHospital.hospital_name,
                    license_number: updatedHospital.license_number,
                    hospital_address: updatedHospital.hospital_address,
                    is_verified: updatedHospital.is_verified,
                    role: 'hospital',
                    email: updatedHospital.email,
                    phone: updatedHospital.phone,
                    city: (updatedHospital as any).city || currentHospital.city,
                    district: (updatedHospital as any).district || currentHospital.district,
                    verification_status: updatedHospital.verification_status,
                    verification_note: updatedHospital.verification_note,
                    verified_at: updatedHospital.verified_at,
                };
                setHospitals(prev => prev.map(h => h.id === mapped.id ? mapped : h));
                toast.success("Cập nhật thông tin thành công!");
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Save failed:', JSON.stringify(error, null, 2));
            toast.error("Lỗi lưu dữ liệu: " + (error.message || error.details || error.hint || 'Không thể lưu (Lỗi không xác định)'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerification = async (e?: React.MouseEvent) => {
        // Prevent AlertDialogAction from auto-closing the dialog
        if (e) e.preventDefault();
        if (!verifyingHospital || !verifyAction || !user?.id) return;
        setIsVerifying(true);
        try {
            await hospitalService.updateVerificationStatus(
                verifyingHospital.id,
                verifyAction === 'approve' ? 'approved' : verifyAction === 'reject' ? 'rejected' : 'in_review',
                user.id,
                verifyNote || undefined
            );
            // Refresh list
            await loadHospitals();
            const actionLabel = verifyAction === 'approve' ? 'phê duyệt' : verifyAction === 'reject' ? 'từ chối' : 'chuyển sang xem xét';
            toast.success(`Đã ${actionLabel} bệnh viện "${verifyingHospital.hospital_name}" thành công!`);
        } catch (error: any) {
            toast.error("Lỗi xác nhận: " + (error.message || 'Không rõ nguyên nhân'));
        } finally {
            setIsVerifying(false);
            setVerifyingHospital(null);
            setVerifyAction(null);
            setVerifyNote('');
        }
    };

    const openAddModal = () => {
        setMode('add');
        setCurrentHospital({ is_verified: false });
        setIsModalOpen(true);
    };

    const openEditModal = (hospital: UIHospital) => {
        setMode('edit');
        setCurrentHospital({ ...hospital });
        setIsModalOpen(true);
    };

    // Filter by tab and search
    const filteredHospitals = hospitals.filter(h => {
        const matchSearch = h.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.hospital_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.city?.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchSearch;
        if (activeTab === 'pending') return matchSearch && (h.verification_status === 'pending' || h.verification_status === 'in_review');
        if (activeTab === 'approved') return matchSearch && h.verification_status === 'approved';
        if (activeTab === 'rejected') return matchSearch && h.verification_status === 'rejected';
        return matchSearch;
    });

    const pendingCount = hospitals.filter(h => h.verification_status === 'pending' || h.verification_status === 'in_review').length;
    const approvedCount = hospitals.filter(h => h.verification_status === 'approved').length;
    const rejectedCount = hospitals.filter(h => h.verification_status === 'rejected').length;

    const getStatusBadge = (status: string | null | undefined) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="w-3 h-3" />Đã duyệt</span>;
            case 'in_review':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Eye className="w-3 h-3" />Đang xem xét</span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3" />Từ chối</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3" />Chờ duyệt</span>;
        }
    };

    const tabs: { key: TabType; label: string; count: number; color: string }[] = [
        { key: 'all', label: 'Tất cả', count: hospitals.length, color: 'text-slate-600' },
        { key: 'pending', label: 'Chờ duyệt', count: pendingCount, color: 'text-amber-600' },
        { key: 'approved', label: 'Đã duyệt', count: approvedCount, color: 'text-emerald-600' },
        { key: 'rejected', label: 'Từ chối', count: rejectedCount, color: 'text-red-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f] dark:text-white">Quản lý Bệnh viện</h2>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Duyệt hồ sơ, xác nhận và giám sát tất cả bệnh viện trong mạng lưới.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            aria-label="Search hospitals"
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-[#0065FF] dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#0065FF] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-[#0065FF]/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Đăng ký mới</span>
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {loadError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{loadError}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Tổng BV</p>
                        <p className="text-xl font-bold text-[#1f1f1f] dark:text-white">{hospitals.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg text-amber-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Chờ duyệt</p>
                        <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Đã duyệt</p>
                        <p className="text-xl font-bold text-emerald-600">{approvedCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-red-600">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Từ chối</p>
                        <p className="text-xl font-bold text-red-600">{rejectedCount}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.key
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.key
                                ? 'bg-[#0065FF] text-white'
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tên Bệnh viện</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Liên hệ</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></td></tr>
                            ) : filteredHospitals.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-slate-400">
                                        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>Không tìm thấy bệnh viện nào.</p>
                                    </td>
                                </tr>
                            ) : filteredHospitals.map(hospital => (
                                <tr key={hospital.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0065FF] overflow-hidden flex-shrink-0">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[#1f1f1f] dark:text-white truncate">{hospital.hospital_name}</span>
                                                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">GP: {hospital.license_number || 'Chưa có'}</span>
                                                {hospital.hospital_address && (
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate max-w-[250px]">{hospital.hospital_address}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-gray-600 dark:text-slate-300">{hospital.email || '-'}</span>
                                            <span className="text-xs text-gray-400 dark:text-slate-500">{(hospital as any).phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(hospital.verification_status)}
                                        {hospital.verification_note && hospital.verification_status === 'rejected' && (
                                            <p className="text-[10px] text-red-500 mt-1 max-w-[150px] mx-auto truncate" title={hospital.verification_note}>
                                                {hospital.verification_note}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {/* Verification actions */}
                                            {hospital.verification_status !== 'approved' && (
                                                <button
                                                    onClick={() => { setVerifyingHospital(hospital); setVerifyAction('approve'); }}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title="Phê duyệt"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {hospital.verification_status === 'pending' && (
                                                <button
                                                    onClick={() => { setVerifyingHospital(hospital); setVerifyAction('in_review'); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Đánh dấu đang xem xét"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {hospital.verification_status !== 'rejected' && hospital.verification_status !== 'approved' && (
                                                <button
                                                    onClick={() => { setVerifyingHospital(hospital); setVerifyAction('reject'); }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Từ chối"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="w-px bg-gray-200 dark:bg-slate-600 mx-0.5" />
                                            <button
                                                onClick={() => openEditModal(hospital)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-slate-400"
                                                aria-label={`Chỉnh sửa bệnh viện ${hospital.hospital_name}`}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(hospital.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 transition-colors"
                                                aria-label={`Xóa bệnh viện ${hospital.hospital_name}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 outline-none"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                            <h3 id="modal-title" className="font-bold text-lg text-gray-800 dark:text-white">
                                {mode === 'add' ? 'Thêm Bệnh Viện' : 'Cập Nhật Thông Tin'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                aria-label="Đóng cửa sổ"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="hospital_name" className="text-sm font-medium text-gray-700 dark:text-slate-300">Tên bệnh viện</label>
                                <input
                                    id="hospital_name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] dark:text-white"
                                    value={currentHospital.hospital_name || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, hospital_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="license_number" className="text-sm font-medium text-gray-700 dark:text-slate-300">Số giấy phép</label>
                                <input
                                    id="license_number"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] dark:text-white"
                                    value={currentHospital.license_number || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, license_number: e.target.value })}
                                />
                            </div>

                            {/* Location Selector */}
                            <div className="space-y-2">
                                <LocationSelector
                                    defaultCity={currentHospital.city}
                                    defaultDistrict={currentHospital.district}
                                    onCityChange={(val) => setCurrentHospital(prev => ({ ...prev, city: val }))}
                                    onDistrictChange={(val) => setCurrentHospital(prev => ({ ...prev, district: val }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="hospital_address" className="text-sm font-medium text-gray-700 dark:text-slate-300">Địa chỉ chi tiết</label>
                                <input
                                    id="hospital_address"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] dark:text-white"
                                    value={currentHospital.hospital_address || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, hospital_address: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Hủy bỏ</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-bold text-white bg-[#0065FF] hover:bg-[#0052cc] rounded-lg shadow-lg flex items-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Verification Confirmation Dialog */}
            <AlertDialog open={!!verifyingHospital && !!verifyAction} onOpenChange={(open) => {
                if (!open) { setVerifyingHospital(null); setVerifyAction(null); setVerifyNote(''); }
            }}>
                <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">
                            {verifyAction === 'approve' && '✅ Phê duyệt bệnh viện?'}
                            {verifyAction === 'reject' && '❌ Từ chối bệnh viện?'}
                            {verifyAction === 'in_review' && '🔍 Đánh dấu đang xem xét?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-slate-400">
                            {verifyAction === 'approve' && (
                                <>Bệnh viện <strong>{verifyingHospital?.hospital_name}</strong> sẽ được kích hoạt và có thể sử dụng đầy đủ tính năng trên hệ thống.</>
                            )}
                            {verifyAction === 'reject' && (
                                <>Bệnh viện <strong>{verifyingHospital?.hospital_name}</strong> sẽ bị từ chối. Họ cần cập nhật hồ sơ và gửi lại.</>
                            )}
                            {verifyAction === 'in_review' && (
                                <>Đánh dấu bệnh viện <strong>{verifyingHospital?.hospital_name}</strong> đang được xem xét. Bệnh viện sẽ thấy trạng thái thay đổi.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Note field */}
                    <div className="space-y-2 my-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            {verifyAction === 'reject' ? 'Lý do từ chối *' : 'Ghi chú (không bắt buộc)'}
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] text-sm dark:text-white resize-none"
                            rows={3}
                            placeholder={verifyAction === 'reject' ? 'VD: Thiếu giấy phép hoạt động...' : 'VD: Đã gọi Zalo ngày 12/02...'}
                            value={verifyNote}
                            onChange={(e) => setVerifyNote(e.target.value)}
                            required={verifyAction === 'reject'}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-slate-600 dark:text-slate-300">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => handleVerification(e)}
                            disabled={isVerifying || (verifyAction === 'reject' && !verifyNote.trim())}
                            className={`font-bold ${verifyAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                verifyAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                        >
                            {isVerifying && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {verifyAction === 'approve' && 'Phê duyệt'}
                            {verifyAction === 'reject' && 'Từ chối'}
                            {verifyAction === 'in_review' && 'Xác nhận'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Xóa bệnh viện này?</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-slate-400">
                            Bạn có chắc chắn muốn xóa bệnh viện này không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-slate-600 dark:text-slate-300">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 text-white hover:bg-red-700">
                            Xóa ngay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
