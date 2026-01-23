"use client";

import React, { useState } from 'react';
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import Link from 'next/link';
export default function CampaignManagementPage() {
    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .locked-overlay {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(4px);
                }
            `}</style>
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-white">
                <div className="flex h-full grow flex-row">
                    <HospitalSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                        <TopNav title="Quản lý Chiến dịch" />

                        <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto">


                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chiến dịch Bệnh viện</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-base">Theo dõi các đợt hiến máu đang diễn ra và dữ liệu lịch sử.</p>
                                </div>
                                <div className="flex gap-3">
                                    {/* Buttons removed as requested */}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col lg:flex-row items-center gap-4 transition-colors">
                                <div className="relative w-full lg:flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#137fec]/50 text-slate-900 dark:text-white placeholder-slate-500 outline-none transition-all" placeholder="Tìm kiếm tên chiến dịch hoặc ID..." type="text" />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                    <div className="relative w-full sm:w-48">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">location_on</span>
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#137fec]/50 text-slate-900 dark:text-white appearance-none outline-none transition-all">
                                            <option value="">Thành phố / Khu vực</option>
                                            <option value="downtown">Trung tâm</option>
                                            <option value="north">Quận Bắc</option>
                                            <option value="east">Thung lũng Đông</option>
                                            <option value="west">Phía Tây</option>
                                        </select>
                                    </div>
                                    <div className="relative w-full sm:w-64">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">calendar_month</span>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#137fec]/50 text-slate-900 dark:text-white outline-none transition-all"
                                            onBlur={(e) => (e.target.type = 'text')}
                                            onFocus={(e) => (e.target.type = 'date')}
                                            placeholder="Chọn khoảng thời gian"
                                            type="text"
                                        />
                                    </div>
                                    <button className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-white transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        Áp dụng bộ lọc
                                    </button>
                                </div>
                            </div>

                            {/* Active Campaigns */}
                            <div className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span> Chiến dịch Đang hoạt động
                                </h2>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">3 Kết quả tìm thấy</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {/* Campaign Card 1 */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg aspect-[4/5]">
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkwqmAqLI6RRbjwFBWAQepU9EHp2QwQrSXSpz2egp-_MAoQKAp2b_mINCI3B3qDzgMx-O-doNpPCosqmbxPw9v6DNohOs_zJ2vn3RcizDE7GkgblK-BRih8n9qkG4WMG-5qm8ZkrBY-ZDvufrqAFdozTbQvyq0g1NhXAhav-Op6honeKgmN_OJYTk8GUgcbNU3uiqkTT2ej2gqadiIxfU3NZHY9WYeTbSf5FTEZeiM4Jq6ZpgPp3dPSAI-93yojBe68-TkJEZb548a')" }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center locked-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-slate-100">
                                                <span className="material-symbols-outlined text-sm text-[#137fec]">lock</span>
                                                <span className="text-[11px] font-bold text-slate-700 uppercase">Cố định địa điểm</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-red-600 text-white text-[9px] font-black uppercase rounded shadow-sm">Khẩn cấp</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-1">
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Nhóm máu O+</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2 truncate">Đợt hiến máu Sảnh chính</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">Đợt khẩn cấp để bổ sung kho dự trữ chấn thương tại Cánh Trung tâm.</p>
                                        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span> 4h nữa
                                            </span>
                                            <Link className="text-[11px] font-bold text-[#137fec] hover:text-[#137fec]/80 transition-colors uppercase tracking-tight" href="/hospital/campaign/1">Xem chi tiết</Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaign Card 2 */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg aspect-[4/5]">
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAot4xPAMUp5lUIPsSJJyccROrnkYYprQzv7ryqFHlteSunaA__adl4furC22nAiULqkv6sVxlSnwmMJdJ5H4N3kx8XXtIJAUK37egDeP42nbmQtlcqiPPC3HNdzxRfJFTW2S3tCC8tDt5wTl5Jp_riORSErmlLpzNJ53S5gvuSIqk4riLTHBMiLq-tTtC7p0Kiy0gSoBx6CJ1gCakYwK8CRA6_wF46IumEs03BqwY5lnBtZLEHOjRsF1tVBHRqt1le6I1IkOdV10e8')" }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center locked-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-slate-100">
                                                <span className="material-symbols-outlined text-sm text-[#137fec]">lock</span>
                                                <span className="text-[11px] font-bold text-slate-700 uppercase">Cố định địa điểm</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-orange-500 text-white text-[9px] font-black uppercase rounded shadow-sm">Sắp hết</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-1">
                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">Nhóm máu B-</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2 truncate">Trạm lưu động B</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">Tìm kiếm người hiến máu cho kho dự trữ máu khu vực. Đợt định kỳ.</p>
                                        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span> 12h nữa
                                            </span>
                                            <Link className="text-[11px] font-bold text-[#137fec] hover:text-[#137fec]/80 transition-colors uppercase tracking-tight" href="/hospital/campaign/1">Xem chi tiết</Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaign Card 3 */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg aspect-[4/5]">
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZiNSYWEy5ZAjxyaFcmn3iOyddBWPAo-t4t2XsfTJGxeJi9pEE3PcQvHukQOiZiZfZKJ_NqFXxSTeco2-MSerQKRL5_r53tmMnHyXvtxhRQzJ-vzOaZ2giorfxNjOUDLlGVHBskP1VPCvzakxwSAOsMZr4J8ReKbJJN6CCOy0gM-ah-B09uje6IwWuV197aU3UNyQYOKs0zvUVmjFBEd3wBkFq6J8WRnVolp_edDc9AwGCPjvU6M1HOqDmErPtLflVEa6odlYKvEr2')" }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center locked-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-slate-100">
                                                <span className="material-symbols-outlined text-sm text-[#137fec]">lock</span>
                                                <span className="text-[11px] font-bold text-slate-700 uppercase">Cố định địa điểm</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded shadow-sm">Định kỳ</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-1">
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">Nhóm máu A+</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2 truncate">Dạ tiệc Tại Phòng khiêu vũ</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">Dạ tiệc hiến máu thường niên tại Phòng khiêu vũ lớn kèm khám sức khỏe.</p>
                                        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span> 2 ngày nữa
                                            </span>
                                            <Link className="text-[11px] font-bold text-[#137fec] hover:text-[#137fec]/80 transition-colors uppercase tracking-tight" href="/hospital/campaign/1">Xem chi tiết</Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaign Card 4 */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg aspect-[4/5]">
                                    <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZiNSYWEy5ZAjxyaFcmn3iOyddBWPAo-t4t2XsfTJGxeJi9pEE3PcQvHukQOiZiZfZKJ_NqFXxSTeco2-MSerQKRL5_r53tmMnHyXvtxhRQzJ-vzOaZ2giorfxNjOUDLlGVHBskP1VPCvzakxwSAOsMZr4J8ReKbJJN6CCOy0gM-ah-B09uje6IwWuV197aU3UNyQYOKs0zvUVmjFBEd3wBkFq6J8WRnVolp_edDc9AwGCPjvU6M1HOqDmErPtLflVEa6odlYKvEr2'); filter: grayscale(1)" }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center locked-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-slate-100">
                                                <span className="material-symbols-outlined text-sm text-[#137fec]">lock</span>
                                                <span className="text-[11px] font-bold text-slate-700 uppercase">Cố định địa điểm</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-slate-500 text-white text-[9px] font-black uppercase rounded shadow-sm">Đang lên KH</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-1">
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Tất cả loại</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2 truncate">Đợt hiến máu Khu công nghệ</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">Sự kiện đối tác doanh nghiệp sắp tới tại Khu Thương mại phía Bắc.</p>
                                        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">calendar_today</span> Tuần tới
                                            </span>
                                            <Link className="text-[11px] font-bold text-[#137fec] hover:text-[#137fec]/80 transition-colors uppercase tracking-tight" href="/hospital/campaign/1">Xem chi tiết</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campaign History */}
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử Chiến dịch</h2>
                                <div className="flex items-center gap-3">
                                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-9">
                                        <button className="px-3 bg-slate-50 dark:bg-slate-800 text-xs font-bold border-r border-slate-200 dark:border-slate-700">Gần đây</button>
                                        <button className="px-3 text-xs font-bold text-slate-500 hover:bg-slate-50">Theo ngày</button>
                                        <button className="px-3 text-xs font-bold text-slate-500 hover:bg-slate-50">Theo mục tiêu</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên chiến dịch</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Địa điểm</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Đạt mục tiêu</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Tổng đơn vị</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Dạ tiệc Hiến máu Mùa xuân</div>
                                                    <div className="text-[11px] text-slate-500">Sự kiện toàn bệnh viện</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">12/03 - 15/03/2024</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Phòng khiêu vũ lớn</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                                            <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-green-600">108%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-center">542</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link className="text-[#137fec] text-sm font-bold hover:underline" href="/hospital/campaign/1">Xem chi tiết</Link>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Đợt vận động Đối tác Doanh nghiệp</div>
                                                    <div className="text-[11px] text-slate-500">Văn phòng Khu công nghệ</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">28/02/2024</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Phòng khám Vệ tinh</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                                            <div className="bg-[#137fec] h-full rounded-full" style={{ width: '92%' }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">92%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-center">184</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link className="text-[#137fec] text-sm font-bold hover:underline" href="/hospital/campaign/1">Xem chi tiết</Link>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Khởi động Năm mới</div>
                                                    <div className="text-[11px] text-slate-500">Tiếp cận cộng đồng</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">10/01 - 12/01/2024</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Xe lưu động B</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                                            <div className="bg-[#137fec] h-full rounded-full" style={{ width: '75%' }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">75%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-center">300</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link className="text-[#137fec] text-sm font-bold hover:underline" href="/hospital/campaign/1">Xem chi tiết</Link>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Hiển thị 3 trong tổng số 42 chiến dịch cũ</span>
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
