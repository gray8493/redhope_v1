"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Calendar,
    Users,
    Activity,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    Building2
} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { campaignService } from '@/services/campaign.service';
import { hospitalService } from '@/services/hospital.service';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { User } from '@/lib/database.types';

export default function CampaignManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tất cả trạng thái");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;
    const [inputError, setInputError] = useState<string | null>(null);

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [hospitals, setHospitals] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await campaignService.getAll();

            const statusMap: Record<string, string> = {
                'active': 'Đang diễn ra',
                'draft': 'Sắp diễn ra',
                'ended': 'Đã kết thúc',
                'cancelled': 'Đã hủy'
            };

            const formattedCampaigns = data.map((campaign: any) => {
                const startDate = campaign.start_time ? new Date(campaign.start_time) : null;
                const endDate = campaign.end_time ? new Date(campaign.end_time) : null;

                let dateString = '';
                if (startDate && endDate && startDate.toDateString() !== endDate.toDateString()) {
                    dateString = `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`;
                } else if (startDate) {
                    dateString = startDate.toLocaleDateString('vi-VN');
                }

                return {
                    id: campaign.id,
                    name: campaign.name || 'Không có tên',
                    hospital: campaign.hospital?.hospital_name || campaign.hospital?.full_name || 'Chưa xác định',
                    hospital_id: campaign.hospital_id,
                    date: dateString || 'Chưa cập nhật',
                    start_time: campaign.start_time,
                    end_time: campaign.end_time,
                    status: statusMap[campaign.status] || 'Sắp diễn ra',
                    participants: campaign.appointments?.length || 0,
                    target: campaign.target_units || 0,
                    city: campaign.city || 'Chưa cập nhật',
                    district: campaign.district || '',
                    type: campaign.type || 'Cộng đồng',
                    rawStatus: campaign.status
                };
            });

            setCampaigns(formattedCampaigns);
        } catch (err: any) {
            console.error('Error fetching campaigns:', err);
            setError(err.message || 'Không thể tải dữ liệu chiến dịch');
        } finally {
            setLoading(false);
        }
    };

    const fetchHospitals = async () => {
        try {
            const data = await hospitalService.getAll();
            setHospitals(data);
        } catch (err) {
            console.error('Error fetching hospitals:', err);
        }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchHospitals();
    }, []);

    const activeCampaigns = campaigns.filter(c => c.status === "Đang diễn ra").length;
    const totalParticipants = campaigns.reduce((acc, c) => acc + (c.participants || 0), 0);
    const avgCompletion = campaigns.length > 0
        ? Math.round(campaigns.reduce((acc, c) => acc + ((c.participants || 0) / (c.target || 1)), 0) / campaigns.length * 100)
        : 0;

    const formatNumber = (num: number) => {
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const [newCampaign, setNewCampaign] = useState({
        name: "",
        hospital_id: "",
        start_time: "",
        end_time: "",
        target_units: "",
        city: "",
        district: "",
        type: "Định kỳ",
        status: "draft"
    });

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.hospital.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "Tất cả trạng thái" || campaign.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
    const paginatedCampaigns = filteredCampaigns.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleEdit = (campaign: any) => {
        setNewCampaign({
            name: campaign.name,
            hospital_id: campaign.hospital_id,
            start_time: campaign.start_time ? new Date(campaign.start_time).toISOString().split('T')[0] : "",
            end_time: campaign.end_time ? new Date(campaign.end_time).toISOString().split('T')[0] : "",
            target_units: campaign.target.toString(),
            city: campaign.city || "",
            district: campaign.district || "",
            type: campaign.type || "Định kỳ",
            status: campaign.rawStatus || "draft"
        });
        setEditingId(campaign.id);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
        setActiveMenuId(null);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setLoading(true);
            await campaignService.deleteCampaign(itemToDelete);
            toast.success("Xóa chiến dịch thành công");
            fetchCampaigns();
        } catch (err: any) {
            toast.error("Xóa thất bại: " + err.message);
        } finally {
            setLoading(false);
            setItemToDelete(null);
        }
    };

    const handleAddCampaign = async () => {
        setInputError(null);
        if (!newCampaign.name || !newCampaign.hospital_id) {
            setInputError("Vui lòng nhập tên chiến dịch và chọn bệnh viện");
            return;
        }

        const target = parseInt(newCampaign.target_units);
        if (isNaN(target) || target <= 0) {
            setInputError("Mục tiêu phải là số nguyên dương");
            return;
        }

        if (!newCampaign.city.trim()) {
            setInputError("Tỉnh/Thành phố không được để trống");
            return;
        }

        if (!newCampaign.start_time) {
            setInputError("Vui lòng chọn ngày bắt đầu");
            return;
        }

        try {
            setLoading(true);
            const campaignData = {
                name: newCampaign.name,
                hospital_id: newCampaign.hospital_id,
                start_time: new Date(newCampaign.start_time).toISOString(),
                end_time: newCampaign.end_time ? new Date(newCampaign.end_time).toISOString() : new Date(newCampaign.start_time).toISOString(),
                target_units: target,
                city: newCampaign.city,
                district: newCampaign.district,
                type: newCampaign.type,
                status: newCampaign.status
            };

            if (editingId) {
                await campaignService.updateCampaign(editingId, campaignData);
                toast.success("Cập nhật chiến dịch thành công");
            } else {
                await campaignService.createCampaign(campaignData);
                toast.success("Tạo chiến dịch thành công");
            }

            setIsModalOpen(false);
            setEditingId(null);
            fetchCampaigns();
        } catch (err: any) {
            toast.error("Thao tác thất bại: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setInputError(null);
        setNewCampaign({
            name: "",
            hospital_id: "",
            start_time: "",
            end_time: "",
            target_units: "",
            city: "",
            district: "",
            type: "Định kỳ",
            status: "draft"
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Quản lý chiến dịch</h2>
                    <p className="text-gray-500 text-sm">Theo dõi và quản lý các hoạt động hiến máu trên toàn hệ thống.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-[#0065FF] hover:bg-[#0052cc] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#0065FF]/20"
                >
                    <Plus className="w-5 h-5" />
                    Tạo chiến dịch mới
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Chiến dịch đang chạy</p>
                        <p className="text-xl font-bold text-[#120e1b]">{activeCampaigns}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Tổng lượt đăng ký</p>
                        <p className="text-xl font-bold text-[#120e1b]">{formatNumber(totalParticipants)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Mục tiêu hoàn thành</p>
                        <p className="text-xl font-bold text-[#120e1b]">{avgCompletion}%</p>
                    </div>
                </div>
            </div>

            {/* Table & Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chiến dịch, bệnh viện..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-colors font-medium">
                            <Filter className="w-4 h-4" />
                            Bộ lọc
                        </button>
                        <select
                            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-colors font-medium outline-none"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                            <option value="Đang diễn ra">Đang diễn ra</option>
                            <option value="Sắp diễn ra">Sắp diễn ra</option>
                            <option value="Đã kết thúc">Đã kết thúc</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Chiến dịch</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Thời gian & Địa điểm</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Tiến độ</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-[#0065FF] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle className="w-12 h-12 text-red-500" />
                                            <p className="text-red-600 font-medium">{error}</p>
                                            <button
                                                onClick={() => fetchCampaigns()}
                                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedCampaigns.length > 0 ? (
                                paginatedCampaigns.map((campaign) => {
                                    const progress = campaign.target > 0
                                        ? Math.min(Math.round((campaign.participants / campaign.target) * 100), 100)
                                        : 0;
                                    return (
                                        <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#120e1b] mb-0.5">{campaign.name}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" /> {campaign.hospital}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-700 flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" /> {campaign.date}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" /> {campaign.city}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5 items-center w-full max-w-[120px] mx-auto">
                                                    <div className="flex justify-between w-full text-[10px] font-bold">
                                                        <span className="text-[#0065FF]">{campaign.participants}/{campaign.target}</span>
                                                        <span className="text-gray-500">{progress}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#0065FF] rounded-full transition-all duration-1000"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${campaign.status === "Đang diễn ra"
                                                    ? "bg-green-100 text-green-700"
                                                    : campaign.status === "Sắp diễn ra"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                    <span className={`size-1.5 rounded-full ${campaign.status === "Đang diễn ra"
                                                        ? "bg-green-600"
                                                        : campaign.status === "Sắp diễn ra"
                                                            ? "bg-blue-600"
                                                            : "bg-gray-600"
                                                        }`}></span>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right relative">
                                                <Popover open={activeMenuId === campaign.id} onOpenChange={(open) => setActiveMenuId(open ? campaign.id : null)}>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 outline-none"
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-40 p-1 rounded-xl shadow-xl border-gray-100 bg-white">
                                                        <button
                                                            onClick={() => handleEdit(campaign)}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0065FF] flex items-center gap-2 rounded-lg transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                            Chỉnh sửa
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(campaign.id)}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                            Xóa
                                                        </button>
                                                    </PopoverContent>
                                                </Popover>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        Không tìm thấy chiến dịch nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-50 flex items-center justify-center bg-white">
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>

            {/* Create/Edit Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-[#120e1b]">
                                {editingId ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                            {inputError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {inputError}
                                </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-700">Tên chiến dịch</label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                    placeholder="Nhập tên chiến dịch..."
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-700">Bệnh viện tổ chức</label>
                                <select
                                    value={newCampaign.hospital_id}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, hospital_id: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                >
                                    <option value="">Chọn bệnh viện...</option>
                                    {hospitals.map(h => (
                                        <option key={h.id} value={h.id}>{h.hospital_name || h.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={newCampaign.start_time}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, start_time: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={newCampaign.end_time}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, end_time: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Tỉnh/Thành phố</label>
                                    <input
                                        type="text"
                                        value={newCampaign.city}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, city: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                        placeholder="VD: TP. Hồ Chí Minh"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Mục tiêu (lượt)</label>
                                    <input
                                        type="number"
                                        value={newCampaign.target_units}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, target_units: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Trạng thái</label>
                                    <select
                                        value={newCampaign.status}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                    >
                                        <option value="draft">Sắp diễn ra (Nháp)</option>
                                        <option value="active">Đang diễn ra</option>
                                        <option value="ended">Đã kết thúc</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Loại chiến dịch</label>
                                    <select
                                        value={newCampaign.type}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0065FF]/20 focus:border-[#0065FF] transition-all"
                                    >
                                        <option value="Khẩn cấp">Khẩn cấp</option>
                                        <option value="Định kỳ">Định kỳ</option>
                                        <option value="Lễ hội">Lễ hội</option>
                                        <option value="Cộng đồng">Cộng đồng</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-100 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddCampaign}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl bg-[#0065FF] text-white font-bold shadow-lg shadow-[#0065FF]/20 hover:bg-[#0052cc] transition-all disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : (editingId ? "Cập nhật" : "Tạo chiến dịch")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa chiến dịch này không? Hành động này không thể hoàn tác."
                onConfirm={confirmDelete}
                confirmText="Xóa chiến dịch"
                variant="destructive"
            />
        </div>
    );
}
