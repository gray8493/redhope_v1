"use client";

import { useState } from "react";
import {
    Wallet,
    Heart,
    Users,
    Search,
    Coffee,
    ShoppingBag,
    Activity,
    Clock,
    Ticket,
    Pizza,
    Film,
    Monitor,
    Check,
    X
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

// Define reward categories
type Category = "all" | "food" | "shopping" | "health" | "history";

// Define reward item type
interface RewardItem {
    id: number;
    name: string;
    description: string;
    points: number;
    category: "food" | "shopping" | "health";
    icon: React.ReactNode;
    iconColor: string;
    gradientColor: string;
    badge?: string;
    disabled?: boolean;
}

// Define history item type
interface HistoryItem {
    id: number;
    name: string;
    points: number;
    date: string;
    status: "success" | "pending" | "cancelled";
}

// Rewards data
const rewardsData: RewardItem[] = [
    {
        id: 1,
        name: "Coffee Bean & Co.",
        description: "Thưởng thức bất kỳ đồ uống cỡ lớn nào. Áp dụng tại tất cả cửa hàng.",
        points: 300,
        category: "food",
        icon: <Coffee className="w-8 h-8 text-[#6324eb]" />,
        iconColor: "text-[#6324eb]",
        gradientColor: "from-[#6324eb]/10",
        badge: "PHỔ BIẾN"
    },
    {
        id: 2,
        name: "Green Grocer",
        description: "Voucher 200k cho rau củ quả tươi hoặc thực phẩm hữu cơ.",
        points: 800,
        category: "shopping",
        icon: <ShoppingBag className="w-8 h-8 text-green-600" />,
        iconColor: "text-green-600",
        gradientColor: "from-green-500/10"
    },
    {
        id: 3,
        name: "Zenith Spa",
        description: "Liệu trình massage thư giãn 30 phút hoặc chăm sóc da mặt.",
        points: 1200,
        category: "health",
        icon: <Activity className="w-8 h-8 text-blue-500" />,
        iconColor: "text-blue-500",
        gradientColor: "from-blue-500/10"
    },
    {
        id: 4,
        name: "TechHaven",
        description: "Thẻ quà tặng 500k cho phụ kiện công nghệ.",
        points: 2000,
        category: "shopping",
        icon: <Monitor className="w-8 h-8 text-gray-500" />,
        iconColor: "text-gray-500",
        gradientColor: "from-red-500/10",
        disabled: true
    },
    {
        id: 5,
        name: "Pizza Palace",
        description: "Một pizza cỡ vừa với 3 loại topping tùy chọn.",
        points: 450,
        category: "food",
        icon: <Pizza className="w-8 h-8 text-orange-500" />,
        iconColor: "text-orange-500",
        gradientColor: "from-orange-500/10"
    },
    {
        id: 6,
        name: "Starlight Cinemas",
        description: "Một vé xem phim 2D tiêu chuẩn.",
        points: 550,
        category: "food",
        icon: <Film className="w-8 h-8 text-[#6324eb]" />,
        iconColor: "text-[#6324eb]",
        gradientColor: "from-[#6324eb]/10"
    }
];

// History data
const historyData: HistoryItem[] = [
    { id: 1, name: "Coffee Bean & Co.", points: 300, date: "22/01/2026", status: "success" },
    { id: 2, name: "Pizza Palace", points: 450, date: "15/01/2026", status: "success" },
    { id: 3, name: "TechHaven", points: 2000, date: "10/01/2026", status: "cancelled" },
    { id: 4, name: "Zenith Spa", points: 1200, date: "05/01/2026", status: "pending" },
    { id: 5, name: "Green Grocer", points: 800, date: "28/12/2025", status: "success" },
];

// Tab configuration
const tabs: { key: Category; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "food", label: "Ăn uống" },
    { key: "shopping", label: "Mua sắm" },
    { key: "health", label: "Sức khỏe" },
    { key: "history", label: "Lịch sử đổi" },
];

