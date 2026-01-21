import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';

const GlobalAnalyticsPage = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <style dangerouslySetInnerHTML={{
                __html: `
                .chart-grid { background-image: radial-gradient(#d7d0e7 1px, transparent 1px); background-size: 20px 20px; }
            `}} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-[#1f1f1f]">Phân tích Toàn cầu</h2>
                    <p className="text-xs text-gray-500 mt-1">Theo dõi các chỉ số quan trọng trên toàn hệ thống.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">30 Ngày</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-500">90 Ngày</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-500 text-nowrap">12 Tháng qua</button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#6324eb] text-white text-sm font-bold rounded-lg hover:bg-[#6324eb]/90 transition-all">
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Xuất dữ liệu</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-[#6324eb]/5 group-hover:text-[#6324eb]/10 transition-colors">
                        <span className="material-symbols-outlined text-8xl">favorite</span>
                    </div>
                    <div className="relative">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng số người được cứu</p>
                        <p className="text-3xl font-bold text-[#1f1f1f] mt-2">42,890</p>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
                            <span className="text-green-600 text-xs font-bold">+12.4% so với tháng trước</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-orange-500/5 group-hover:text-orange-500/10 transition-colors">
                        <span className="material-symbols-outlined text-8xl">emergency</span>
                    </div>
                    <div className="relative">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Yêu cầu máu đang hoạt động</p>
                        <p className="text-3xl font-bold text-[#1f1f1f] mt-2">156</p>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-orange-500 text-sm">error</span>
                            <span className="text-orange-600 text-xs font-bold">12 Khẩn cấp (Ưu tiên cao)</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-purple-500/5 group-hover:text-purple-500/10 transition-colors">
                        <span className="material-symbols-outlined text-8xl">stars</span>
                    </div>
                    <div className="relative">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng điểm đã cấp</p>
                        <p className="text-3xl font-bold text-[#1f1f1f] mt-2">1.2M</p>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-[#6324eb] text-sm">payments</span>
                            <span className="text-[#6324eb] text-xs font-bold">85% Tỷ lệ đổi điểm</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-[#1f1f1f]">Xu hướng hiến máu theo loại</h3>
                            <p className="text-xs text-gray-500 mt-0.5">So sánh khối lượng 30 ngày</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Nhóm O-</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#6324eb]"></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Nhóm A+</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1 min-h-[300px] chart-grid rounded-lg relative border border-gray-50 overflow-hidden">
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M0,80 Q10,75 20,85 T40,60 T60,65 T80,40 T100,50" fill="none" stroke="#6324eb" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                                <path d="M0,90 Q10,85 20,95 T40,80 T60,85 T80,70 T100,75" fill="none" stroke="#ef4444" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                                <path d="M0,80 Q10,75 20,85 T40,60 T60,65 T80,40 T100,50 L100,100 L0,100 Z" fill="url(#grad1)" opacity="0.1"></path>
                                <defs>
                                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#6324eb', stopOpacity: 1 }}></stop>
                                        <stop offset="100%" style={{ stopColor: '#6324eb', stopOpacity: 0 }}></stop>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute left-2 inset-y-4 flex flex-col justify-between text-[10px] text-gray-400 font-bold">
                                <span>1000</span><span>750</span><span>500</span><span>250</span><span>0</span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] text-gray-400 font-bold px-2">
                            <span>25 TH9</span><span>01 TH10</span><span>08 TH10</span><span>15 TH10</span><span>22 TH10</span><span>HÔM NAY</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-lg text-[#1f1f1f] mb-1">Phân phối kho máu</h3>
                    <p className="text-xs text-gray-500 mb-8">Tồn kho hiện tại theo nhóm máu</p>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative size-48 mb-8">
                            <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle className="text-gray-100" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12"></circle>
                                <circle className="transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#6324eb" strokeDasharray="251.2" strokeDashoffset="100" strokeWidth="12"></circle>
                                <circle className="transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#ef4444" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="12"></circle>
                                <circle className="transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#3b82f6" strokeDasharray="251.2" strokeDashoffset="240" strokeWidth="12"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-[#1f1f1f]">12.4k</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Tổng đơn vị</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#6324eb]"></div>
                                    <span className="text-xs text-gray-600">A+ Dương tính</span>
                                </div>
                                <span className="text-xs font-bold">42%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <span className="text-xs text-gray-600">O- Hiếm</span>
                                </div>
                                <span className="text-xs font-bold">18%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs text-gray-600">B+ Nhóm</span>
                                </div>
                                <span className="text-xs font-bold">25%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                    <span className="text-xs text-gray-600">Khác</span>
                                </div>
                                <span className="text-xs font-bold">15%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-[#1f1f1f]">Nhu cầu máu theo khu vực</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Phân bố địa lý các yêu cầu khẩn cấp</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button className="px-3 py-1 text-xs font-bold bg-white rounded shadow-sm text-gray-900">Bản đồ</button>
                        <button className="px-3 py-1 text-xs font-medium text-gray-500">Danh sách</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[400px]">
                    <div className="lg:col-span-3 bg-gray-50 p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
                            <img alt="World Map" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBrMZElY26yZikdwM5rAgDbQyzo9zVLJO0va5c19NpeWs20s_R00y8OYo18UBLvTGkQ-QbjteDF-ZPsvxqOfdxojQ4hNrJiPw3qenMB4eshK8QwipBZzLbvEFm056BmEYkvy53hczWpMyZtBcPEecEV0siHgVL7cAAdVKGra0k4Dpth0Z_n5qvJXPxp71HK_XwlOQkdWfOq_-KrkDAyaA5_ZLe8rR9ED5TBJ4Tj-RSZzfNF_oOq_x98zCesHy5Mq22gfsL9Fqw-Fc" />
                        </div>
                        <div className="relative h-full flex items-center justify-center">
                            <div className="absolute top-[20%] left-[30%]">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-12 h-12 bg-red-500/20 rounded-full animate-ping"></div>
                                    <div className="w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="absolute top-[50%] left-[45%]">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-20 h-20 bg-orange-500/20 rounded-full animate-pulse"></div>
                                    <div className="w-6 h-6 bg-orange-500 border-2 border-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="absolute bottom-[30%] right-[25%]">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-8 h-8 bg-red-500/20 rounded-full animate-ping"></div>
                                    <div className="w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 border-l border-gray-200 p-6 space-y-6">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Khu vực nhu cầu cao</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span className="text-sm font-semibold text-[#1f1f1f]">New York</span>
                                </div>
                                <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded">Khẩn cấp</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    <span className="text-sm font-semibold text-[#1f1f1f]">Austin, TX</span>
                                </div>
                                <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded">Trung bình</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span className="text-sm font-semibold text-[#1f1f1f]">Seattle, WA</span>
                                </div>
                                <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded">Cao</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-sm font-semibold text-[#1f1f1f]">Miami, FL</span>
                                </div>
                                <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded">Ổn định</span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">Cần bổ sung gấp</p>
                            <div className="bg-[#6324eb]/5 rounded-xl p-4">
                                <p className="text-xs font-bold text-[#6324eb] mb-1">Cần nhóm máu O-</p>
                                <p className="text-[10px] text-gray-500 leading-relaxed">Dự báo hệ thống cho thấy thiếu hụt 15% tại khu vực trong 72h tới.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAnalyticsPage;
