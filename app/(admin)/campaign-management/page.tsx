"use client";

import React, { useState } from 'react';
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
    AlertCircle
} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
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

const CAMPAIGNS = [
    {
        id: 1,
        name: "Giọt máu hồng - Xuân 2024",
        hospital: "Bệnh viện Chợ Rẫy",
        date: "24/02/2024 - 28/02/2024",
        status: "Đang diễn ra",
        participants: 156,
        target: 200,
        location: "Hồ Chí Minh",
        type: "Khẩn cấp"
    },
    {
        id: 2,
        name: "Ngày hội Hiến máu Sinh viên",
        hospital: "Bệnh viện Đại học Y Dược",
        date: "15/03/2024",
        status: "Sắp diễn ra",
        participants: 0,
        target: 500,
        location: "Hồ Chí Minh",
        type: "Định kỳ"
    },
    {
        id: 3,
        name: "Chủ nhật Đỏ - Lần thứ XVI",
        hospital: "Viện Huyết học - Truyền máu TW",
        date: "10/01/2024",
        status: "Đã kết thúc",
        participants: 1240,
        target: 1000,
        location: "Hà Nội",
        type: "Lễ hội"
    },
    {
        id: 4,
        name: "Hiến máu cứu người - Tết 2024",
        hospital: "Bệnh viện Nhân Dân 115",
        date: "05/02/2024",
        status: "Đã kết thúc",
        participants: 85,
        target: 100,
        location: "Hồ Chí Minh",
        type: "Cộng đồng"
    },
    {
        id: 5,
        name: "Lễ hội Xuân Hồng 2024",
        hospital: "Viện Huyết học - Truyền máu TW",
        date: "18/02/2024",
        status: "Đã kết thúc",
        participants: 850,
        target: 1000,
        location: "Hà Nội",
        type: "Lễ hội"
    },
    {
        id: 6,
        name: "Trao đời sự sống",
        hospital: "Bệnh viện Bạch Mai",
        date: "20/03/2024",
        status: "Sắp diễn ra",
        participants: 12,
        target: 150,
        location: "Hà Nội",
        type: "Khẩn cấp"
    },
    {
        id: 7,
        name: "Blouse trắng - Trái tim hồng",
        hospital: "Bệnh viện Đại học Y Hà Nội",
        date: "27/02/2024",
        status: "Đã kết thúc",
        participants: 320,
        target: 300,
        location: "Hà Nội",
        type: "Định kỳ"
    },
    {
        id: 8,
        name: "Giọt máu nghĩa tình",
        hospital: "Bệnh viện Đa khoa Đà Nẵng",
        date: "10/04/2024",
        status: "Sắp diễn ra",
        participants: 5,
        target: 200,
        location: "Đà Nẵng",
        type: "Cộng đồng"
    },
    {
        id: 9,
        name: "Hành trình Đỏ - Kết nối dòng máu Việt",
        hospital: "Bệnh viện Huyết học - Truyền máu Cần Thơ",
        date: "30/04/2024",
        status: "Sắp diễn ra",
        participants: 0,
        target: 500,
        location: "Cần Thơ",
        type: "Lễ hội"
    },
    {
        id: 10,
        name: "Ngày hội hiến máu tình nguyện đợt 1",
        hospital: "Bệnh viện Quân Y 103",
        date: "15/01/2024",
        status: "Đã kết thúc",
        participants: 180,
        target: 200,
        location: "Hà Nội",
        type: "Định kỳ"
    }
];

