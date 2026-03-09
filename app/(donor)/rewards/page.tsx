"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Wallet,
    Heart,
    Users,
    Search,
    Coffee,
    ShoppingBag,
    Activity,
    Pizza,
    Film,
    Monitor,
    Check,
    X,
    Loader2,
    Gift,
    Copy,
    PartyPopper
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { voucherService } from "@/services/voucher.service";
import { pointService } from "@/services/point.service";
import { QRCodeSVG } from "qrcode.react";


// Define reward categories
type Category = "all" | "food" | "shopping" | "health" | "history";

// Define reward item type
interface RewardItem {
    id: string;
    name: string;
    description: string;
    points: number;
    stock: number;
    category: "food" | "shopping" | "health";
    icon: React.ReactNode;
    iconColor: string;
    gradientColor: string;
    badge?: string;
    disabled?: boolean;
}

// Helper to determine category and style based on partner name
const getCategoryAndStyle = (name: string, index: number) => {
    const styles = [
        { category: "food", icon: Coffee, color: "text-[#0065FF]", gradient: "from-[#0065FF]/10" },
        { category: "shopping", icon: ShoppingBag, color: "text-green-600", gradient: "from-green-500/10" },
        { category: "health", icon: Activity, color: "text-blue-500", gradient: "from-blue-500/10" },
        { category: "food", icon: Pizza, color: "text-orange-500", gradient: "from-orange-500/10" },
        { category: "shopping", icon: Film, color: "text-[#0065FF]", gradient: "from-[#0065FF]/10" },
        { category: "shopping", icon: Monitor, color: "text-gray-500", gradient: "from-red-500/10" },
    ];
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

const tabs: { key: Category; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "food", label: "Ăn uống" },
    { key: "shopping", label: "Mua sắm" },
    { key: "health", label: "Sức khỏe" },
    { key: "history", label: "Lịch sử đổi" },
];

