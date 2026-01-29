"use client";

import React, { useEffect, useState } from 'react';
import { hospitalService } from '@/services/hospital.service';
import { Hospital } from '@/lib/database.types';
import { Loader2, Plus, Search, Trash2, Edit, X, Save, AlertCircle } from 'lucide-react';
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
}

export default function HospitalDirectoryPage() {
    const [hospitals, setHospitals] = useState<UIHospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Partial<UIHospital>>({});
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
                // If backend returns city/district, map them here. Assuming they might be in 'u' as any
                city: (u as any).city,
                district: (u as any).district
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
            // Prepare payload with city/district
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
                    district: (newHospital as any).district || currentHospital.district
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
                    district: (updatedHospital as any).district || currentHospital.district
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

    // Filter locally
    const filteredHospitals = hospitals.filter(h =>
        h.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.hospital_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Quản lý Danh mục Bệnh viện</h2>
                    <p className="text-gray-500 text-sm">Duy trì và giám sát tất cả các cơ sở y tế trong mạng lưới BloodLink.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            aria-label="Search hospitals"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#6324eb]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#6324eb] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-[#6324eb]/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Đăng ký Bệnh viện mới</span>
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                        <span className="material-symbols-outlined">corporate_fare</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Tổng đối tác</p>
                        <p className="text-xl font-bold text-[#1f1f1f]">{hospitals.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Bệnh viện</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Địa điểm</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></td></tr>
                            ) : filteredHospitals.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
                                        <p>Không tìm thấy bệnh viện nào.</p>
                                    </td>
                                </tr>
                            ) : filteredHospitals.map(hospital => (
                                <tr key={hospital.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-[#6324eb] overflow-hidden">
                                                <span className="material-symbols-outlined text-2xl">local_hospital</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[#1f1f1f]">{hospital.hospital_name}</span>
                                                <span className="text-[10px] text-gray-500 font-medium">ID: {hospital.license_number || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700">{hospital.hospital_address}</span>
                                        {hospital.city && <div className="text-xs text-gray-500">{hospital.district}, {hospital.city}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${hospital.is_verified
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {hospital.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-gray-500">
                                            <button
                                                onClick={() => openEditModal(hospital)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                aria-label={`Chỉnh sửa bệnh viện ${hospital.hospital_name}`}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(hospital.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 outline-none"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 id="modal-title" className="font-bold text-lg text-gray-800">
                                {mode === 'add' ? 'Thêm Bệnh Viện' : 'Cập Nhật Thông Tin'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Đóng cửa sổ"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="hospital_name" className="text-sm font-medium text-gray-700">Tên bệnh viện</label>
                                <input
                                    id="hospital_name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                    value={currentHospital.hospital_name || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, hospital_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="license_number" className="text-sm font-medium text-gray-700">Số giấy phép</label>
                                <input
                                    id="license_number"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
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
                                <label htmlFor="hospital_address" className="text-sm font-medium text-gray-700">Địa chỉ chi tiết</label>
                                <input
                                    id="hospital_address"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                    value={currentHospital.hospital_address || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, hospital_address: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_verified"
                                    checked={currentHospital.is_verified || false}
                                    onChange={e => setCurrentHospital({ ...currentHospital, is_verified: e.target.checked })}
                                    className="rounded border-gray-300 text-[#6324eb] focus:ring-[#6324eb]"
                                />
                                <label htmlFor="is_verified" className="text-sm font-medium text-gray-700">Đã xác minh</label>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Hủy bỏ</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-bold text-white bg-[#6324eb] hover:bg-[#501ac2] rounded-lg shadow-lg flex items-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bệnh viện này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa bệnh viện này không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 text-white hover:bg-red-700">
                            Xóa ngay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
