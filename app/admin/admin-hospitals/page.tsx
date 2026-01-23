"use client";

import React, { useEffect, useState } from 'react';
import { hospitalService } from '@/services/hospital.service';
import { User } from '@/lib/database.types';
import { Loader2, Plus, Search, Trash2, Edit, X, Save } from 'lucide-react';

export default function HospitalDirectoryPage() {
    const [hospitals, setHospitals] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Partial<User>>({});
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await hospitalService.getAll();
            setHospitals(data as any);
        } catch (error: any) {
            console.error('Failed to load hospitals:', error);
            setLoadError(error.message || 'Failed to load hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bệnh viện này không?')) return;
        try {
            await hospitalService.delete(id);
            setHospitals(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Xóa thất bại');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (mode === 'add') {
                const newHospital = await hospitalService.create({
                    hospital_name: currentHospital.hospital_name || undefined,
                    hospital_address: currentHospital.hospital_address || undefined,
                    license_number: currentHospital.license_number || undefined,
                    is_verified: currentHospital.is_verified || false,
                } as any);
                setHospitals([newHospital as any, ...hospitals]);
            } else {
                if (!currentHospital.id) return;
                const updatedHospital = await hospitalService.update(currentHospital.id, {
                    hospital_name: currentHospital.hospital_name || undefined,
                    hospital_address: currentHospital.hospital_address || undefined,
                    license_number: currentHospital.license_number || undefined,
                    is_verified: currentHospital.is_verified || false,
                });
                setHospitals(prev => prev.map(h => h.id === updatedHospital.id ? updatedHospital as any : h));
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Save failed:', error);
            alert('Lỗi: ' + (error.message || 'Không thể lưu'));
        } finally {
            setIsSaving(false);
        }
    };

    const openAddModal = () => {
        setMode('add');
        setCurrentHospital({ is_verified: false });
        setIsModalOpen(true);
    };

    const openEditModal = (hospital: User) => {
        setMode('edit');
        setCurrentHospital({ ...hospital });
        setIsModalOpen(true);
    };

    // Filter locally for now
    const filteredHospitals = hospitals.filter(h =>
        (h.hospital_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.hospital_address || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#6324eb]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
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

            {/* Stats (Static for now as DB doesn't have enough data) */}
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
                {/* ... other stats ... */}
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
                            ) : loadError ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-red-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl">error</span>
                                            <p>{loadError}</p>
                                        </div>
                                    </td>
                                </tr>
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
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(hospital)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(hospital.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {mode === 'add' ? 'Thêm Bệnh Viện' : 'Cập Nhật Thông Tin'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tên bệnh viện</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                    value={currentHospital.hospital_name || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, hospital_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Số giấy phép</label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                    value={currentHospital.license_number || ''}
                                    onChange={e => setCurrentHospital({ ...currentHospital, license_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                                <input
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
        </div>
    );
}