export default function CampaignManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tất cả trạng thái");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;
    const [inputError, setInputError] = useState<string | null>(null);

    const [campaigns, setCampaigns] = useState(CAMPAIGNS);

    const activeCampaigns = campaigns.filter(c => c.status === "Đang diễn ra").length;
    const totalParticipants = campaigns.reduce((acc, c) => acc + (c.participants || 0), 0);
    const avgCompletion = campaigns.length > 0
        ? Math.round(campaigns.reduce((acc, c) => acc + ((c.participants || 0) / (c.target || 1)), 0) / campaigns.length * 100)
        : 0;

    const formatNumber = (num: number) => {
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [newCampaign, setNewCampaign] = useState({
        name: "",
        hospital: "",
        date: "",
        target: "",
        location: "",
        type: "Khẩn cấp",
        status: "Sắp diễn ra"
    });

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.hospital.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "Tất cả trạng thái" || campaign.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);

    // Get current items
    const paginatedCampaigns = filteredCampaigns.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset pagination when filters change
    React.useEffect(() => {
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
            hospital: campaign.hospital,
            date: campaign.date,
            target: campaign.target.toString(),
            location: campaign.location,
            type: campaign.type,
            status: campaign.status
        });
        setEditingId(campaign.id);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này không?")) {
            setCampaigns(campaigns.filter(c => c.id !== id));
        }
        setActiveMenuId(null);
    };

    const handleAddCampaign = () => {
        setInputError(null);
        if (!newCampaign.name || !newCampaign.hospital) {
            setInputError("Vui lòng nhập tên chiến dịch và bệnh viện");
            return;
        }

        const target = parseInt(newCampaign.target);
        if (isNaN(target) || target <= 0) {
            setInputError("Mục tiêu phải là số nguyên dương");
            return;
        }

        if (!newCampaign.location.trim()) {
            setInputError("Địa điểm không được để trống");
            return;
        }

        // Simple date validation (assuming DD/MM/YYYY or ISO)
        // Ideally use a date picker, but for text input:
        if (!newCampaign.date) {
            setInputError("Vui lòng chọn ngày");
            return;
        }

        // Validate Date (Single or Range)
        const validateDate = (dateStr: string) => {
            const parts = dateStr.split('/');
            if (parts.length !== 3) return false;
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);

            if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
            if (month < 1 || month > 12) return false;

            const date = new Date(year, month - 1, day);
            return date.getDate() === day &&
                date.getMonth() === month - 1 &&
                date.getFullYear() === year;
        };

        const dateInput = newCampaign.date.trim();
        let validDate = false;

        // Pattern 1: Single Date (DD/MM/YYYY)
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) {
            validDate = validateDate(dateInput);
        }
        // Pattern 2: Date Range (DD/MM/YYYY - DD/MM/YYYY)
        else if (dateInput.includes('-')) {
            const parts = dateInput.split('-').map(s => s.trim());
            if (parts.length === 2 &&
                /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(parts[0]) &&
                /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(parts[1])) {
                validDate = validateDate(parts[0]) && validateDate(parts[1]);
            }
        }

        if (!validDate) {
            setInputError("Ngày không hợp lệ. Vui lòng nhập DD/MM/YYYY hoặc khoảng thời gian (VD: 24/02/2024 - 28/02/2024)");
            return;
        }

        if (editingId) {
            // Update existing campaign
            setCampaigns(campaigns.map(campaign =>
                campaign.id === editingId
                    ? {
                        ...campaign,
                        name: newCampaign.name,
                        hospital: newCampaign.hospital,
                        date: newCampaign.date,
                        target: parseInt(newCampaign.target) || 0,
                        location: newCampaign.location,
                        type: newCampaign.type,
                        status: newCampaign.status
                    }
                    : campaign
            ));
        } else {
            // Create new campaign with unique numeric ID
            const maxId = campaigns.length > 0
                ? Math.max(...campaigns.map(c => Number(c.id)))
                : 0;

            const campaign = {
                id: maxId + 1,
                name: newCampaign.name,
                hospital: newCampaign.hospital,
                date: newCampaign.date || new Date().toLocaleDateString('vi-VN'),
                status: newCampaign.status,
                participants: 0,
                target: parseInt(newCampaign.target) || 0,
                location: newCampaign.location,
                type: newCampaign.type
            };
            setCampaigns([campaign, ...campaigns]);
        }

        setIsModalOpen(false);
        setEditingId(null);
        setNewCampaign({
            name: "",
            hospital: "",
            date: "",
            target: "",
            location: "",
            type: "Khẩn cấp",
            status: "Sắp diễn ra"
        });
    };

    const openCreateModal = () => {
        setEditingId(null);
        setInputError(null); // Clear previous errors
        setNewCampaign({
            name: "",
            hospital: "",
            date: "",
            target: "",
            location: "",
            type: "Khẩn cấp",
            status: "Sắp diễn ra"
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
                    className="flex items-center gap-2 bg-[#6324eb] hover:bg-[#501ac2] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#6324eb]/20"
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
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
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

                <div className="overflow-x-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Chiến dịch</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Thời gian & Địa điểm</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Tiến độ</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedCampaigns.length > 0 ? (
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
                                                        <MapPin className="w-4 h-4 text-gray-400" /> {campaign.location}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5 items-center w-full max-w-[120px] mx-auto">
                                                    <div className="flex justify-between w-full text-[10px] font-bold">
                                                        <span className="text-[#6324eb]">{campaign.participants}/{campaign.target}</span>
                                                        <span className="text-gray-500">{progress}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#6324eb] rounded-full transition-all duration-1000"
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
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#6324eb] flex items-center gap-2 rounded-lg transition-colors"
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

                <div className="p-6 border-t border-gray-50 flex items-center justify-center mt-auto">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        <div className="p-6 flex flex-col gap-4">
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
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
                                    placeholder="Nhập tên chiến dịch..."
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-700">Đơn vị tổ chức (Bệnh viện)</label>
                                <input
                                    type="text"
                                    value={newCampaign.hospital}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, hospital: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
                                    placeholder="VD: Bệnh viện Chợ Rẫy"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Thời gian</label>
                                    <input
                                        type="text"
                                        value={newCampaign.date}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
                                        placeholder="DD/MM/YYYY hoặc khoảng thời gian..."
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Mục tiêu (lượt)</label>
                                    <input
                                        type="number"
                                        value={newCampaign.target}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, target: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-700">Địa điểm</label>
                                <input
                                    type="text"
                                    value={newCampaign.location}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
                                    placeholder="Nhập địa điểm..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Trạng thái</label>
                                    <select
                                        value={newCampaign.status}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
                                    >
                                        <option value="Sắp diễn ra">Sắp diễn ra</option>
                                        <option value="Đang diễn ra">Đang diễn ra</option>
                                        <option value="Đã kết thúc">Đã kết thúc</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-700">Loại chiến dịch</label>
                                    <select
                                        value={newCampaign.type}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] transition-all"
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
                                className="px-5 py-2.5 rounded-xl bg-[#6324eb] text-white font-bold shadow-lg shadow-[#6324eb]/20 hover:bg-[#501ac2] transition-all"
                            >
                                {editingId ? "Cập nhật" : "Tạo chiến dịch"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Internal icons helper for readability
const Building2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
);
