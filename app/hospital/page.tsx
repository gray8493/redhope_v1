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
    Trophy,
    Radar,
    Zap,
    UserCheck,
    FileText,
    Users
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
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Phiếu Yêu cầu chờ</p>
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">12 <span className="text-base font-medium text-gray-400">Lô</span></h3>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
                                        <AlertTriangle className="w-3 h-3 text-orange-500" /> 3 yêu cầu cấp bách
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm hover:shadow-md transition-shadow overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Radar className="w-20 h-20 -mr-4 -mt-4 text-indigo-600" />
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Ra đa Người hiến (5km)</p>
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <Radar className="w-5 h-5 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">150 <span className="text-base font-medium text-gray-400">Người</span></h3>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1 font-bold">
                                        <Activity className="w-3 h-3" /> Nguồn lực dồi dào sẵn có
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Hiệu suất Đáp ứng</p>
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#120e1b] dark:text-white">25 <span className="text-base font-medium text-gray-400">Phút</span></h3>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> -15% so với tháng trước
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-8 items-start">
                                {/* Batch Requests Table */}
                                <div className="col-span-12 lg:col-span-8 space-y-4 text-left">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-[#120e1b] dark:text-white">Phiếu Yêu cầu Máu (Batch Requests)</h2>
                                        <button
                                            onClick={() => router.push("/hospital/requests")}
                                            className="text-sm text-slate-500 font-bold hover:text-[#120e1b] hover:underline flex items-center gap-1 transition-colors">
                                            Lịch sử phiếu <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-2xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 dark:bg-[#251e36] text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">
                                                    <tr>
                                                        <th className="px-6 py-4">Mã Phiếu</th>
                                                        <th className="px-6 py-4">Nội dung Yêu cầu</th>
                                                        <th className="px-6 py-4">Nhóm máu</th>
                                                        <th className="px-6 py-4">Số lượng</th>
                                                        <th className="px-6 py-4">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#ebe7f3] dark:divide-[#2d263d]">
                                                    {[
                                                        { id: "REQ-001", title: "Cấp cứu Tai nạn liên hoàn", type: "O Positive (O+)", count: "10 Đơn vị", status: "Nguy kịch", class: "bg-red-100 text-red-700" },
                                                        { id: "REQ-002", title: "Dự trù mổ tim - Sáng mai", type: "A Positive (A+)", count: "5 Đơn vị", status: "Cao", class: "bg-orange-100 text-orange-700" },
                                                        { id: "REQ-003", title: "Điều trị Ung thư định kỳ", type: "B Negative (B-)", count: "2 Đơn vị", status: "Bình thường", class: "bg-emerald-100 text-emerald-700" },
                                                    ].map((req, i) => (
                                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#251e36] transition-colors group cursor-pointer">
                                                            <td className="px-6 py-5 text-sm font-black text-indigo-600">{req.id}</td>
                                                            <td className="px-6 py-5">
                                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{req.title}</p>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold">{req.type}</span>
                                                            </td>
                                                            <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-400">{req.count}</td>
                                                            <td className="px-6 py-5">
                                                                <span className={`px-2.5 py-1 ${req.class} rounded-md text-[10px] font-black uppercase tracking-wider`}>{req.status}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Virtual Reception / Incoming Queue */}
                                <div className="col-span-12 lg:col-span-4 space-y-4 text-left">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-[#120e1b] dark:text-white">Quầy Check-in Ảo</h2>
                                        <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold animate-pulse">LIVE</span>
                                    </div>
                                    <div className="bg-white dark:bg-[#1c162e] border border-[#ebe7f3] dark:border-[#2d263d] rounded-2xl p-6 shadow-sm space-y-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-4">
                                            <Users className="w-4 h-4" /> Danh sách người hiến đang đến
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                { name: "Nguyễn Văn A", time: "10:30 AM", eta: "5 phút", group: "O+", status: "incoming" },
                                                { name: "Trần Thị B", time: "11:00 AM", eta: "15 phút", group: "B-", status: "incoming" },
                                                { name: "Lê Văn C", time: "11:30 AM", eta: "Đã đến", group: "AB+", status: "waiting" },
                                            ].map((person, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                                            {person.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{person.name}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                                <span>{person.group}</span>
                                                                <span>•</span>
                                                                <span className={person.eta === "Đã đến" ? "text-emerald-500" : ""}>{person.eta}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {person.eta === "Đã đến" ? (
                                                        <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors">
                                                            Lấy máu
                                                        </button>
                                                    ) : (
                                                        <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase transition-all">
                                                            Check-in
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-bold hover:border-indigo-500 hover:text-indigo-500 transition-all">
                                            + Quét mã QR tại chỗ
                                        </button>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500 text-white rounded-lg">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Thời gian chờ trung bình</p>
                                                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">12 Phút <span className="text-[10px] opacity-60 font-medium tracking-normal lowercase">(Optimal)</span></p>
                                            </div>
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
