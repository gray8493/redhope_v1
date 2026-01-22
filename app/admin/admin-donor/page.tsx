"use client";

import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { User } from '@/lib/database.types';
import { Loader2, Plus, Search, Trash2, Edit, X, Save } from 'lucide-react';

export default function DonorManagementPage() {
    // State
    const [donors, setDonors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User>>({});
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        loadDonors();
    }, []);

    // Fetch Data
    const loadDonors = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            setDonors(data);
        } catch (error) {
            console.error('Failed to load donors:', error);
            alert('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    // Search Handler
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = searchTerm.trim()
                ? await userService.search(searchTerm)
                : await userService.getAll();
            setDonors(data);
        } catch (error) {
            console.error('Search failed:', error);
            alert('Tìm kiếm thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Delete Handler
    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người này không? Hành động này không thể hoàn tác.')) return;

        try {
            await userService.delete(id);
            setDonors(prev => prev.filter(d => d.id !== id));
            alert('Đã xóa thành công!');
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Xóa thất bại');
        }
    };

    // Save Handler (Create/Update)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (mode === 'add') {
                // Validate
                if (!currentUser.email || !currentUser.full_name) {
                    alert('Vui lòng điền tên và email');
                    return;
                }

                const newUser = await userService.create({
                    full_name: currentUser.full_name,
                    email: currentUser.email,
                    blood_group: currentUser.blood_group || undefined,
                    city: currentUser.city || undefined,
                    district: currentUser.district || undefined,
                    current_points: Number(currentUser.current_points) || 0,
                    password_hash: '123456' // Default password for test
                });

                setDonors([newUser, ...donors]);
                alert('Thêm mới thành công!');
            } else {
                // Update
                if (!currentUser.id) return;

                const updatedUser = await userService.update(currentUser.id, {
                    full_name: currentUser.full_name,
                    email: currentUser.email,
                    blood_group: currentUser.blood_group || undefined,
                    city: currentUser.city || undefined,
                    district: currentUser.district || undefined,
                    current_points: Number(currentUser.current_points) || 0,
                });

                setDonors(prev => prev.map(d => d.id === updatedUser.id ? updatedUser : d));
                alert('Cập nhật thành công!');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Save failed:', error);
            alert('Lỗi: ' + (error.message || 'Không thể lưu'));
        } finally {
            setIsSaving(false);
        }
    };

    // Open Modal
    const openAddModal = () => {
        setMode('add');
        setCurrentUser({ current_points: 0 });
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setMode('edit');
        setCurrentUser({ ...user });
        setIsModalOpen(true);
    };

    // Stats
    const totalDonors = donors.length;
    const verifiedDonors = donors.length; // Fake status for now
    const pendingDonors = 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Quản lý Người hiến tặng</h2>
                    <p className="text-gray-500 text-sm">Giám sát, xác minh và quản lý mạng lưới người hiến tặng thực tế.</p>
                </div>
                <div className="flex gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#6324eb]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    </form>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-[#6324eb] px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-opacity-90 transition-colors shadow-lg shadow-purple-500/30"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm người hiến mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng số đăng ký</p>
                        <p className="text-xl font-bold text-[#120e1b]">{totalDonors}</p>
                    </div>
                </div>
                {/* 
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 opacity-50">
                    <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Đang chờ xác minh</p>
                        <p className="text-xl font-bold text-[#120e1b]">-</p>
                        <p className="text-[10px] text-gray-400 italic">Tính năng đang phát triển</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 opacity-50">
                    <div className="size-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Người hiến đã xác minh</p>
                        <p className="text-xl font-bold text-[#120e1b]">-</p>
                         <p className="text-[10px] text-gray-400 italic">Tính năng đang phát triển</p>
                    </div>
                </div> 
                */}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên người hiến</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhóm máu</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thành phố</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số điểm</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <Loader2 className="animate-spin w-6 h-6" /> Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : donors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-500">
                                        Chưa có dữ liệu người hiến nào.
                                    </td>
                                </tr>
                            ) : (
                                donors.map((donor) => (
                                    <tr key={donor.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-purple-100 flex items-center justify-center text-[#6324eb] font-bold text-xs overflow-hidden uppercase border border-purple-200">
                                                    {donor.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-[#120e1b]">{donor.full_name}</span>
                                                    <span className="text-[10px] text-gray-500">{donor.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${!donor.blood_group ? 'bg-gray-100 text-gray-400' :
                                                'bg-red-50 text-red-600 border border-red-100'
                                                }`}>
                                                {donor.blood_group || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {donor.city || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 ">
                                                <span className="material-symbols-outlined text-yellow-500 text-base">stars</span>
                                                <span className="text-sm font-bold text-[#120e1b]">{donor.current_points || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(donor.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(donor)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(donor.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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
                                {mode === 'add' ? 'Thêm Người Hiến Mới' : 'Cập Nhật Thông Tin'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                    value={currentUser.full_name || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, full_name: e.target.value })}
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="email"
                                    disabled={mode === 'edit'}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] disabled:bg-gray-100 disabled:text-gray-500"
                                    value={currentUser.email || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nhóm máu</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                        value={currentUser.blood_group || ''}
                                        onChange={e => setCurrentUser({ ...currentUser, blood_group: e.target.value })}
                                    >
                                        <option value="">Chọn...</option>
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Điểm thưởng</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                        value={currentUser.current_points || 0}
                                        onChange={e => setCurrentUser({ ...currentUser, current_points: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Thành phố</label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                        value={currentUser.city || ''}
                                        onChange={e => setCurrentUser({ ...currentUser, city: e.target.value })}
                                        placeholder="Hồ Chí Minh"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Quận/Huyện</label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb]"
                                        value={currentUser.district || ''}
                                        onChange={e => setCurrentUser({ ...currentUser, district: e.target.value })}
                                        placeholder="Quận 1"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#6324eb] hover:bg-[#501ac2] rounded-lg shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
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