export default function RewardsPage() {
    const [activeTab, setActiveTab] = useState<Category>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const userPoints = 1250;

    // Filter rewards based on active tab and search query
    const filteredRewards = rewardsData.filter((reward) => {
        const matchesCategory = activeTab === "all" || activeTab === "history" || reward.category === activeTab;
        const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reward.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Filter history based on search query
    const filteredHistory = historyData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1200px] flex-1 px-4 md:px-10">
                            {/* Hero Section */}
                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                                <div className="flex min-w-72 flex-col gap-3">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Đổi quà tri ân</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Bạn có <span className="font-bold text-[#6324eb]">{userPoints.toLocaleString()} điểm</span> khả dụng. Cảm ơn bạn đã chung tay cứu người!
                                    </p>
                                </div>
                                <button className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white text-sm font-bold leading-normal hover:bg-[#dcd6e8] dark:hover:bg-[#3d335a] transition-all">
                                    <span className="truncate">Cách tích điểm</span>
                                </button>
                            </div>

                            {/* Stats Overview */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-2 text-[#6324eb]">
                                        <Wallet className="w-5 h-5" />
                                        <p className="text-[#120e1b] dark:text-white text-base font-medium">Điểm hiện có</p>
                                    </div>
                                    <p className="text-[#120e1b] dark:text-white tracking-light text-3xl font-black leading-tight">{userPoints.toLocaleString()}</p>
                                </div>
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-2 text-[#6324eb]">
                                        <Heart className="w-5 h-5" />
                                        <p className="text-[#120e1b] dark:text-white text-base font-medium">Tổng lần hiến</p>
                                    </div>
                                    <p className="text-[#120e1b] dark:text-white tracking-light text-3xl font-black leading-tight">12</p>
                                </div>
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-2 text-[#6324eb]">
                                        <Users className="w-5 h-5" />
                                        <p className="text-[#120e1b] dark:text-white text-base font-medium">Người được cứu</p>
                                    </div>
                                    <p className="text-[#120e1b] dark:text-white tracking-light text-3xl font-black leading-tight">36</p>
                                </div>
                            </div>

                            {/* Tabs and Search */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d7d0e7] dark:border-[#2d2545] mb-8 pb-1">
                                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap px-2 transition-colors ${activeTab === tab.key
                                                ? "border-b-[#6324eb] text-[#120e1b] dark:text-white"
                                                : "border-b-transparent text-[#654d99] dark:text-[#a594c9] hover:text-[#6324eb]"
                                                }`}
                                        >
                                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">{tab.label}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="w-full md:w-80 pb-2">
                                    <div className="flex w-full items-center rounded-lg h-10 overflow-hidden border border-[#ebe7f3] dark:border-[#2d263d] bg-white dark:bg-[#1c162e]">
                                        <div className="pl-3 text-[#654d99]">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="w-full bg-transparent border-none text-sm text-[#120e1b] dark:text-white placeholder:text-[#654d99] px-3 focus:outline-none focus:ring-0"
                                            placeholder="Tìm kiếm ưu đãi..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content based on active tab */}
                            {activeTab === "history" ? (
                                /* History Table */
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#ebe7f3] dark:border-[#2d263d] bg-[#f6f6f8] dark:bg-[#251e36]">
                                                    <th className="text-left py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Ưu đãi</th>
                                                    <th className="text-left py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Điểm</th>
                                                    <th className="text-left py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Ngày đổi</th>
                                                    <th className="text-left py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHistory.map((item) => (
                                                    <tr key={item.id} className="border-b border-[#ebe7f3] dark:border-[#2d263d] last:border-b-0 hover:bg-[#f6f6f8] dark:hover:bg-[#251e36] transition-colors">
                                                        <td className="py-4 px-6">
                                                            <span className="font-bold text-[#120e1b] dark:text-white">{item.name}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-[#6324eb] font-bold">-{item.points} pts</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-[#654d99] dark:text-[#a594c9]">{item.date}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            {item.status === "success" && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                                                                    <Check className="w-3 h-3" /> Thành công
                                                                </span>
                                                            )}
                                                            {item.status === "pending" && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                                                    <Clock className="w-3 h-3" /> Đang xử lý
                                                                </span>
                                                            )}
                                                            {item.status === "cancelled" && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                                                                    <X className="w-3 h-3" /> Đã hủy
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredHistory.length === 0 && (
                                        <div className="py-12 text-center text-[#654d99] dark:text-[#a594c9]">
                                            Không tìm thấy lịch sử đổi quà
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Marketplace Grid */
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredRewards.map((reward) => (
                                            <div
                                                key={reward.id}
                                                className={`flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all group ${reward.disabled ? "opacity-70" : "hover:shadow-lg cursor-pointer"
                                                    }`}
                                            >
                                                <div className={`aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden ${reward.disabled ? "grayscale" : ""}`}>
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${reward.gradientColor} to-transparent ${reward.disabled ? "opacity-30" : "opacity-50"}`}></div>
                                                    <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                                        {reward.icon}
                                                    </div>
                                                    {reward.badge && (
                                                        <span className="absolute top-3 right-3 bg-white/90 dark:bg-[#1c162e]/90 px-2 py-1 rounded text-[10px] font-bold text-[#6324eb] border border-[#6324eb]/20">
                                                            {reward.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-5 flex flex-col grow">
                                                    <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">{reward.name}</h3>
                                                    <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">{reward.description}</p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                            <span className={`font-black text-xl ${reward.disabled ? "text-gray-400" : "text-[#6324eb]"}`}>
                                                                {reward.points.toLocaleString()} pts
                                                            </span>
                                                        </div>
                                                        {reward.disabled ? (
                                                            <button className="bg-gray-200 dark:bg-[#3d335a] text-gray-400 font-bold py-2 px-4 rounded-lg text-xs cursor-not-allowed">
                                                                Thiếu {(reward.points - userPoints).toLocaleString()} pts
                                                            </button>
                                                        ) : (
                                                            <button className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95">
                                                                Đổi ngay
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {filteredRewards.length === 0 && (
                                        <div className="py-12 text-center text-[#654d99] dark:text-[#a594c9]">
                                            Không tìm thấy ưu đãi trong danh mục này
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>
        </div>
    );
}
