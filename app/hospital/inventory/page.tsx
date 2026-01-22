"use client";

import {
    Package,
    AlertTriangle,
    Droplet,
    Search,
    Filter,
    Plus,
    ArrowUpDown,
    MoreHorizontal
} from "lucide-react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function InventoryPage() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Kho lưu trữ Máu" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1400px] flex-1 px-4 md:px-8 space-y-8">

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-slate-500">Tổng Đơn vị Máu</p>
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <Package className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">1,240 <span className="text-base font-medium text-slate-400">Đơn vị</span></h3>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-[#6324eb] h-full w-[70%]"></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">70% sức chứa kho</p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-slate-500">Sắp hết hạn (7 ngày)</p>
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">45 <span className="text-base font-medium text-slate-400">Đơn vị</span></h3>
                                    <p className="text-xs text-orange-600 mt-2 font-bold text-center bg-orange-50 inline-block px-2 py-1 rounded">Cần ưu tiên sử dụng</p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm ring-1 ring-red-500/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-slate-500">Cảnh báo Tồn kho thấp</p>
                                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                            <Droplet className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">O- & AB-</h3>
                                    <p className="text-xs text-red-500 mt-2 font-bold text-center bg-red-50 inline-block px-2 py-1 rounded">Dưới mức an toàn 15%</p>
                                </div>
                            </div>

                            {/* Inventory Table Section */}
                            <div className="bg-white dark:bg-[#1c162e] rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm flex flex-col">
                                {/* Toolbar */}
                                <div className="p-5 border-b border-[#ebe7f3] dark:border-[#2d263d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-[#120e1b] dark:text-white">Danh sách Tồn kho</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input className="pl-9 pr-4 py-2 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] text-sm focus:border-[#6324eb] outline-none bg-slate-50 dark:bg-[#251e36]" placeholder="Tìm kiếm..." />
                                        </div>
                                        <button className="flex items-center gap-2 px-3 py-2 border border-[#ebe7f3] dark:border-[#2d263d] rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                                            <Filter className="w-4 h-4" />
                                            Lọc
                                        </button>
                                        <button className="flex items-center gap-2 px-3 py-2 bg-[#6324eb] text-white rounded-lg text-sm font-bold hover:bg-[#501ac2] transition-colors shadow-lg shadow-[#6324eb]/20">
                                            <Plus className="w-4 h-4" />
                                            Nhập kho
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-[#251e36] text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                                                    <div className="flex items-center gap-1">Nhóm máu <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                                                    <div className="flex items-center gap-1">Số lượng (Túi) <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
                                                </th>
                                                <th className="px-6 py-4">Trạng thái</th>
                                                <th className="px-6 py-4">Cập nhật lần cuối</th>
                                                <th className="px-6 py-4 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#ebe7f3] dark:divide-[#2d263d]">
                                            {[
                                                { type: 'A+', count: 340, status: 'Ổn định', color: 'green', time: '10 phút trước' },
                                                { type: 'A-', count: 120, status: 'Ổn định', color: 'green', time: '1 giờ trước' },
                                                { type: 'B+', count: 280, status: 'Cao', color: 'blue', time: '2 giờ trước' },
                                                { type: 'B-', count: 95, status: 'Trung bình', color: 'yellow', time: '5 giờ trước' },
                                                { type: 'O+', count: 310, status: 'Cao', color: 'blue', time: '15 phút trước' },
                                                { type: 'O-', count: 15, status: 'Nguy kịch', color: 'red', time: 'Ngay bây giờ' },
                                                { type: 'AB+', count: 65, status: 'Trung bình', color: 'yellow', time: '1 ngày trước' },
                                                { type: 'AB-', count: 15, status: 'Nguy kịch', color: 'red', time: '3 giờ trước' },
                                            ].map((row) => (
                                                <tr key={row.type} className="hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-sm ${row.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                                            {row.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-[#120e1b] dark:text-white">{row.count}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.color === 'green' ? 'bg-green-100 text-green-700' :
                                                            row.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                                row.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{row.time}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-[#6324eb] p-2 rounded-full hover:bg-slate-100 transition-colors">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
