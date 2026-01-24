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

    const filteredCampaigns = CAMPAIGNS.filter(campaign => {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Quản lý chiến dịch</h2>
                    <p className="text-gray-500 text-sm">Theo dõi và quản lý các hoạt động hiến máu trên toàn hệ thống.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#6324eb] hover:bg-[#501ac2] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#6324eb]/20">
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
                        <p className="text-xl font-bold text-[#120e1b]">12</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Tổng lượt đăng ký</p>
                        <p className="text-xl font-bold text-[#120e1b]">1.4k</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Mục tiêu hoàn thành</p>
                        <p className="text-xl font-bold text-[#120e1b]">85%</p>
                    </div>
                </div>
            </div>

            {/* Table & Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

                <div className="overflow-x-auto">
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
                                    const progress = Math.min(Math.round((campaign.participants / campaign.target) * 100), 100);
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
                                            <td className="px-6 py-5 text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
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

                <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                        Hiển thị {filteredCampaigns.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredCampaigns.length)} trên tổng số {filteredCampaigns.length} chiến dịch
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold transition-all
                                ${currentPage === 1 ? "text-gray-400 bg-gray-50 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50 hover:text-[#6324eb]"}`}
                        >
                            Trước
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all
                                    ${currentPage === page
                                        ? "bg-[#6324eb] text-white border-[#6324eb]"
                                        : "border-gray-200 text-[#120e1b] hover:bg-gray-50"}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold transition-all
                                ${currentPage === totalPages ? "text-gray-400 bg-gray-50 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50 hover:text-[#6324eb]"}`}
                        >
                            Tiếp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Internal icons helper for readability
const Building2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
);
