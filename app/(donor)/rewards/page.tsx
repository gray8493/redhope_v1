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
import { useAuth } from "@/context/AuthContext";
import { voucherService } from "@/services/voucher.service";
import { pointService } from "@/services/point.service";

// Define reward categories
type Category = "all" | "food" | "shopping" | "health" | "history";

// Define reward item type
interface RewardItem {
    id: string;
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

// Helper to determine category and style based on partner name
const getCategoryAndStyle = (name: string, index: number) => {
    const styles = [
        { category: "food", icon: Coffee, color: "text-[#6324eb]", gradient: "from-[#6324eb]/10" },
        { category: "shopping", icon: ShoppingBag, color: "text-green-600", gradient: "from-green-500/10" },
        { category: "health", icon: Activity, color: "text-blue-500", gradient: "from-blue-500/10" },
        { category: "food", icon: Pizza, color: "text-orange-500", gradient: "from-orange-500/10" },
        { category: "shopping", icon: Film, color: "text-[#6324eb]", gradient: "from-[#6324eb]/10" },
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

    const userPoints = profile?.current_points || 0;

    const fetchRewards = async () => {
        setLoadingRewards(true);
        try {
            const data = await voucherService.getAll();
            const formattedRewards: RewardItem[] = data.map((v, index) => {
                const style = getCategoryAndStyle(v.partner_name || "Unknown", index);
                return {
                    id: v.id,
                    name: v.partner_name || "Ưu đãi",
                    description: `Voucher giảm giá từ ${v.partner_name || "đối tác"}`,
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
            console.error("Failed to fetch rewards", error);
        } finally {
            setLoadingRewards(false);
        }
    };

    const fetchHistory = async () => {
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
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [activeTab]);

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
            await pointService.redeemVoucher(user.id, rewardToRedeem.id);
            setAlertMessage({
                type: "success",
                title: "Đổi quà thành công!",
                description: "Mã voucher đã được gửi vào ví của bạn. Vui lòng kiểm tra email."
            });
            await refreshUser();
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Phần thưởng" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1200px] flex-1 px-4 md:px-10">

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

                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6 text-left">
                                <div className="flex min-w-72 flex-col gap-3">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black tracking-tight">Đổi quà tri ân</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Bạn có <span className="font-bold text-[#6324eb]">{userPoints.toLocaleString()} điểm</span> khả dụng. Cảm ơn bạn đã chung tay cứu người!
                                    </p>
                                </div>
                                <button className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ebe7f3] dark:bg-[#2d263d] text-[#120e1b] dark:text-white text-sm font-bold leading-normal hover:bg-[#dcd6e8] dark:hover:bg-[#3d335a] transition-all">
                                    <span className="truncate">Cách tích điểm</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-8 text-left">
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
                                        <p className="text-[#120e1b] dark:text-white text-base font-medium">Lần hiến máu</p>
                                    </div>
                                    <p className="text-[#120e1b] dark:text-white tracking-light text-3xl font-black leading-tight">2</p>
                                </div>
                                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center gap-2 text-[#6324eb]">
                                        <Users className="w-5 h-5" />
                                        <p className="text-[#120e1b] dark:text-white text-base font-medium">Người được cứu</p>
                                    </div>
                                    <p className="text-[#120e1b] dark:text-white tracking-light text-3xl font-black leading-tight">6</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d7d0e7] dark:border-[#2d2545] mb-8 pb-1">
                                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Category)} className="w-full md:w-auto">
                                    <TabsList className="bg-transparent p-0 h-auto gap-2 overflow-x-auto no-scrollbar justify-start">
                                        {tabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab.key}
                                                value={tab.key}
                                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[#6324eb] data-[state=active]:text-[#120e1b] dark:data-[state=active]:text-white rounded-none border-b-[3px] border-transparent pb-[13px] pt-4 px-2 text-[#654d99] dark:text-[#a594c9] text-sm font-bold leading-normal tracking-[0.015em] transition-all appearance-none select-none"
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
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] overflow-hidden">
                                    {loadingHistory ? (
                                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#6324eb]" /></div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-[#ebe7f3] dark:border-[#2d263d] bg-[#f6f6f8] dark:bg-[#251e36]">
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Ưu đãi</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Điểm</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Ngày đổi</th>
                                                        <th className="py-4 px-6 text-sm font-bold text-[#654d99] dark:text-[#a594c9]">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredHistory.map((item) => (
                                                        <tr key={item.id} className="border-b border-[#ebe7f3] dark:border-[#2d263d] last:border-b-0 hover:bg-[#f6f6f8] dark:hover:bg-[#251e36] transition-colors">
                                                            <td className="py-4 px-6">
                                                                <span className="font-bold text-[#120e1b] dark:text-white">{item.vouchers?.partner_name}</span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="text-[#6324eb] font-bold">-{item.vouchers?.point_cost} pts</span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="text-[#654d99] dark:text-[#a594c9]">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Redeemed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {item.status === 'Redeemed' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {item.status}
                                                                </span>
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
                            ) : (
                                <>
                                    {loadingRewards ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Loader2 className="w-10 h-10 text-[#6324eb] animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                                            {filteredRewards.map((reward) => (
                                                <div
                                                    key={reward.id}
                                                    className={`flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all group ${userPoints < reward.points ? "opacity-90" : "hover:shadow-lg"}`}
                                                >
                                                    <div className={`aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden ${userPoints < reward.points ? "grayscale" : ""}`}>
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${reward.gradientColor} to-transparent ${userPoints < reward.points ? "opacity-30" : "opacity-50"}`}></div>
                                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                                            {reward.icon}
                                                        </div>
                                                        {reward.badge && (
                                                            <Badge variant="secondary" className="absolute top-3 right-3 bg-white/90 dark:bg-[#1c162e]/90 text-[#6324eb] border border-[#6324eb]/20 text-[10px] font-bold px-2 py-1">
                                                                {reward.badge}
                                                            </Badge>
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
                                                                    onClick={() => handleRedeemClick(reward)}
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

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="bg-white dark:bg-[#1c162e] border-[#ebe7f3] dark:border-[#2d263d]">
                    <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="text-[#120e1b] dark:text-white">Xác nhận đổi quà</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#654d99] dark:text-[#a594c9]">
                            Bạn có chắc muốn dùng <span className="font-bold text-[#6324eb]">{rewardToRedeem?.points} điểm</span> để đổi lấy ưu đãi từ <span className="font-bold text-[#120e1b] dark:text-white">{rewardToRedeem?.name}</span> không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRedeeming} className="bg-[#f6f6f8] dark:bg-[#2d263d] text-[#120e1b] dark:text-white border-none hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a]">Hủy</AlertDialogCancel>
                        <AlertDialogAction disabled={isRedeeming} onClick={confirmRedeem} className="bg-[#6324eb] text-white hover:bg-[#501ac2]">
                            {isRedeeming ? <Loader2 className="animate-spin" /> : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
