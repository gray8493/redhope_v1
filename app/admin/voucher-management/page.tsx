"use client";

import React, { useEffect, useState } from 'react';
import { voucherService } from '@/services/voucher.service';
import { Voucher } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';

// Extend the DB type for UI purposes (mocking missing fields)
interface SentinelVoucher extends Voucher {
    name?: string; // mapped from partner_name
    points?: number; // mapped from point_cost
    stock?: number;
    category?: string;
    expiryDate?: string;
    image?: string;
}

export default function VoucherManagementPage() {
    const [vouchers, setVouchers] = useState<SentinelVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<SentinelVoucher | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        points: number;
        stock: number;
        category: string;
        status: string;
        expiryDate: string;
    }>({
        name: '',
        points: 0,
        stock: 0,
        category: '',
        status: 'Active',
        expiryDate: '',
    });

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const data = await voucherService.getAll();
            // Map DB fields to UI fields
            const uiVouchers = data.map(v => {
                // Logic to compute expiry: if v has an expiry field (check as any), use it,
                // otherwise default to created_at + 90 days, or now + 90 days.
                let expiry = '';
                if ((v as any).expiry_date) {
                    expiry = new Date((v as any).expiry_date).toISOString().split('T')[0];
                } else if (v.created_at) {
                    const created = new Date(v.created_at);
                    created.setDate(created.getDate() + 90);
                    expiry = created.toISOString().split('T')[0];
                } else {
                    const now = new Date();
                    now.setDate(now.getDate() + 90);
                    expiry = now.toISOString().split('T')[0];
                }

                return {
                    ...v,
                    name: v.partner_name || 'Unnamed Voucher',
                    points: v.point_cost || 0,
                    stock: 100, // Mock
                    category: 'All', // Mock
                    expiryDate: expiry,
                    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200' // Mock
                };
            });
            setVouchers(uiVouchers);
        } catch (error: any) {
            console.error('Failed to load vouchers:', error);
            // Simple alert for now as per previous patterns in this admin section
            alert('Không thể tải danh sách mã ưu đãi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredVouchers = vouchers.filter((v) =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mã ưu đãi này không?')) return;
        try {
            await voucherService.delete(id);
            setVouchers(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Xóa thất bại');
        }
    };

    const handleEdit = (voucher: SentinelVoucher) => {
        setEditingVoucher(voucher);
        setFormData({
            name: voucher.name || '',
            points: voucher.points || 0,
            stock: voucher.stock || 0,
            category: voucher.category || '',
            status: voucher.status || 'Active',
            expiryDate: voucher.expiryDate || '',
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingVoucher(null);
        setFormData({
            name: '',
            points: 1000,
            stock: 100,
            category: 'Chung',
            status: 'Draft',
            expiryDate: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVoucher) {
                // Update
                const updated = await voucherService.update(editingVoucher.id, {
                    partner_name: formData.name || undefined,
                    point_cost: formData.points ?? undefined,
                    status: formData.status || undefined,
                    // Note: stock, category, date are NOT saved to DB as they don't exist in schema
                });

                // Update local state
                setVouchers(prev => prev.map(v => v.id === updated.id ? {
                    ...v, ...formData,
                    partner_name: updated.partner_name,
                    point_cost: updated.point_cost,
                    status: updated.status
                } : v));
            } else {
                // Create
                const created = await voucherService.create({
                    partner_name: formData.name || undefined,
                    point_cost: formData.points ?? undefined,
                    status: formData.status || undefined,
                    code: crypto.randomUUID().substring(0, 8).toUpperCase() // Better random code
                });

                // Add to local state (mixin with ui fields)
                setVouchers(prev => [{
                    ...created, ...formData,
                    name: created.partner_name || formData.name,
                    points: created.point_cost || formData.points,
                    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=200'
                } as SentinelVoucher, ...prev]);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Save failed:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
                        </span>
                        <input
                            className="block w-full pl-10 pr-3 py-2 border-none bg-gray-100 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#6324eb] focus:bg-white transition-all outline-none"
                            placeholder="Tìm kiếm mã ưu đãi..."
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-[#6324eb] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#501ac2] transition-colors shadow-lg shadow-[#6324eb]/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Tạo Mã ưu đãi
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center text-[#6324eb]">
                        <span className="material-symbols-outlined">confirmation_number</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Tổng số Mã ưu đãi</p>
                        <p className="text-2xl font-bold">{vouchers.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Kho đang hoạt động</p>
                        <p className="text-2xl font-bold">{vouchers.reduce((acc, v) => acc + (v.stock || 0), 0)}</p>
                    </div>
                </div>
            </div>

            {/* Voucher List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chi tiết Mã ưu đãi</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chi phí (Điểm)</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kho</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hết hạn</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></td></tr>
                        ) : filteredVouchers.map((voucher) => (
                            <tr key={voucher.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                                            <img src={voucher.image} alt={voucher.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1f1f1f] text-sm">{voucher.name}</p>
                                            <p className="text-xs text-gray-500">{voucher.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-[#6324eb] font-bold">
                                        <span className="material-symbols-outlined text-sm">stars</span>
                                        {(voucher.points || 0).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${(voucher.stock || 0) < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(((voucher.stock || 0) / 100) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-bold ${(voucher.stock || 0) < 20 ? 'text-red-500' : 'text-gray-600'}`}>{voucher.stock} còn lại</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${voucher.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                        voucher.status === 'Inactive' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                        {voucher.status === 'Active' ? 'Hoạt động' : voucher.status === 'Inactive' ? 'Không hoạt động' : 'Nháp'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                    {voucher.expiryDate}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(voucher)}
                                            className="p-2 text-gray-500 hover:text-[#6324eb] hover:bg-[#6324eb]/5 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(voucher.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredVouchers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
                        <p>Không tìm thấy mã ưu đãi nào phù hợp.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-[#1f1f1f]">
                                {editingVoucher ? 'Chỉnh sửa Mã ưu đãi' : 'Tạo Mã ưu đãi mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tên Mã ưu đãi</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                                    placeholder="ví dụ: Thẻ mua sắm $50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chi phí Điểm</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.points}
                                        onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số lượng kho</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">*Chỉ lưu giao diện</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Danh mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                                    >
                                        <option value="Chung">Chung</option>
                                        <option value="Thực phẩm & Đồ uống">Thực phẩm & Đồ uống</option>
                                        <option value="Mua sắm">Mua sắm</option>
                                        <option value="Giải trí">Giải trí</option>
                                        <option value="Sức khỏe & Thể hình">Sức khỏe & Thể hình</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all"
                                    >
                                        <option value="Active">Hoạt động</option>
                                        <option value="Inactive">Không hoạt động</option>
                                        <option value="Draft">Nháp</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ngày hết hạn</label>
                                <input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6324eb] outline-none transition-all text-gray-500"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">*Chỉ lưu giao diện</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-[#6324eb] hover:bg-[#501ac2] text-white font-bold rounded-xl shadow-lg shadow-[#6324eb]/20 transition-all"
                                >
                                    {editingVoucher ? 'Lưu thay đổi' : 'Tạo Mã ưu đãi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