export default function RewardsPage() {
    const { profile, user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Category>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingRewards, setLoadingRewards] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ type: "default" | "destructive" | "success", title: string, description: string } | null>(null);
    const [rewardToRedeem, setRewardToRedeem] = useState<RewardItem | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [successVoucher, setSuccessVoucher] = useState<{ code: string; partnerName: string; points: number } | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const userPoints = profile?.current_points || 0;

    const fetchRewards = useCallback(async () => {
        setLoadingRewards(true);
        try {
            const data = await voucherService.getAll();
            const formattedRewards: RewardItem[] = data
                .filter(v => v.status === 'Active' && v.stock_quantity != null && v.stock_quantity > 0)
                .map((v, index) => {
                    const style = getCategoryAndStyle(v.partner_name || "Unknown", index);
                    return {
                        id: v.id,
                        name: v.partner_name || "Ưu đãi",
                        description: `Voucher giảm giá từ ${v.partner_name || "đối tác"}`,
                        points: v.point_cost || 0,
                        stock: v.stock_quantity || 0,
                        category: style.category,
                        icon: style.icon,
                        iconColor: style.iconColor,
                        gradientColor: style.gradientColor,
                        badge: style.badge
                    };
                });
            setRewards(formattedRewards);
        } catch (error) {
            console.error("Failed to fetch rewards", error);
        } finally {
            setLoadingRewards(false);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        if (!user?.id) return;
        setLoadingHistory(true);
        try {
            const data = await pointService.getRedemptions(user.id);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoadingHistory(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [activeTab, fetchHistory]);

    const filteredRewards = rewards.filter((reward) => {
        if (activeTab === "history") return false;
        const matchesTab = activeTab === "all" ? true : reward.category === activeTab;
        const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reward.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const filteredHistory = history.filter((item) =>
        item.vouchers?.partner_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRedeemClick = (reward: RewardItem) => {
        if (userPoints < reward.points) {
            setAlertMessage({
                type: "destructive",
                title: "Không đủ điểm",
                description: `Bạn cần thêm ${(reward.points - userPoints).toLocaleString()} điểm để đổi phần quà này.`
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setRewardToRedeem(reward);
        setIsConfirmOpen(true);
    };




    const confirmRedeem = async () => {
        if (!rewardToRedeem || !user?.id) return;

        setIsRedeeming(true);
        try {
            const result = await pointService.redeemVoucher(user.id, rewardToRedeem.id);
            const redemptionCode = result?.redemption?.redemption_code || "---";
            setSuccessVoucher({
                code: redemptionCode,
                partnerName: rewardToRedeem.name,
                points: rewardToRedeem.points
            });
            await refreshUser();
            await fetchRewards();
            if (activeTab === "history") fetchHistory();
        } catch (error: any) {
            setAlertMessage({
                type: "destructive",
                title: "Lỗi đổi quà",
                description: error.message || "Đã có lỗi xảy ra vui lòng thử lại sau."
            });
        } finally {
            setIsRedeeming(false);
            setIsConfirmOpen(false);
            setRewardToRedeem(null);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    return (
        <div className="flex h-full w-full flex-row overflow-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
                <TopNav title="Phần thưởng" />

                <main className="flex-1 py-4 md:py-8">
                    <div className="flex flex-col max-w-[1200px] mx-auto w-full px-4 sm:px-5 md:px-10">

                        {alertMessage && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <Alert variant={alertMessage.type === "success" ? "default" : alertMessage.type} className={`${alertMessage.type === 'success' ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/10' : ''}`}>
                                    {alertMessage.type === 'destructive' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4 text-green-600" />}
                                    <AlertTitle>{alertMessage.title}</AlertTitle>
                                    <AlertDescription>
                                        {alertMessage.description}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-between items-end gap-3 mb-4 md:mb-6 text-left">
                            <div className="flex flex-col gap-2 md:gap-3 min-w-0">
                                <h1 className="text-[#120e1b] dark:text-white text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Đổi quà tri ân</h1>
                                <p className="text-blue-600/80 dark:text-blue-400/80 text-sm md:text-base font-normal leading-normal max-w-2xl">
                                    Bạn có <span className="font-bold text-[#0065FF]">{userPoints.toLocaleString()} điểm</span> khả dụng. Cảm ơn bạn đã chung tay cứu người!
                                </p>
                            </div>
                            <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 md:h-10 px-4 md:px-6 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-bold leading-normal hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
                                <span className="truncate">Cách tích điểm</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 md:mb-8 text-left">
                            <div className="flex flex-col min-w-0 gap-1 md:gap-2 rounded-xl p-3 md:p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                <div className="flex items-center gap-1.5 md:gap-2 text-[#0065FF]">
                                    <Wallet className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                    <p className="text-[#120e1b] dark:text-white text-[10px] sm:text-xs md:text-base font-medium truncate">Điểm hiện có</p>
                                </div>
                                <p className="text-[#120e1b] dark:text-white tracking-light text-xl sm:text-2xl md:text-3xl font-black leading-tight truncate">{userPoints.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col min-w-0 gap-1 md:gap-2 rounded-xl p-3 md:p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                <div className="flex items-center gap-1.5 md:gap-2 text-[#0065FF]">
                                    <Heart className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                    <p className="text-[#120e1b] dark:text-white text-[10px] sm:text-xs md:text-base font-medium truncate">Lần hiến máu</p>
                                </div>
                                <p className="text-[#120e1b] dark:text-white tracking-light text-xl sm:text-2xl md:text-3xl font-black leading-tight truncate">2</p>
                            </div>
                            <div className="flex flex-col min-w-0 gap-1 md:gap-2 rounded-xl p-3 md:p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm col-span-2 sm:col-span-1">
                                <div className="flex items-center gap-1.5 md:gap-2 text-[#0065FF]">
                                    <Users className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                    <p className="text-[#120e1b] dark:text-white text-[10px] sm:text-xs md:text-base font-medium truncate">Người được cứu</p>
                                </div>
                                <p className="text-[#120e1b] dark:text-white tracking-light text-xl sm:text-2xl md:text-3xl font-black leading-tight truncate">6</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-b border-slate-200 dark:border-slate-800 mb-4 md:mb-8 pb-1">
                            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Category)} className="w-full md:w-auto">
                                <TabsList className="bg-transparent p-0 h-auto gap-2 overflow-x-auto no-scrollbar justify-start flex-nowrap w-full">
                                    {tabs.map((tab) => (
                                        <TabsTrigger
                                            key={tab.key}
                                            value={tab.key}
                                            className="whitespace-nowrap flex-shrink-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[#0065FF] data-[state=active]:text-[#120e1b] dark:data-[state=active]:text-white rounded-none border-b-[3px] border-transparent pb-[13px] pt-4 px-2 text-slate-500 dark:text-slate-400 text-sm font-bold leading-normal tracking-[0.015em] transition-all appearance-none select-none"
                                        >
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
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

                        {activeTab === "history" ? (
                            <>
                                <div className="hidden md:block bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden">
                                    {loadingHistory ? (
                                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#0065FF]" /></div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-[#ebe7f3] dark:border-[#2d263d] bg-[#f6f6f8] dark:bg-[#251e36]">
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Ưu đãi</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Điểm</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Ngày đổi</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">Mã code</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredHistory.map((item) => (
                                                        <tr key={item.id} className="border-b border-[#ebe7f3] dark:border-[#2d263d] last:border-b-0 hover:bg-[#f6f6f8] dark:hover:bg-[#251e36] transition-colors">
                                                            <td className="py-4 px-6 text-left">
                                                                <span className="font-bold text-[#120e1b] dark:text-white">{item.vouchers?.partner_name}</span>
                                                            </td>
                                                            <td className="py-4 px-6 text-left">
                                                                <span className="text-[#0065FF] font-bold">-{item.vouchers?.point_cost} pts</span>
                                                            </td>
                                                            <td className="py-4 px-6 text-left">
                                                                <span className="text-[#654d99] dark:text-[#a594c9]">{new Date(item.redeemed_at).toLocaleDateString('vi-VN')}</span>
                                                            </td>
                                                            <td className="py-4 px-6 text-left">
                                                                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono font-bold text-[#0065FF] uppercase">
                                                                    {item.redemption_code || '---'}
                                                                </code>
                                                            </td>
                                                            <td className="py-4 px-6 text-left">
                                                                <span className="text-xs text-slate-400">Đã đổi</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredHistory.length === 0 && (
                                                <div className="py-12 text-center text-[#654d99] dark:text-[#a594c9]">
                                                    Không tìm thấy lịch sử đổi quà
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile History Cards */}
                                <div className="md:hidden space-y-4">
                                    {loadingHistory ? (
                                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#0065FF]" /></div>
                                    ) : filteredHistory.length > 0 ? (
                                        filteredHistory.map((item) => (
                                            <div key={item.id} className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-4 shadow-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-[#120e1b] dark:text-white">{item.vouchers?.partner_name}</h3>
                                                        <p className="text-xs text-[#654d99] dark:text-[#a594c9] mt-1">{new Date(item.redeemed_at).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <span className="text-[#0065FF] font-black">-{item.vouchers?.point_cost} pts</span>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono font-bold text-[#0065FF] uppercase">
                                                        {item.redemption_code || '---'}
                                                    </code>
                                                    <span className="text-xs text-slate-400">Đã đổi</span>

                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-[#654d99] dark:text-[#a594c9] bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d]">
                                            Không tìm thấy lịch sử đổi quà
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {loadingRewards ? (
                                    <div className="flex justify-center items-center py-20">
                                        <Loader2 className="w-10 h-10 text-[#0065FF] animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 text-left">
                                        {filteredRewards.map((reward) => (
                                            <div
                                                key={reward.id}
                                                className={`flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all group ${userPoints < reward.points ? "opacity-90" : "hover:shadow-lg"}`}
                                            >
                                                <div className={`aspect-[3/2] sm:aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-4 md:p-8 relative overflow-hidden ${userPoints < reward.points ? "grayscale" : ""}`}>
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${reward.gradientColor} to-transparent ${userPoints < reward.points ? "opacity-30" : "opacity-50"}`}></div>
                                                    <div className="z-10 bg-white dark:bg-[#1c162e] p-3 md:p-4 rounded-full shadow-md">
                                                        {reward.icon}
                                                    </div>
                                                    {reward.badge && (
                                                        <Badge variant="secondary" className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 dark:bg-[#1c162e]/90 text-[#0065FF] border border-[#0065FF]/20 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1">
                                                            {reward.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="p-3 md:p-5 flex flex-col grow">
                                                    <h3 className="text-[#120e1b] dark:text-white text-sm md:text-lg font-bold line-clamp-1">{reward.name}</h3>
                                                    <p className="text-xs md:text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-2 md:mb-4 grow line-clamp-2 hidden sm:block">{reward.description}</p>
                                                    <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] md:text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                            <span className={`font-black text-base md:text-xl ${userPoints < reward.points ? "text-gray-400" : "text-[#0065FF]"}`}>
                                                                {reward.points.toLocaleString()} pts
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 font-medium">Còn lại: {reward.stock}</span>
                                                        </div>
                                                        {userPoints < reward.points ? (
                                                            <button disabled className="bg-gray-200 dark:bg-[#3d335a] text-gray-400 font-bold py-1.5 md:py-2 px-2 md:px-4 rounded-lg text-[10px] md:text-xs cursor-not-allowed">
                                                                Thiếu {(reward.points - userPoints).toLocaleString()}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRedeemClick(reward)}
                                                                className="bg-[#0065FF] hover:bg-[#0065FF]/90 text-white font-bold py-1.5 md:py-2 px-3 md:px-6 rounded-lg text-xs md:text-sm transition-transform active:scale-95"
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

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="bg-white dark:bg-[#1c162e] border-[#ebe7f3] dark:border-[#2d263d]">
                    <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="text-[#120e1b] dark:text-white">Xác nhận đổi quà</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#654d99] dark:text-[#a594c9]">
                            Bạn có chắc muốn dùng <span className="font-bold text-[#0065FF]">{rewardToRedeem?.points} điểm</span> để đổi lấy ưu đãi từ <span className="font-bold text-[#120e1b] dark:text-white">{rewardToRedeem?.name}</span> không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRedeeming} className="bg-[#f6f6f8] dark:bg-[#2d263d] text-[#120e1b] dark:text-white border-none hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a]">Hủy</AlertDialogCancel>
                        <AlertDialogAction disabled={isRedeeming} onClick={confirmRedeem} className="bg-[#0065FF] text-white hover:bg-[#0052CC]">
                            {isRedeeming ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* SUCCESS POPUP */}
            <Dialog open={!!successVoucher} onOpenChange={(open) => { if (!open) setSuccessVoucher(null); }}>
                <DialogContent className="bg-white dark:bg-[#1c162e] border-[#ebe7f3] dark:border-[#2d263d] max-w-sm w-[90%] md:w-full p-0 overflow-hidden rounded-2xl">
                    <DialogTitle className="sr-only">Đổi quà thành công</DialogTitle>
                    {/* Header gradient */}
                    <div className="relative bg-gradient-to-br from-[#0065FF] to-[#6B46FF] px-4 md:px-6 py-4 text-white text-center overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10"></div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-lg md:text-xl font-black tracking-tight">Chúc mừng bạn!</h2>
                            <p className="text-white/80 text-xs md:text-sm mt-0.5">Đã đổi quà thành công</p>
                        </div>
                    </div>

                    <div className="px-4 md:px-6 py-4 md:py-5 space-y-3 md:space-y-4">
                        {/* Reward info */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-[#654d99] dark:text-[#a594c9]">
                                <Gift className="w-4 h-4" />
                                <span>Ưu đãi</span>
                            </div>
                            <span className="font-bold text-[#120e1b] dark:text-white">{successVoucher?.partnerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#654d99] dark:text-[#a594c9]">Điểm đã dùng</span>
                            <span className="font-bold text-[#0065FF]">-{successVoucher?.points.toLocaleString()} pts</span>
                        </div>

                        {/* Promo Code Box */}
                        <div className="mt-2 rounded-xl border-2 border-dashed border-[#0065FF]/40 bg-[#0065FF]/5 dark:bg-[#0065FF]/10 p-4 flex flex-col items-center">
                            <p className="text-xs font-bold text-[#654d99] dark:text-[#a594c9] uppercase tracking-widest text-center mb-4">Quét QR hoặc Sao Chép Mã</p>
                            
                            {/* QR Code */}
                            {successVoucher?.code && (
                                <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
                                    <QRCodeSVG 
                                        value={successVoucher.code} 
                                        size={120}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"Q"}
                                        includeMargin={false}
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2 w-full justify-center">
                                <code className="text-center text-base sm:text-sm font-black tracking-widest text-[#0065FF] uppercase select-all bg-white dark:bg-[#1c162e] py-1.5 px-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d]">
                                    {successVoucher?.code}
                                </code>
                                <button
                                    onClick={() => successVoucher && handleCopyCode(successVoucher.code)}
                                    className="flex items-center justify-center p-2 rounded-lg bg-[#0065FF] text-white hover:bg-[#0052CC] transition-all active:scale-95 shrink-0 h-[36px] w-[36px]"
                                    title="Sao chép mã"
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-center text-[#654d99] dark:text-[#a594c9] pb-1">
                            Mã này cũng được lưu trong <span className="font-semibold text-[#0065FF] cursor-pointer hover:underline" onClick={() => { setSuccessVoucher(null); setActiveTab("history"); }}>lịch sử đổi quà</span> của bạn.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
