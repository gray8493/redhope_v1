"use client";

import React from 'react';
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import Link from "next/link";

export default function CampaignDetailsPage() {
    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .metric-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    transition: all 0.2s;
                }
                .metric-card:hover {
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
                .dark .metric-card {
                    background: #0f172a;
                    border-color: #1e293b;
                }
            `}</style>
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-white">
                <div className="flex h-full grow flex-row">
                    <HospitalSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                        <TopNav title="Chi tiết & Phân tích Chiến dịch" />

                        <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
                            {/* Campaign Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <Link href="/hospital/campaign" className="text-slate-400 hover:text-[#137fec] transition-colors">
                                            <span className="material-symbols-outlined">arrow_back</span>
                                        </Link>
                                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Đợt Khẩn cấp Nhóm máu O+</h1>
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                            <span className="size-2 bg-green-500 rounded-full"></span> Đang hoạt động
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">calendar_month</span> 12/10 - 15/10/2024</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">location_on</span> Sảnh chính, Tháp A</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">group</span> 12 Nhân viên</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined">share</span>
                                    </button>
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">table_view</span>
                                        Xuất Excel
                                    </button>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Goal Progress */}
                                <div className="metric-card lg:col-span-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tiến độ Mục tiêu</h3>
                                        <span className="material-symbols-outlined text-[#137fec]">analytics</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-black">42</span>
                                        <span className="text-slate-400 font-medium mb-1">/ 50 Đơn vị</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                                        <div className="bg-[#137fec] h-full rounded-full transition-all" style={{ width: '84%' }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#137fec] font-bold">84% Đã thu thập</span>
                                        <span className="text-slate-500">Còn 8 đơn vị</span>
                                    </div>
                                </div>

                                {/* Donor Registration */}
                                <div className="metric-card lg:col-span-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Đăng ký Người hiến</h3>
                                        <span className="material-symbols-outlined text-orange-500">person_add</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-4">
                                        <span className="text-3xl font-black">156</span>
                                        <span className="text-slate-400 font-medium mb-1">Người đã đăng ký</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAga-rqFcLFiRRDhbU4kEnkXa6VuhqCEjigSqCid55R11mBoiYdw9Bdk01ekhpIKn-00SDKKBd-mQLKbAcwMMLz_BR5Vj18xY3siCP8JxhiBypqWtIjTGpXghKUO4OeUpYumG7mSXB4THGjLsO6-wKYsWf7A1488ror3IOs55v3i8zKIFvoDaFTKkLCK7Ms_0wt3QCDlLcUzlsotKeIznIbzwJFpbpPbvVqFtlbjldRKTwWMpzyhnGDKKGoYOvkA_TyZzP_yeqmOCU4')" }}></div>
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClv-130taYt_YkMzdYfG2NgDtC1JIygKSOn8wCVwi8X5VZ4L2CV3dAXqeYEQ-233Kj-quReUT9UZNGc9EWrlByO7DeNGNMYzQ9Oy04iKDEVJMp6CYcEifXXKvt_L2JaaLn39_FR5PODpUOaoMAl_grhN7mpW21nvN26SizpkQQXRr7lX_b488Nvc2O9KSaLSsiZW-ulEXrTnr_Gf_scNWO5Nvqfd4aZqdo7ZGRQJmV5BNBdRWTX6D-zpJM4dCM25mvUA3i2Paf4-2G')" }}></div>
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMLdY2S9pIbL2fKGFAg1tvjvG7iS4OTZy02xeMXtql4KA7CfSlp9Ya2yJ_TwsOIVf4WjHsI6ejL2xOIT4PMRLrLKoDkq2vJG8ccT6MAXyC6zH0-JeSPc1kwfHfVAwoY2hucQ-MwugbMBs6lvC81jwxE2lg5DUV4Cv9gTzxN8vY8bpSmZDrfc5cQRbvJmKXZRbXuISvSIE8TkqFWHFLQXznS_RNPAbVlb7ToOGvpROq1JXFBHzmm6RnmOJAZ-2zJabFs4CjPeR24gO2')" }}></div>
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-[#137fec] flex items-center justify-center text-[10px] text-white font-bold">+153</div>
                                        </div>
                                        <span className="text-xs text-slate-500">Đăng ký gần nhất 5p trước</span>
                                    </div>
                                </div>

                                {/* Estimated Yield */}
                                <div className="metric-card lg:col-span-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sản lượng Ước tính</h3>
                                        <span className="material-symbols-outlined text-emerald-500">water_drop</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-black">74.2</span>
                                        <span className="text-slate-400 font-medium mb-1">Lít (Ước tính)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="text-green-500 font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">trending_up</span> +12%
                                        </span>
                                        <span>so với đợt trước</span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Schedule Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold">Lịch hẹn Hiến máu</h2>
                                        <p className="text-sm text-slate-500">Theo dõi check-in và phân bổ nhóm máu.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <label className="relative flex items-center">
                                            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
                                            <input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-[#137fec]/50 outline-none" placeholder="Tìm kiếm người hiến..." type="text" />
                                        </label>
                                        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
                                            <span className="material-symbols-outlined">filter_list</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên Người hiến</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nhóm máu</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Giờ hẹn</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#137fec] text-xs">NV</div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Nguyễn Văn A</div>
                                                            <div className="text-[11px] text-slate-500">Người hiến thường xuyên</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 uppercase">O+ (O Dương)</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">10:30</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Hoàn thành</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#137fec] hover:text-[#137fec]/80 transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#137fec] text-xs">TT</div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Trần Thị B</div>
                                                            <div className="text-[11px] text-slate-500">Người hiến mới</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase">A+ (A Dương)</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">11:15</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded">Đang tiến hành</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#137fec] hover:text-[#137fec]/80 transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#137fec] text-xs">LH</div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Lê Hoàng C</div>
                                                            <div className="text-[11px] text-slate-500">Thành viên Doanh nghiệp</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 uppercase">O- (O Âm)</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">11:45</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">Đang chờ</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#137fec] hover:text-[#137fec]/80 transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#137fec] text-xs">PT</div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Phạm Thùy D</div>
                                                            <div className="text-[11px] text-slate-500">Người hiến thường xuyên</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase">B+ (B Dương)</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">12:30</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">Đã đặt lịch</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#137fec] hover:text-[#137fec]/80 transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium">Hiển thị 4 trong tổng số 156 lịch hẹn</span>
                                    <div className="flex gap-2">
                                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        </button>
                                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <MiniFooter />
                    </div>
                </div>
            </div>
        </>
    );
}
