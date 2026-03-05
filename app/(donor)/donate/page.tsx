"use client";

import {
    Heart,
    Trophy,
    TrendingUp,
    Users,
    Wallet,
    Loader2,
    QrCode,
    Download,
    Smartphone
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import MiniFooter from "@/components/shared/MiniFooter";
import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Copy } from "lucide-react";
import { donationService } from "@/services/donation.service";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    generateVietQRUrl,
    generateTransferContent,
    formatAccountNumber,
    REDHOPE_BANK_CONFIG,
    BANK_LIST,
} from "@/services/vietqr.service";

interface DonationStats {
    totalAmount: number;
    totalDonors: number;
    totalTransactions: number;
}

interface LeaderboardItem {
    donor_id: string;
    donor_name: string;
    total_amount: number;
    donation_count: number;
}

interface RecentDonation {
    id: string;
    donor_name: string;
    amount: number;
    created_at: string;
    is_anonymous: boolean;
}

export default function DonatePage() {
    const { user, profile } = useAuth();

    const [amount, setAmount] = useState<string>("100000");
    const [showVietQRModal, setShowVietQRModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [currentDonationId, setCurrentDonationId] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState<string>("");
    const [qrLoaded, setQrLoaded] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Data states
    const [stats, setStats] = useState<DonationStats>({ totalAmount: 0, totalDonors: 0, totalTransactions: 0 });
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
    const [loading, setLoading] = useState(true);

    const donationPresets = ["50000", "100000", "200000", "500000"];
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, leaderboardData, recentData] = await Promise.all([
                    donationService.getStats(),
                    donationService.getLeaderboard(7),
                    donationService.getRecentDonations(5)
                ]);
                setStats(statsData);
                setLeaderboard(leaderboardData);
                setRecentDonations(recentData);
            } catch (error) {
                console.error("Error fetching donation data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Countdown timer for QR modal (15 minutes)
    useEffect(() => {
        if (showVietQRModal && countdown > 0) {
            countdownRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [showVietQRModal, countdown]);

    // Poll for donation status completion
    useEffect(() => {
        if (!showVietQRModal || !currentDonationId) return;

        const interval = setInterval(async () => {
            try {
                const status = await donationService.getDonationStatus(currentDonationId);
                if (status === 'completed') {
                    clearInterval(interval);

                    const amountValue = parseAmount(amount);
                    const earnedPoints = Math.floor(amountValue / 1000);

                    toast.success(`Cảm ơn bạn! Hệ thống đã ghi nhận khoản đóng góp tự động. Bạn nhận được ${earnedPoints.toLocaleString('vi-VN')} điểm REDHOPE.`);

                    // Refresh data
                    const [statsData, recentData] = await Promise.all([
                        donationService.getStats(),
                        donationService.getRecentDonations(5)
                    ]);
                    setStats(statsData);
                    setRecentDonations(recentData);

                    setShowVietQRModal(false);
                    setCurrentDonationId(null);
                }
            } catch (err) { }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [showVietQRModal, currentDonationId, amount]);

    const formatAmount = (value: string) => {
        const num = parseInt(value.replace(/\D/g, ''), 10);
        if (isNaN(num)) return "";
        return num.toLocaleString('vi-VN');
    };

    const parseAmount = (value: string) => {
        return parseInt(value.replace(/\D/g, ''), 10) || 0;
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} Tỷ`;
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)} Tr`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
        return amount.toLocaleString('vi-VN');
    };

    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleConfirmDonation = async () => {
        const amountValue = parseAmount(amount);
        if (amountValue < 10000) {
            toast.error("Số tiền tối thiểu là 10.000đ");
            return;
        }

        setIsProcessing(true);
        try {
            const donation = await donationService.createDonation({
                donorId: user?.id,
                donorName: profile?.full_name || "Người dùng",
                amount: amountValue,

                isAnonymous
            });

            setCurrentDonationId(donation.id);

            // Generate VietQR URL
            const transferContent = generateTransferContent(donation.id);
            const url = generateVietQRUrl({
                amount: amountValue,
                description: transferContent,
                template: 'compact2',
            });
            setQrUrl(url);
            setQrLoaded(false);
            setCountdown(15 * 60); // 15 minutes
            setShowVietQRModal(true);
        } catch (error) {
            toast.error("Không thể tạo giao dịch. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    // The payment completion is now handled automatically via polling in useEffect

    const handleCloseModal = () => {
        setShowVietQRModal(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}`);
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
    };

    const bankInfo = BANK_LIST[REDHOPE_BANK_CONFIG.bankCode];
    const transferContent = currentDonationId ? generateTransferContent(currentDonationId) : '';

    return (
        <div className="flex h-full w-full flex-row overflow-hidden bg-slate-50 dark:bg-[#0f0a19] font-sans text-slate-900 dark:text-blue-50">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative no-scrollbar">
                <TopNav title="" />

                <main className="flex-1 py-4 md:py-8">
                    <div className="flex flex-col max-w-[1200px] mx-auto w-full px-4 sm:px-5 md:px-10">

                        {/* Hero Section */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 mb-6 md:mb-10 bg-gradient-to-r from-red-900 via-red-800 to-red-500 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl shadow-red-500/30 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="flex flex-col gap-2 md:gap-4 max-w-2xl relative z-10">
                                <h1 className="text-xl sm:text-2xl md:text-5xl font-black leading-tight">Chung tay vì cộng đồng</h1>
                                <p className="text-white/90 text-sm md:text-lg font-medium hidden sm:block">
                                    Mỗi đóng góp của bạn, dù nhỏ nhất, cũng góp phần duy trì hoạt động hiến máu tình nguyện và cứu sống hàng ngàn bệnh nhân mỗi năm.
                                </p>
                                <div className="flex flex-wrap gap-2 md:gap-4 mt-1 md:mt-2">
                                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/10">
                                        <Users className="w-5 h-5" />
                                        {loading ? (
                                            <Skeleton className="h-5 w-24 bg-white/20" />
                                        ) : (
                                            <span className="font-bold">{stats.totalDonors.toLocaleString('vi-VN')}+ Nhà hảo tâm</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/10">
                                        <TrendingUp className="w-5 h-5" />
                                        {loading ? (
                                            <Skeleton className="h-5 w-32 bg-white/20" />
                                        ) : (
                                            <span className="font-bold">{formatCurrency(stats.totalAmount)} VNĐ đã quyên góp</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block relative z-10">
                                <Heart className="w-40 h-40 text-white/10 fill-current animate-pulse" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                            {/* Left Column: Donation Form */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                        <Wallet className="w-6 h-6" /> Quyên góp ngay
                                    </h2>

                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Chọn mức đóng góp</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {donationPresets.map((preset) => (
                                                    <button
                                                        key={preset}
                                                        onClick={() => setAmount(preset)}
                                                        className={`py-3 px-4 rounded-lg border-2 font-bold transition-all ${amount === preset
                                                            ? "border-red-900 bg-red-50 dark:bg-red-900/10 text-red-900"
                                                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 hover:border-red-900"
                                                            }`}
                                                    >
                                                        {formatAmount(preset)}đ
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Hoặc nhập số tiền khác</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-900 placeholder:text-slate-400"
                                                    placeholder="Nhập số tiền (VNĐ)"
                                                    value={formatAmount(amount)}
                                                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-900 font-bold">VNĐ</span>
                                            </div>
                                        </div>

                                        {/* Anonymous checkbox */}
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-300 text-red-900 focus:ring-red-900"
                                            />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-200">Quyên góp ẩn danh</span>
                                        </label>

                                        {/* VietQR Payment Method (only option) */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Phương thức thanh toán</label>
                                            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-red-900 bg-red-50/50 dark:bg-red-900/5 shadow-md shadow-red-900/10">
                                                <div className="size-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                                                    <QrCode className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-[#450a0a] dark:text-white text-base">VietQR – Chuyển khoản ngân hàng</p>
                                                    <p className="text-xs text-slate-500 dark:text-red-300">Quét mã QR bằng ứng dụng ngân hàng • Miễn phí • Tức thì</p>
                                                </div>
                                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">0% phí</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleConfirmDonation}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-red-900 hover:bg-black text-white text-lg font-black rounded-xl shadow-xl shadow-red-900/20 transition-all active:scale-[0.98] mt-2 ring-offset-2 focus:ring-2 ring-red-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <QrCode className="w-5 h-5" />
                                            )}
                                            {isProcessing ? "Đang tạo mã QR..." : `Tạo mã QR – ${formatAmount(amount)}đ`}
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">Hoạt động gần đây</h3>
                                    <div className="space-y-4">
                                        {loading ? (
                                            [1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                    <Skeleton className="h-10 w-40" />
                                                    <Skeleton className="h-6 w-20" />
                                                </div>
                                            ))
                                        ) : recentDonations.length > 0 ? (
                                            recentDonations.map((donation) => (
                                                <div key={donation.id} className="flex items-center justify-between pb-4 border-b border-red-100 dark:border-red-900/20 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center font-bold text-xs text-red-900">
                                                            {donation.is_anonymous ? "AD" : donation.donor_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#450a0a] dark:text-white">
                                                                {donation.is_anonymous ? "Người dùng ẩn danh" : donation.donor_name}
                                                            </p>
                                                            <p className="text-xs text-red-800 dark:text-red-300">{timeAgo(donation.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[#15803d] font-bold text-sm">+{formatAmount(donation.amount.toString())}đ</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-sm text-[#7f1d1d]/60 py-4">Chưa có hoạt động quyên góp nào</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Leaderboard */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-slate-200 dark:border-slate-800 p-0 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                                    <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-50 to-white dark:from-[#1c162e] dark:to-[#0f0a19]">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-red-900">
                                            <Trophy className="w-6 h-6 fill-current" /> Bảng vàng Vinh danh
                                        </h2>
                                        <p className="text-sm text-red-900 mt-1 dark:text-red-300">Top nhà hảo tâm</p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto no-scrollbar">
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="p-4 flex items-center gap-4 border-b border-red-100 dark:border-red-900/30">
                                                    <Skeleton className="h-10 w-full" />
                                                </div>
                                            ))
                                        ) : leaderboard.length > 0 ? (
                                            leaderboard.map((donor, index) => (
                                                <div
                                                    key={donor.donor_id}
                                                    className={`p-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${index === 0 ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                                >
                                                    <div className={`flex-none font-black w-8 text-center ${index === 0 ? 'text-2xl text-red-900 drop-shadow-sm' : index < 3 ? 'text-xl text-slate-400' : 'text-sm text-slate-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className={`rounded-full overflow-hidden ${index === 0 ? 'size-12 border-2 border-red-900 p-0.5' : index < 3 ? 'size-10 border-2 border-slate-300 p-0.5' : 'size-8 bg-slate-200 dark:bg-slate-700'}`}>
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.donor_name}`}
                                                            alt={donor.donor_name}
                                                            className="w-full h-full rounded-full bg-white"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-bold truncate ${index === 0 ? 'text-sm text-[#450a0a] dark:text-white' : 'text-sm text-[#450a0a] dark:text-white'}`}>
                                                            {donor.donor_name}
                                                        </p>
                                                        <p className="text-xs text-red-900 dark:text-red-300">
                                                            {index === 0 ? 'VIP Donor' : `Quyên góp ${donor.donation_count} lần`}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-red-900">{formatCurrency(donor.total_amount)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-red-600/60">
                                                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Chưa có nhà hảo tâm nào</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Motivation Card */}
                                <div className="bg-gradient-to-br from-red-900 to-red-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-20">
                                        <Heart className="w-24 h-24 fill-current" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">Trở thành Đại sứ?</h3>
                                    <p className="text-sm text-red-100 mb-4 tracking-wide">
                                        Quyên góp trên 10 triệu đồng để nhận huy hiệu Đại sứ Nhân ái và quyền lợi đặc biệt.
                                    </p>
                                    <button className="bg-white text-red-600 font-bold py-2 px-4 rounded-lg text-sm w-full hover:bg-red-50 transition-colors">
                                        Tìm hiểu thêm
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>

                <MiniFooter />
            </div>

            {/* VietQR Payment Modal */}
            {showVietQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="bg-white dark:bg-[#1c162e] w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center text-white relative">
                            <button onClick={handleCloseModal} className="absolute right-4 top-4 hover:bg-black/10 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="size-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                                <QrCode className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black">Thanh toán VietQR</h3>
                            <p className="text-white/80 text-sm mt-1">Quét mã bằng ứng dụng ngân hàng</p>
                            {countdown > 0 && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <div className="size-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-sm font-mono font-bold">{formatCountdown(countdown)}</span>
                                </div>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="p-6 flex flex-col items-center">
                            <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-blue-100 mb-4 relative">
                                {!qrLoaded && (
                                    <div className="size-52 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                )}
                                <img
                                    src={qrUrl}
                                    alt="VietQR Payment Code"
                                    className={`size-52 object-contain ${qrLoaded ? 'block' : 'hidden'}`}
                                    onLoad={() => setQrLoaded(true)}
                                    onError={() => {
                                        setQrLoaded(true);
                                        toast.error("Không thể tải mã QR. Vui lòng thử lại.");
                                    }}
                                />
                            </div>

                            {/* Amount display */}
                            <div className="text-center mb-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Số tiền</p>
                                <p className="text-3xl font-black text-red-900 dark:text-red-400">{formatAmount(amount)} <span className="text-base">VNĐ</span></p>
                            </div>

                            {/* Instructions */}
                            <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Smartphone className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Hướng dẫn</p>
                                </div>
                                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                    <li>Chọn <strong>Quét QR</strong> hoặc <strong>Chuyển khoản</strong></li>
                                    <li>Quét mã QR phía trên</li>
                                    <li>Kiểm tra thông tin và nhấn <strong>Xác nhận</strong></li>
                                </ol>
                            </div>

                            {/* Bank Details */}
                            <div className="w-full space-y-3 mb-4">
                                {/* Account Number */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Số tài khoản</p>
                                            <p className="text-base font-black text-slate-900 dark:text-white tracking-wider">
                                                {formatAccountNumber(REDHOPE_BANK_CONFIG.accountNumber)}
                                            </p>
                                        </div>
                                        <button
                                            className="text-blue-600 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            onClick={() => copyToClipboard(REDHOPE_BANK_CONFIG.accountNumber, 'STK')}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Bank + Account Name */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Ngân hàng</p>
                                        <p className="font-black text-slate-900 dark:text-white text-sm">{bankInfo.name}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Chủ TK</p>
                                        <p className="font-black text-slate-900 dark:text-white text-sm">{REDHOPE_BANK_CONFIG.accountName}</p>
                                    </div>
                                </div>

                                {/* Transfer Content */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-yellow-600 tracking-widest">Nội dung CK</p>
                                            <p className="font-black text-yellow-900 dark:text-yellow-200">{transferContent}</p>
                                        </div>
                                        <button
                                            className="text-yellow-600 p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                                            onClick={() => copyToClipboard(transferContent, 'nội dung CK')}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notice */}
                            <div className="w-full bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-900/30 flex items-start gap-2 mb-4">
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                                    Hệ thống đang tự động kiểm tra trạng thái thanh toán. <strong>Không cần thao tác thêm</strong>. Điểm thưởng sẽ được cộng ngay sau khi ghi nhận.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full space-y-2">
                                <div className="w-full py-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang chờ thanh toán...
                                </div>
                                <button
                                    onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = qrUrl;
                                        a.download = `vietqr-${parseAmount(amount)}.png`;
                                        a.target = '_blank';
                                        a.click();
                                    }}
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Tải mã QR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
