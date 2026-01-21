"use client";
import { NameRedHope } from "@/components/icons";
import { RedHopeLogo } from "@/components/icons";
import {
    Droplet,
    LayoutDashboard,
    History,
    Search,
    Award,
    Settings,
    Star,
    Bell,
    HeartHandshake,
    MapPin,
    Hospital,
    ShieldPlus,
    Coffee,
    Film,
    CalendarCheck,
    Zap,
    Users,
    AlertCircle,
    Heart
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-slate-100">

            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 sticky top-0 h-screen hidden md:flex">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-[#6324eb] size-10 rounded-lg flex items-center justify-center text-white">
                            <RedHopeLogo className="w-24 h-24 fill-current" />
                        </div>
                        <div className="flex flex-col">

                            <NameRedHope className="text-slate-900 dark:text-white text-lg font-bold leading-tight" />
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#6324eb]/10 text-[#6324eb]">
                            <LayoutDashboard className="w-6 h-6" />
                            <p className="text-sm font-semibold">Dashboard</p>
                        </Link>
                        <Link href="/donations" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <History className="w-6 h-6" />
                            <p className="text-sm font-medium">Lịch sử hiến máu</p>
                        </Link>
                        <Link href="/requests" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Search className="w-6 h-6" />
                            <p className="text-sm font-medium">Tìm điểm hiến máu</p>
                        </Link>
                        <Link href="/rewards" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Award className="w-6 h-6" />
                            <p className="text-sm font-medium">Đổi quà</p>
                        </Link>
                        <Link href="/donate" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Heart className="w-6 h-6" />
                            <p className="text-sm font-medium">Quyên góp</p>
                        </Link>
                        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Settings className="w-6 h-6" />
                            <p className="text-sm font-medium">Cài đặt</p>
                        </Link>

                    </nav>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900">
                            <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm tích lũy</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">750 pts</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#6324eb] h-full w-3/4"></div>
                    </div>
                    <p className="text-[10px] mt-2 text-slate-500">Còn 250 pts để lên hạng Platinum</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* Top Navbar */}
                <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-8 flex-1">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold">Tổng quan</h2>
                        <div className="hidden md:flex flex-1 max-w-md items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 border border-transparent focus-within:border-[#6324eb]/50 transition-all">
                            <Search className="text-slate-400 w-5 h-5" />
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-500 px-2 outline-none"
                                placeholder="Tìm bệnh viện hoặc điểm hiến máu..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-[#6324eb] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#6324eb]/90 transition-colors shadow-lg shadow-[#6324eb]/20">
                            <HeartHandshake className="w-5 h-5" />
                            Đăng ký hiến máu
                        </button>
                        <button className="relative p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Alex Rivera</p>
                                <p className="text-xs text-slate-500">Nhóm máu O+</p>
                            </div>
                            <div className="size-10 rounded-full bg-slate-200 border-2 border-[#6324eb]/20 overflow-hidden">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">

                    {/* Welcome & Page Heading */}
                    <div className="flex flex-wrap justify-between items-end gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Chào Alex!</h1>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <AlertCircle className="text-red-500 w-5 h-5" />
                                <p className="text-base font-medium">Nhóm máu O+ của bạn đang <span className="text-red-500 font-bold">khan hiếm</span> tại TP.HCM.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trạng thái</p>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Đủ điều kiện hiến máu</p>
                                </div>
                            </div>
                            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                                Xem lịch sử
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Số người đã cứu</p>
                                <Award className="text-[#6324eb] w-6 h-6" />
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-slate-900 dark:text-white text-3xl font-black">12</p>
                                <p className="text-emerald-600 text-sm font-bold flex items-center">+2 tháng này</p>
                            </div>
                            <p className="text-slate-400 text-xs mt-2">Top 5% người hiến máu trong khu vực</p>
                        </div>
                        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Cộng đồng</p>
                                <Users className="text-blue-500 w-6 h-6" />
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-slate-900 dark:text-white text-3xl font-black">1,240</p>
                                <p className="text-emerald-600 text-sm font-bold">+150% tăng trưởng</p>
                            </div>
                            <p className="text-slate-400 text-xs mt-2">Người hiến máu tích cực bán kính 25km</p>
                        </div>
                        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Yêu cầu khẩn cấp</p>
                                <Zap className="text-red-500 w-6 h-6" />
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-slate-900 dark:text-white text-3xl font-black">45</p>
                                <p className="text-slate-500 text-sm font-bold">-5% so với hôm qua</p>
                            </div>
                            <p className="text-slate-400 text-xs mt-2">Cần máu gấp tại 8 bệnh viện</p>
                        </div>
                    </div>

                    {/* Main Section Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Status & Map */}
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* Blood Status Card */}
                            <div className="relative overflow-hidden flex items-stretch justify-between gap-6 rounded-2xl bg-slate-900 dark:bg-slate-950 p-8 text-white shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-full bg-[#6324eb]/20 blur-[100px] -mr-32"></div>
                                <div className="flex flex-col justify-between relative z-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                            <span className="size-2 bg-red-500 rounded-full"></span> Cần máu khẩn cấp
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Trạng thái Nhóm máu O+</h3>
                                        <p className="text-slate-300 text-sm mb-6 max-w-sm">Các bệnh viện tại TP.HCM đang thiếu hụt nhóm máu của bạn. Một lần hiến máu của bạn có thể cứu sống 3 người hôm nay.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="bg-[#6324eb] text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#6324eb]/90 transition-all shadow-lg shadow-[#6324eb]/25">
                                            <MapPin className="w-4 h-4" />
                                            Tìm điểm hiến máu gần nhất
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden sm:flex flex-col items-center justify-center bg-white/5 rounded-xl px-8 py-4 border border-white/10 backdrop-blur-md">
                                    <p className="text-5xl font-black text-white">O+</p>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-2">Nhóm của bạn</p>
                                </div>
                            </div>

                            {/* Active Requests List */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yêu cầu khẩn cấp gần đây</h3>
                                    <Link href="#" className="text-[#6324eb] text-sm font-bold hover:underline">Xem bản đồ</Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Request Item 1 */}
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#6324eb]/50 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-[#6324eb] transition-colors">
                                                    <Hospital className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Bệnh viện Chợ Rẫy</p>
                                                    <p className="text-xs text-slate-500">2.4 km • Quận 5, TP.HCM</p>
                                                </div>
                                            </div>
                                            <span className="bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Khẩn cấp</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Kết thúc: 4h</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Droplet className="w-3 h-3 text-red-500" />
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">Cần: O-, O+, B-</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Request Item 2 */}
                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#6324eb]/50 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-[#6324eb] transition-colors">
                                                    <ShieldPlus className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Viện Huyết học</p>
                                                    <p className="text-xs text-slate-500">4.1 km • Quận 1, TP.HCM</p>
                                                </div>
                                            </div>
                                            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Tiêu chuẩn</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Mở đến: 8pm</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Droplet className="w-3 h-3 text-blue-500" />
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">Cần: Tất cả</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Personal Achievements & Info */}
                        <div className="flex flex-col gap-6">
                            {/* Rewards Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quà tặng sắp tới</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="size-12 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600">
                                            <Coffee className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Voucher Cafe</p>
                                            <p className="text-xs text-slate-500">Highlands / Starbucks</p>
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase">250 pts</p>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg opacity-60">
                                        <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                                            <Film className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Vé xem phim</p>
                                            <p className="text-xs text-slate-500">CGV / Lotte</p>
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase">1000 pts</p>
                                    </div>
                                    <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors mt-2">
                                        Xem kho quà tặng
                                    </button>
                                </div>
                            </div>

                            {/* Eligibility Timer */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <CalendarCheck className="text-[#6324eb] w-6 h-6" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ngày hiến tiếp theo</h3>
                                </div>
                                <div className="flex flex-col items-center py-4 bg-[#6324eb]/5 rounded-xl border border-[#6324eb]/10">
                                    <p className="text-4xl font-black text-[#6324eb]">14 Th12</p>
                                    <p className="text-sm font-medium text-slate-500 mt-1">2024</p>
                                </div>
                                <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                                    Bạn có thể hiến máu toàn phần mỗi 84 ngày. Hiện tại bạn đang trong thời gian nghỉ ngơi an toàn.
                                </p>
                            </div>

                            {/* Mini Map Visual */}
                            <div className="rounded-xl overflow-hidden h-40 relative group cursor-pointer bg-slate-200">
                                <div className="absolute inset-0 bg-slate-200 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-50" style={{ backgroundImage: 'url("https://product.hstatic.net/200000305259/product/ban-do-tp-hcm-kho-lon-full_aa0f19c6e39845d49265f7c32b5090f7.jpg")' }}>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="text-sm w-4 h-4" />
                                        <p className="text-xs font-bold">8 điểm hiến gần bạn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
