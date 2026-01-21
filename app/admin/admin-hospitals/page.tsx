import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';

const HospitalDirectoryPage = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Quản lý Danh mục Bệnh viện</h2>
                    <p className="text-gray-500 text-sm">Duy trì và giám sát tất cả các cơ sở y tế trong mạng lưới BloodLink.</p>
                </div>
                <button className="bg-[#6324eb] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-[#6324eb]/20">
                    <span className="material-symbols-outlined">add</span>
                    <span>Đăng ký Bệnh viện mới</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                        <span className="material-symbols-outlined">corporate_fare</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Tổng đối tác</p>
                        <p className="text-xl font-bold text-[#1f1f1f]">124</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg text-orange-600">
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Đang chờ duyệt</p>
                        <p className="text-xl font-bold text-[#1f1f1f]">18</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-green-600">
                        <span className="material-symbols-outlined">volunteer_activism</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Tổng thu thập</p>
                        <p className="text-xl font-bold text-[#1f1f1f]">48,200 <span className="text-xs font-medium">đơn vị</span></p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <select className="bg-gray-100 border-none text-xs font-bold rounded-lg focus:ring-[#6324eb] py-2 pr-8">
                            <option>Tất cả trạng thái</option>
                            <option>Đã xác minh</option>
                            <option>Đang chờ</option>
                            <option>Đang xem xét</option>
                        </select>
                        <select className="bg-gray-100 border-none text-xs font-bold rounded-lg focus:ring-[#6324eb] py-2 pr-8">
                            <option>Tất cả địa điểm</option>
                            <option>New York</option>
                            <option>California</option>
                            <option>Texas</option>
                        </select>
                    </div>
                    <p className="text-xs text-gray-500">Hiển thị 1-10 trên 124 bệnh viện</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Bệnh viện</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Địa điểm</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Yêu cầu hoạt động</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Tổng thu thập</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-[#6324eb] overflow-hidden">
                                            <span className="material-symbols-outlined text-2xl">local_hospital</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#1f1f1f]">City General Hospital</span>
                                            <span className="text-[10px] text-gray-500 font-medium">ID: HL-8829-NY</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700">New York, NY</span>
                                        <span className="text-[10px] text-gray-500">Manhattan District</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Đã xác minh</span>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">12</td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">4,250</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Edit">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate">
                                            <span className="material-symbols-outlined text-xl">block</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-[#6324eb] overflow-hidden">
                                            <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#1f1f1f]">St. Jude Medical Center</span>
                                            <span className="text-[10px] text-gray-500 font-medium">ID: HL-4412-TX</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700">Austin, TX</span>
                                        <span className="text-[10px] text-gray-500">Central Travis</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">Đang chờ</span>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">0</td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">0</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1.5 text-[#6324eb] hover:bg-[#6324eb]/5 rounded-lg border border-[#6324eb]/20 flex items-center gap-1 px-3" title="Approve">
                                            <span className="material-symbols-outlined text-sm font-bold">verified_user</span>
                                            <span className="text-[10px] font-bold uppercase">Phê duyệt</span>
                                        </button>
                                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                                            <span className="material-symbols-outlined text-xl">more_vert</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-[#6324eb] overflow-hidden">
                                            <span className="material-symbols-outlined text-2xl">emergency</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#1f1f1f]">Hope Springs Clinic</span>
                                            <span className="text-[10px] text-gray-500 font-medium">ID: HL-3291-WA</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700">Seattle, WA</span>
                                        <span className="text-[10px] text-gray-500">King County</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">Đang xem xét</span>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">3</td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">1,120</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Edit">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate">
                                            <span className="material-symbols-outlined text-xl">block</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-[#6324eb] overflow-hidden">
                                            <span className="material-symbols-outlined text-2xl">medical_services</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#1f1f1f]">Community Care Hub</span>
                                            <span className="text-[10px] text-gray-500 font-medium">ID: HL-1055-CA</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700">Los Angeles, CA</span>
                                        <span className="text-[10px] text-gray-500">Downtown</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Đã xác minh</span>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">24</td>
                                <td className="px-6 py-4 text-center font-semibold text-sm text-[#1f1f1f]">18,400</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Edit">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate">
                                            <span className="material-symbols-outlined text-xl">block</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between">
                    <button className="text-sm font-bold text-gray-500 hover:text-[#6324eb] transition-colors flex items-center gap-1 disabled:opacity-50" disabled>
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                        Trước
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="size-8 rounded-lg bg-[#6324eb] text-white text-xs font-bold">1</button>
                        <button className="size-8 rounded-lg hover:bg-gray-100 text-xs font-bold transition-colors">2</button>
                        <button className="size-8 rounded-lg hover:bg-gray-100 text-xs font-bold transition-colors">3</button>
                        <span className="px-2 text-gray-400">...</span>
                        <button className="size-8 rounded-lg hover:bg-gray-100 text-xs font-bold transition-colors">13</button>
                    </div>
                    <button className="text-sm font-bold text-gray-500 hover:text-[#6324eb] transition-colors flex items-center gap-1">
                        Tiếp
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HospitalDirectoryPage;
