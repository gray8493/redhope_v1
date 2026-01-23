"use client";

import {
    Heart,
    CreditCard,
    QrCode,
    Trophy,
    TrendingUp,
    Users,
    Star,
    Wallet
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import { useState } from "react";
import { X, CheckCircle2, Copy } from "lucide-react";

export default function DonatePage() {
    const [amount, setAmount] = useState<string>("100.000");
    const [paymentMethod, setPaymentMethod] = useState<string>("momo");
    const [showQRModal, setShowQRModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const donationPresets = ["50.000", "100.000", "200.000", "500.000"];

    const handleConfirmDonation = () => {
        setIsProcessing(true);
        // Simulate a small delay for "processing"
        setTimeout(() => {
            setIsProcessing(false);
            if (paymentMethod === "momo") {
                setShowQRModal(true);
            } else {
                setShowCardModal(true);
            }
        }, 800);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#fff5f5] dark:bg-[#1f1212] font-sans text-[#450a0a] dark:text-red-50">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1200px] flex-1 px-4 md:px-10">

                            {/* Hero Section */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 bg-gradient-to-r from-[#450a0a] to-[#7f1d1d] rounded-2xl p-8 text-white shadow-xl shadow-[#7f1d1d]/30 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="flex flex-col gap-4 max-w-2xl relative z-10">
                                    <h1 className="text-3xl md:text-5xl font-black leading-tight">Chung tay vì cộng đồng</h1>
                                    <p className="text-white/90 text-lg font-medium">
                                        Mỗi đóng góp của bạn, dù nhỏ nhất, cũng góp phần duy trì hoạt động hiến máu tình nguyện và cứu sống hàng ngàn bệnh nhân mỗi năm.
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/10">
                                            <Users className="w-5 h-5" />
                                            <span className="font-bold">12,500+ Nhà hảo tâm</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/10">
                                            <TrendingUp className="w-5 h-5" />
                                            <span className="font-bold">5.2 Tỷ VNĐ đã quyên góp</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block relative z-10">
                                    <Heart className="w-40 h-40 text-red-500/20 fill-current animate-pulse" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Donation Form */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl border border-red-100 dark:border-red-900/30 p-6 shadow-sm">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#450a0a] dark:text-red-400">
                                            <Wallet className="w-6 h-6" /> Quyên góp ngay
                                        </h2>

                                        <div className="flex flex-col gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-[#7f1d1d] dark:text-red-400 mb-3 uppercase tracking-wider">Chọn mức đóng góp</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {donationPresets.map((preset) => (
                                                        <button
                                                            key={preset}
                                                            onClick={() => setAmount(preset)}
                                                            className={`py-3 px-4 rounded-lg border-2 font-bold transition-all ${amount === preset
                                                                ? "border-[#7f1d1d] bg-[#7f1d1d]/10 text-[#7f1d1d]"
                                                                : "border-red-200 dark:border-red-900/30 text-[#450a0a] dark:text-red-200 hover:border-[#7f1d1d]"
                                                                }`}
                                                        >
                                                            {preset}đ
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#7f1d1d] dark:text-red-400 mb-3 uppercase tracking-wider">Hoặc nhập số tiền khác</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-[#fef2f2] dark:bg-[#1f1212] border-none rounded-xl py-4 px-4 text-xl font-bold text-[#450a0a] dark:text-white focus:ring-2 focus:ring-[#7f1d1d] placeholder:text-red-400"
                                                        placeholder="Nhập số tiền (VNĐ)"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f1d1d] font-bold">VNĐ</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#7f1d1d] dark:text-red-400 mb-3 uppercase tracking-wider">Phương thức thanh toán</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => setPaymentMethod("momo")}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all group text-left hover:shadow-md ${paymentMethod === "momo"
                                                            ? "border-[#7f1d1d] bg-[#7f1d1d]/5 shadow-md shadow-[#7f1d1d]/10"
                                                            : "border-red-200 dark:border-red-900/30 bg-white dark:bg-[#2a1a1a]"
                                                            }`}
                                                    >
                                                        <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${paymentMethod === "momo" ? "bg-pink-600 text-white" : "bg-pink-50 text-pink-600 group-hover:bg-pink-100"
                                                            }`}>
                                                            <QrCode className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold transition-colors ${paymentMethod === "momo" ? "text-[#7f1d1d]" : "text-[#450a0a] dark:text-white group-hover:text-[#7f1d1d]"}`}>Ví MoMo</p>
                                                            <p className="text-xs text-[#7f1d1d] dark:text-red-300">Quét mã QR nhanh chóng</p>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => setPaymentMethod("card")}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all group text-left hover:shadow-md ${paymentMethod === "card"
                                                            ? "border-[#7f1d1d] bg-[#7f1d1d]/5 shadow-md shadow-[#7f1d1d]/10"
                                                            : "border-red-200 dark:border-red-900/30 bg-white dark:bg-[#2a1a1a]"
                                                            }`}
                                                    >
                                                        <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                                            }`}>
                                                            <CreditCard className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold transition-colors ${paymentMethod === "card" ? "text-[#7f1d1d]" : "text-[#450a0a] dark:text-white group-hover:text-[#7f1d1d]"}`}>Thẻ Ngân hàng / Visa</p>
                                                            <p className="text-xs text-[#7f1d1d] dark:text-red-300">Chuyển khoản trực tiếp</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleConfirmDonation}
                                                disabled={isProcessing}
                                                className="w-full py-4 bg-[#7f1d1d] hover:bg-[#450a0a] text-white text-lg font-black rounded-xl shadow-xl shadow-[#7f1d1d]/30 transition-all active:scale-[0.98] mt-2 ring-offset-2 focus:ring-2 ring-[#7f1d1d] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : null}
                                                {isProcessing ? "Đang xử lý..." : `Tiến hành Quyên góp ${amount && `${amount}đ`}`}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl border border-red-100 dark:border-red-900/30 p-6 shadow-sm">
                                        <h3 className="font-bold text-lg mb-4 text-[#450a0a] dark:text-red-100">Hoạt động gần đây</h3>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="flex items-center justify-between pb-4 border-b border-red-100 dark:border-red-900/20 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center font-bold text-xs text-[#7f1d1d]">
                                                            ND
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#450a0a] dark:text-white">Người dùng ẩn danh</p>
                                                            <p className="text-xs text-[#7f1d1d] dark:text-red-300">Vừa quyên góp</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[#15803d] font-bold text-sm">+50.000đ</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Leaderboard */}
                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl border border-red-100 dark:border-red-900/30 p-0 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                                        <div className="p-6 pb-4 border-b border-red-100 dark:border-red-900/30 bg-gradient-to-r from-red-50 to-white dark:from-[#2a1a1a] dark:to-[#1f1212]">
                                            <h2 className="text-xl font-bold flex items-center gap-2 text-[#7f1d1d]">
                                                <Trophy className="w-6 h-6 fill-current" /> Bảng vàng Vinh danh
                                            </h2>
                                            <p className="text-sm text-[#7f1d1d] mt-1 dark:text-red-300">Top nhà hảo tâm tháng này</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto">
                                            {/* Top 1 */}
                                            <div className="p-4 flex items-center gap-4 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30">
                                                <div className="flex-none font-black text-2xl text-[#7f1d1d] w-8 text-center drop-shadow-sm">1</div>
                                                <div className="size-12 rounded-full border-2 border-[#7f1d1d] p-0.5">
                                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Top 1" className="w-full h-full rounded-full bg-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#450a0a] dark:text-white truncate">Nguyễn Văn An</p>
                                                    <p className="text-xs text-[#991b1b] dark:text-red-400 font-bold">VIP Donor</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-[#7f1d1d]">150tr</p>
                                                </div>
                                            </div>

                                            {/* Top 2 */}
                                            <div className="p-4 flex items-center gap-4 border-b border-red-100 dark:border-red-900/30">
                                                <div className="flex-none font-black text-xl text-slate-400 w-8 text-center">2</div>
                                                <div className="size-10 rounded-full border-2 border-slate-300 p-0.5">
                                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Top 2" className="w-full h-full rounded-full bg-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#450a0a] dark:text-white truncate">Trần Thị Bích</p>
                                                    <p className="text-xs text-[#7f1d1d] dark:text-red-300">Quyên góp 12 lần</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-[#7f1d1d]">85tr</p>
                                                </div>
                                            </div>

                                            {/* Top 3 */}
                                            <div className="p-4 flex items-center gap-4 border-b border-red-100 dark:border-red-900/30">
                                                <div className="flex-none font-black text-xl text-[#450a0a] w-8 text-center">3</div>
                                                <div className="size-10 rounded-full border-2 border-[#450a0a] p-0.5">
                                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="Top 3" className="w-full h-full rounded-full bg-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#450a0a] dark:text-white truncate">Lê Hoàng Nam</p>
                                                    <p className="text-xs text-[#7f1d1d] dark:text-red-300">Quyên góp 8 lần</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-[#7f1d1d]">50tr</p>
                                                </div>
                                            </div>

                                            {/* Top 4-10 */}
                                            {[4, 5, 6, 7].map((rank) => (
                                                <div key={rank} className="p-4 flex items-center gap-4 border-b border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                                    <div className="flex-none font-bold text-sm text-slate-400 w-8 text-center">{rank}</div>
                                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rank}`} alt={`Rank ${rank}`} className="w-full h-full" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-[#450a0a] dark:text-white truncate">Nhà hảo tâm {rank}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-[#7f1d1d]">10tr</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>


                                    </div>

                                    {/* Motivation Card */}
                                    <div className="bg-gradient-to-br from-[#7f1d1d] to-[#450a0a] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 opacity-20">
                                            <Heart className="w-24 h-24 fill-current" />
                                        </div>
                                        <h3 className="font-bold text-xl mb-2">Trở thành Đại sứ?</h3>
                                        <p className="text-sm text-red-100 mb-4 tracking-wide">
                                            Quyên góp trên 10 triệu đồng để nhận huy hiệu Đại sứ Nhân ái và quyền lợi đặc biệt.
                                        </p>
                                        <button className="bg-white text-[#7f1d1d] font-bold py-2 px-4 rounded-lg text-sm w-full hover:bg-red-100 transition-colors">
                                            Tìm hiểu thêm
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>

            {/* QR Code Modal (MoMo) */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#450a0a]/80 backdrop-blur-sm" onClick={() => setShowQRModal(false)}></div>
                    <div className="bg-white dark:bg-[#1f1212] w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-pink-600 p-6 text-center text-white relative">
                            <button onClick={() => setShowQRModal(false)} className="absolute right-4 top-4 hover:bg-black/10 p-1 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <QrCode className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="text-xl font-black">Thanh toán qua MoMo</h3>
                            <p className="text-white/80 text-sm">Quét mã để quyên góp {amount}đ</p>
                        </div>
                        <div className="p-8 text-center flex flex-col items-center">
                            <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-pink-50 mb-6">
                                {/* Simulated QR Image */}
                                <div className="size-48 bg-[#fdf2f8] rounded-xl flex items-center justify-center relative overflow-hidden ring-1 ring-pink-100">
                                    <div className="grid grid-cols-4 gap-2 opacity-20">
                                        {Array.from({ length: 16 }).map((_, i) => <div key={i} className="size-8 bg-pink-900 rounded-sm"></div>)}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="size-32 bg-white rounded-lg shadow-sm border border-pink-100 flex items-center justify-center p-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-full opacity-80" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full space-y-3 mb-6">
                                <div className="flex justify-between text-sm py-2 border-b border-red-50 dark:border-red-900/20">
                                    <span className="text-red-400 font-medium">Số tiền:</span>
                                    <span className="text-[#450a0a] dark:text-white font-black">{amount} VNĐ</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-red-50 dark:border-red-900/20">
                                    <span className="text-red-400 font-medium">Nội dung:</span>
                                    <span className="text-[#450a0a] dark:text-white font-black">QH {Math.floor(Math.random() * 100000)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl transition-all shadow-lg shadow-pink-600/20"
                            >
                                Tôi đã thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Card Modal */}
            {showCardModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#450a0a]/80 backdrop-blur-sm" onClick={() => setShowCardModal(false)}></div>
                    <div className="bg-white dark:bg-[#1f1212] w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-blue-600 p-6 text-center text-white relative">
                            <button onClick={() => setShowCardModal(false)} className="absolute right-4 top-4 hover:bg-black/10 p-1 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <CreditCard className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="text-xl font-black">Chuyển khoản Ngân hàng</h3>
                            <p className="text-white/80 text-sm">Vui lòng chuyển chính xác {amount}đ</p>
                        </div>
                        <div className="p-8">
                            <div className="space-y-4 mb-8">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-[10px] uppercase font-black text-blue-400 mb-1 tracking-widest">Số tài khoản</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xl font-black text-blue-900 dark:text-blue-200 tracking-wider">1234 5678 9012</p>
                                        <button className="text-blue-600 p-2 hover:bg-blue-100 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Ngân hàng</p>
                                        <p className="font-black text-[#450a0a] dark:text-white">Vietcombank</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Chủ TK</p>
                                        <p className="font-black text-[#450a0a] dark:text-white">REDHOPE VN</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-start gap-3 mb-6">
                                <CheckCircle2 className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed font-medium">
                                    Ghi chú chuyển khoản: <span className="font-black">REDHOPE {Math.floor(Math.random() * 100000)}</span>. Tiền sẽ được cập nhật sau 1-3 phút.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCardModal(false)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20"
                            >
                                Hoàn tất chuyển khoản
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
