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
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardCarousel } from "@/components/DashboardCarousel";
import { BloodDropChatbot } from "@/components/BloodDropChatbot";


export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-slate-100">

            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">


                <TopNav />

                <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">


                    {/* Welcome & Page Heading */}
                    <DashboardHeader />

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
                    {/* Carousel + Rewards Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <DashboardCarousel />
                        </div>
                        {/* Rewards Card - đẩy lên ngang carousel */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm h-44 flex flex-col">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Quà tặng sắp tới</h3>
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600">
                                        <Coffee className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Voucher Cafe</p>
                                        <p className="text-xs text-slate-500">Highlands / Starbucks</p>
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase">250 pts</p>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg opacity-60">
                                    <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                                        <Film className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Vé xem phim</p>
                                        <p className="text-xs text-slate-500">CGV / Lotte</p>
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase">1000 pts</p>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors mt-2">
                                Xem kho quà tặng
                            </button>
                        </div>
                    </div>


                    {/* Main Section Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Status & Map */}
                        <div className="lg:col-span-2 flex flex-col gap-6">


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

            </main >
            <MiniFooter />

            {/* Floating Chatbot */}
            <BloodDropChatbot />

        </div >

    );
}
