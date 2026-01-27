"use client";

import { useState, useEffect } from "react";
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
    X,
    Loader2
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { useAuth } from "@/context/AuthContext";
import { voucherService } from "@/services/voucher.service";

// Define reward categories
type Category = "all" | "food" | "shopping" | "health" | "history";

// Define reward item type
interface RewardItem {
    id: string; // Changed from number to string for DB ID
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

// Helper to determine category and style based on partner name (for demo purposes if DB lacks category)
const getCategoryAndStyle = (name: string, index: number) => {
    const styles = [
        { category: "food", icon: Coffee, color: "text-[#6324eb]", gradient: "from-[#6324eb]/10" },
        { category: "shopping", icon: ShoppingBag, color: "text-green-600", gradient: "from-green-500/10" },
        { category: "health", icon: Activity, color: "text-blue-500", gradient: "from-blue-500/10" },
        { category: "food", icon: Pizza, color: "text-orange-500", gradient: "from-orange-500/10" },
        { category: "shopping", icon: Film, color: "text-[#6324eb]", gradient: "from-[#6324eb]/10" },
        { category: "shopping", icon: Monitor, color: "text-gray-500", gradient: "from-red-500/10" },
    ];
    // Deterministic selection
    const style = styles[index % styles.length];
    const IconComponent = style.icon;

    return {
        category: style.category as "food" | "shopping" | "health",
        icon: <IconComponent className={`w-8 h-8 ${style.color}`} />,
        iconColor: style.color,
        gradientColor: style.gradient,
        badge: index === 0 ? "PHỔ BIẾN" : undefined
    };
};

// History data (Static for now as history API isn't ready)
const historyData: HistoryItem[] = [
    { id: 1, name: "Coffee Bean & Co.", points: 300, date: "22/01/2026", status: "success" },
    { id: 2, name: "Trung Nguyên Legend", points: 450, date: "15/01/2026", status: "success" },
    { id: 3, name: "Grab (50k)", points: 2000, date: "10/01/2026", status: "cancelled" },
    { id: 4, name: "Pharmacity", points: 1200, date: "05/01/2026", status: "pending" },
    { id: 5, name: "Bách Hóa Xanh", points: 800, date: "28/12/2025", status: "success" },
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
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Category>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [loadingRewards, setLoadingRewards] = useState(true);

    // Fetch real points or default to 0
    const userPoints = user?.profile?.current_points || 0;

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                setLoadingRewards(true);
                const data = await voucherService.getAll();

                // Transform DB data to UI format
                const formattedRewards: RewardItem[] = data.map((v, index) => {
                    const style = getCategoryAndStyle(v.partner_name || "Unknown", index);
                    return {
                        id: v.id,
                        name: v.partner_name || "Voucher Ưu Đãi",
                        description: `Voucher ưu đãi hấp dẫn từ ${v.partner_name}. Áp dụng tại toàn bộ hệ thống.`,
                        points: v.point_cost || 0,
                        category: style.category,
                        icon: style.icon,
                        iconColor: style.iconColor,
                        gradientColor: style.gradientColor,
                        badge: style.badge
                    };
                });

                setRewards(formattedRewards);
            } catch (error) {
                console.error("Failed to fetch rewards:", error);
            } finally {
                setLoadingRewards(false);
            }
        };

        fetchRewards();
    }, []);

    // Filter rewards based on active tab and search query
    const filteredRewards = rewards.filter((reward) => {
        const matchesCategory = activeTab === "all" || activeTab === "history" || reward.category === activeTab;
        const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reward.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Filter history based on search query
    const filteredHistory = historyData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRedeem = (reward: RewardItem) => {
        if (userPoints < reward.points) {
            alert("Bạn không đủ điểm để đổi quà này!");
            return;
        }
        if (confirm(`Bạn có chắc muốn đổi ${reward.points} điểm lấy ưu đãi từ ${reward.name}?`)) {
            // Future integration: Call redeem API here
            alert("Đổi quà thành công! Mã voucher đã được gửi vào ví của bạn.");
        }
    };

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
                                    {loadingRewards ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Loader2 className="w-10 h-10 text-[#6324eb] animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filteredRewards.map((reward) => (
                                                <div
                                                    key={reward.id}
                                                    className={`flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all group ${userPoints < reward.points ? "opacity-90" : "hover:shadow-lg cursor-pointer" // Opacity logic changed from disabled
                                                        }`}
                                                >
                                                    <div className={`aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden ${userPoints < reward.points ? "grayscale" : ""}`}>
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${reward.gradientColor} to-transparent ${userPoints < reward.points ? "opacity-30" : "opacity-50"}`}></div>
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
                                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow line-clamp-2">{reward.description}</p>
                                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                                <span className={`font-black text-xl ${userPoints < reward.points ? "text-gray-400" : "text-[#6324eb]"}`}>
                                                                    {reward.points.toLocaleString()} pts
                                                                </span>
                                                            </div>
                                                            {userPoints < reward.points ? (
                                                                <button disabled className="bg-gray-200 dark:bg-[#3d335a] text-gray-400 font-bold py-2 px-4 rounded-lg text-xs cursor-not-allowed">
                                                                    Thiếu {(reward.points - userPoints).toLocaleString()} pts
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRedeem(reward)}
                                                                    className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95"
                                                                >
                                                                    Đổi ngay
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {!loadingRewards && filteredRewards.length === 0 && (
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
