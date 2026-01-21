"use client";

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
    Monitor
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default function RewardsPage() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav  />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1200px] flex-1 px-4 md:px-10">
                            {/* Hero Section */}
                            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                                <div className="flex min-w-72 flex-col gap-3">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Đổi quà tri ân</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Bạn có <span className="font-bold text-[#6324eb]">1,250 điểm</span> khả dụng. Cảm ơn bạn đã chung tay cứu người!
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
                                    <p className="text-[#120e1b] dark:text-white tracking-light text-3xl font-black leading-tight">1,250</p>
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
                                    <button className="flex flex-col items-center justify-center border-b-[3px] border-b-[#6324eb] text-[#120e1b] dark:text-white pb-[13px] pt-4 whitespace-nowrap px-2">
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Tất cả</p>
                                    </button>
                                    <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#654d99] dark:text-[#a594c9] pb-[13px] pt-4 whitespace-nowrap px-2 hover:text-[#6324eb] transition-colors">
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Ăn uống</p>
                                    </button>
                                    <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#654d99] dark:text-[#a594c9] pb-[13px] pt-4 whitespace-nowrap px-2 hover:text-[#6324eb] transition-colors">
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Mua sắm</p>
                                    </button>
                                    <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#654d99] dark:text-[#a594c9] pb-[13px] pt-4 whitespace-nowrap px-2 hover:text-[#6324eb] transition-colors">
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Sức khỏe</p>
                                    </button>
                                    <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#654d99] dark:text-[#a594c9] pb-[13px] pt-4 whitespace-nowrap px-2 hover:text-[#6324eb] transition-colors">
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Lịch sử đổi</p>
                                    </button>
                                </div>
                                <div className="w-full md:w-80 pb-2">
                                    <div className="flex w-full items-center rounded-lg h-10 overflow-hidden border border-[#ebe7f3] dark:border-[#2d263d] bg-white dark:bg-[#1c162e]">
                                        <div className="pl-3 text-[#654d99]">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="w-full bg-transparent border-none text-sm text-[#120e1b] dark:text-white placeholder:text-[#654d99] px-3 focus:outline-none focus:ring-0"
                                            placeholder="Tìm kiếm ưu đãi..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Marketplace Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Card 1 */}
                                <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all hover:shadow-lg group cursor-pointer">
                                    <div className="aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#6324eb]/10 to-transparent opacity-50"></div>
                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                            <Coffee className="w-8 h-8 text-[#6324eb]" />
                                        </div>
                                        <span className="absolute top-3 right-3 bg-white/90 dark:bg-[#1c162e]/90 px-2 py-1 rounded text-[10px] font-bold text-[#6324eb] border border-[#6324eb]/20">PHỔ BIẾN</span>
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">Coffee Bean & Co.</h3>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">Thưởng thức bất kỳ đồ uống cỡ lớn nào. Áp dụng tại tất cả cửa hàng.</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                <span className="text-[#6324eb] font-black text-xl">300 pts</span>
                                            </div>
                                            <button className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95">Đổi ngay</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all hover:shadow-lg group cursor-pointer">
                                    <div className="aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-50"></div>
                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                            <ShoppingBag className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">Green Grocer</h3>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">Voucher 200k cho rau củ quả tươi hoặc thực phẩm hữu cơ.</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                <span className="text-[#6324eb] font-black text-xl">800 pts</span>
                                            </div>
                                            <button className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95">Đổi ngay</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all hover:shadow-lg group cursor-pointer">
                                    <div className="aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50"></div>
                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                            <Activity className="w-8 h-8 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">Zenith Spa</h3>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">Liệu trình massage thư giãn 30 phút hoặc chăm sóc da mặt.</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                <span className="text-[#6324eb] font-black text-xl">1,200 pts</span>
                                            </div>
                                            <button className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95">Đổi ngay</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4 (Disabled) */}
                                <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] opacity-70 transition-all group">
                                    <div className="aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden grayscale">
                                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-30"></div>
                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                            <Monitor className="w-8 h-8 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">TechHaven</h3>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">Thẻ quà tặng 500k cho phụ kiện công nghệ.</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                <span className="text-gray-400 font-black text-xl">2,000 pts</span>
                                            </div>
                                            <button className="bg-gray-200 dark:bg-[#3d335a] text-gray-400 font-bold py-2 px-4 rounded-lg text-xs cursor-not-allowed">Thiếu 750 pts</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 5 */}
                                <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all hover:shadow-lg group cursor-pointer">
                                    <div className="aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50"></div>
                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                            <Pizza className="w-8 h-8 text-orange-500" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">Pizza Palace</h3>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">Một pizza cỡ vừa với 3 loại topping tùy chọn.</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                <span className="text-[#6324eb] font-black text-xl">450 pts</span>
                                            </div>
                                            <button className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95">Đổi ngay</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 6 */}
                                <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] transition-all hover:shadow-lg group cursor-pointer">
                                    <div className="aspect-[4/3] w-full bg-[#f6f6f8] dark:bg-[#251e36] flex items-center justify-center p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#6324eb]/10 to-transparent opacity-50"></div>
                                        <div className="z-10 bg-white dark:bg-[#1c162e] p-4 rounded-full shadow-md">
                                            <Film className="w-8 h-8 text-[#6324eb]" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <h3 className="text-[#120e1b] dark:text-white text-lg font-bold">Starlight Cinemas</h3>
                                        <p className="text-sm text-[#654d99] dark:text-[#a594c9] mt-1 mb-4 grow">Một vé xem phim 2D tiêu chuẩn.</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[#654d99] dark:text-gray-500 uppercase">Giá đổi</span>
                                                <span className="text-[#6324eb] font-black text-xl">550 pts</span>
                                            </div>
                                            <button className="bg-[#6324eb] hover:bg-[#6324eb]/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-transform active:scale-95">Đổi ngay</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer className="border-t border-[#ebe7f3] dark:border-[#2d263d] bg-white dark:bg-[#1c162e] py-8 px-10 text-center">
                        <p className="text-[#654d99] dark:text-[#a594c9] text-sm">© 2024 BloodLink Smart Donation Platform. Ensuring donor privacy and community health.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
