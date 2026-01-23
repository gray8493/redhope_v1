"use client";

import { useRouter } from "next/navigation";
import {
    Droplet,
    ClipboardList,
    Activity,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    Clock,
    MapPin,
    QrCode,
    ChevronRight,
    Trophy
} from "lucide-react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function HospitalDashboard() {
    const router = useRouter();
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Custom Sidebar for Hospital */}
                <HospitalSidebar />

                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Tổng quan Bệnh viện" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1400px] flex-1 px-4 md:px-8 space-y-8">

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Thu nhận hôm nay</p>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                            <Droplet className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">42 <span className="text-base font-medium text-gray-400">Đơn vị</span></h3>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
                                        <TrendingUp className="w-3 h-3 text-green-500" /> +5.2% so với hôm qua
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Yêu cầu Tích cực</p>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">12</h3>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
                                        <AlertTriangle className="w-3 h-3 text-orange-500" /> 3 khẩn cấp đang chờ
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Người hiến đang đến</p>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">8 <span className="text-base font-medium text-gray-400">Người</span></h3>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
                                        <CheckCircle className="w-3 h-3 text-[#6324eb]" /> Đã qua sàng lọc AI
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Thiếu hụt khẩn cấp</p>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">2 <span className="text-base font-medium text-gray-400">Nhóm</span></h3>
                                    <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-red-500" /> O- và AB- thấp
                                    </p>
                                </div>
                            </div>

                            {/* Main Grid: Active Requests Only */}
                            <div className="flex flex-col gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-[#120e1b] dark:text-white">Yêu cầu Máu Đang Xử lý</h2>
                                        <button 
                                            onClick={() => router.push("/hospital/requests")}
                                            className="text-sm text-slate-500 font-bold hover:text-[#120e1b] hover:underline flex items-center gap-1 transition-colors">
                                            Xem tất cả <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-2xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 dark:bg-[#251e36] text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">Mã Bệnh nhân</th>
                                                        <th className="px-6 py-4">Nhóm máu</th>
                                                        <th className="px-6 py-4">Số lượng</th>
                                                        <th className="px-6 py-4">Khẩn cấp</th>
                                                        <th className="px-6 py-4">Tiến độ</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#ebe7f3] dark:divide-[#2d263d]">
                                                    <tr className="hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors">
                                                        <td className="px-6 py-5 text-sm font-bold text-[#120e1b] dark:text-white">P-9821</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">O Positive (O+)</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-sm font-medium text-slate-600">2 Đơn vị</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-[10px] font-bold uppercase tracking-wide">Nguy kịch</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-24 bg-slate-200 dark:bg-[#2d263d] h-2 rounded-full overflow-hidden">
                                                                    <div className="bg-slate-900 h-full w-[80%] rounded-full"></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-900">80%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors">
                                                        <td className="px-6 py-5 text-sm font-bold text-[#120e1b] dark:text-white">P-9844</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">AB Negative (AB-)</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-sm font-medium text-slate-600">1 Đơn vị</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-md text-[10px] font-bold uppercase tracking-wide">Cao</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-24 bg-slate-200 dark:bg-[#2d263d] h-2 rounded-full overflow-hidden">
                                                                    <div className="bg-slate-900 h-full w-[25%] rounded-full"></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-900">25%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors">
                                                        <td className="px-6 py-5 text-sm font-bold text-[#120e1b] dark:text-white">P-9850</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">B Positive (B+)</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-sm font-medium text-slate-600">4 Đơn vị</td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md text-[10px] font-bold uppercase tracking-wide">Trung bình</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-24 bg-slate-200 dark:bg-[#2d263d] h-2 rounded-full overflow-hidden">
                                                                    <div className="bg-slate-900 h-full w-[50%] rounded-full"></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-900">50%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
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
