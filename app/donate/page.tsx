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

export default function DonatePage() {
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
                                                    <button className="py-3 px-4 rounded-lg border-2 border-red-200 dark:border-red-900/30 hover:border-[#7f1d1d] hover:bg-[#7f1d1d]/10 hover:text-[#7f1d1d] font-bold transition-all text-[#450a0a] dark:text-red-200">
                                                        50.000đ
                                                    </button>
                                                    <button className="py-3 px-4 rounded-lg border-2 border-red-200 dark:border-red-900/30 hover:border-[#7f1d1d] hover:bg-[#7f1d1d]/10 hover:text-[#7f1d1d] font-bold transition-all text-[#450a0a] dark:text-red-200">
                                                        100.000đ
                                                    </button>
                                                    <button className="py-3 px-4 rounded-lg border-2 border-red-200 dark:border-red-900/30 hover:border-[#7f1d1d] hover:bg-[#7f1d1d]/10 hover:text-[#7f1d1d] font-bold transition-all text-[#450a0a] dark:text-red-200">
                                                        200.000đ
                                                    </button>
                                                    <button className="py-3 px-4 rounded-lg border-2 border-red-200 dark:border-red-900/30 hover:border-[#7f1d1d] hover:bg-[#7f1d1d]/10 hover:text-[#7f1d1d] font-bold transition-all text-[#450a0a] dark:text-red-200">
                                                        500.000đ
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#7f1d1d] dark:text-red-400 mb-3 uppercase tracking-wider">Hoặc nhập số tiền khác</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-[#fef2f2] dark:bg-[#1f1212] border-none rounded-xl py-4 px-4 text-xl font-bold text-[#450a0a] dark:text-white focus:ring-2 focus:ring-[#7f1d1d] placeholder:text-red-400"
                                                        placeholder="Nhập số tiền (VNĐ)"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f1d1d] font-bold">VNĐ</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#7f1d1d] dark:text-red-400 mb-3 uppercase tracking-wider">Phương thức thanh toán</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <button className="flex items-center gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900/30 hover:border-[#7f1d1d] bg-white dark:bg-[#2a1a1a] transition-all group text-left hover:shadow-md hover:shadow-[#7f1d1d]/10">
                                                        <div className="size-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-pink-100 transition-colors">
                                                            <QrCode className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#450a0a] dark:text-white group-hover:text-[#7f1d1d] transition-colors">Ví MoMo</p>
                                                            <p className="text-xs text-[#7f1d1d] dark:text-red-300">Quét mã QR nhanh chóng</p>
                                                        </div>
                                                    </button>
                                                    <button className="flex items-center gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900/30 hover:border-[#7f1d1d] bg-white dark:bg-[#2a1a1a] transition-all group text-left hover:shadow-md hover:shadow-[#7f1d1d]/10">
                                                        <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                            <CreditCard className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#450a0a] dark:text-white group-hover:text-[#7f1d1d] transition-colors">Thẻ Ngân hàng / Visa</p>
                                                            <p className="text-xs text-[#7f1d1d] dark:text-red-300">Chuyển khoản trực tiếp</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            <button className="w-full py-4 bg-[#7f1d1d] hover:bg-[#450a0a] text-white text-lg font-black rounded-xl shadow-xl shadow-[#7f1d1d]/30 transition-all active:scale-[0.98] mt-2 ring-offset-2 focus:ring-2 ring-[#7f1d1d]">
                                                Tiến hành Quyên góp
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

                                        <div className="p-4 bg-red-50 dark:bg-[#251e36] text-center border-t border-red-100 dark:border-red-900/30">
                                            <button className="text-sm font-bold text-[#7f1d1d] hover:underline">Xem tất cả bảng xếp hạng</button>
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
        </div>
    );
}
