import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';

const DonorManagementPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">Quản lý Người hiến tặng</h2>
                    <p className="text-gray-500 text-sm">Giám sát, xác minh và quản lý mạng lưới người hiến tặng toàn cầu.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-lg">file_download</span>
                        Xuất dữ liệu
                    </button>
                    <button className="flex items-center gap-2 bg-[#6324eb] px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-opacity-90 transition-colors">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Thêm người hiến mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng số đăng ký</p>
                        <p className="text-xl font-bold text-[#120e1b]">12,842</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Đang chờ xác minh</p>
                        <p className="text-xl font-bold text-[#120e1b]">148</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Người hiến đã xác minh</p>
                        <p className="text-xl font-bold text-[#120e1b]">12,654</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên người hiến</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhóm máu</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái xác minh</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số điểm</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lần hiến gần nhất</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Row 1 */}
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-purple-100 flex items-center justify-center text-[#6324eb] font-bold text-xs overflow-hidden">
                                            <img alt="Sarah Miller" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4xAdMXDqQRrBwEzizbfBIJqRHRyyh2aD34bYuBTtwCMhbbemHpDQNDRU3Cu4rmhlxLGLut1-VgdHYcZFs_GzXbyYRT-0VyDtXScBK-AAcCrfmpMYpIA-kOqf3GR6Piod4dYeB9uTBD55k57uOjDc_WvOm5M0C2cWUx2hBEkPBNGY9PLK3LAj1rRj7QsCM_jDyesqWNRc_zhw67MmHrWgIHUHa-OFfyNXgYMr-Q2tJksKh-6WwcqFlOrzmYWrJESoe9z8paAqoSuE" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#120e1b]">Sarah Miller</span>
                                            <span className="text-[10px] text-gray-500">sarah.m@example.com</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold text-red-600 bg-red-50">O-</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">Chờ ID</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-purple-500 text-base">stars</span>
                                        <span className="text-sm font-bold text-[#120e1b]">2,450</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">12 Th10, 2023</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 rounded-lg hover:bg-[#6324eb]/5 text-gray-500 hover:text-[#6324eb] transition-colors" title="View Profile">
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                        <button className="p-2 rounded-lg bg-[#6324eb]/10 text-[#6324eb] hover:bg-[#6324eb]/20 transition-colors" title="Verify Donor">
                                            <span className="material-symbols-outlined text-xl">verified_user</span>
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Edit Details">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 2 */}
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden">
                                            <img alt="James Bennett" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRczXO1efqGb_knF591skbAbTUNjdB8epa4QFv8czA9uvXj5Epm3JSc3D0zacn35-HPvRc8w7H687QWvyqK0YYklSQYlm6xH0j-veS0zxCVLK0jZcIeX3R9Nw16lEPXWdN_GYuYGpJh6sozzA6zv_xNx7ygY6Y5EBwLQfk0gDiP1ovrD7rt_Mkg9rwB2zG7KHixnNmro3RaAsfevr2UM7Zmbh6trUcS7TKTc8d3GLyeqZzPLagz1Jjx5ZQ6ku7qymszUG_KBWjirk" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#120e1b]">James Bennett</span>
                                            <span className="text-[10px] text-gray-500">j.bennett@example.com</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold text-gray-700 bg-gray-100">A+</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Đã xác minh</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-purple-500 text-base">stars</span>
                                        <span className="text-sm font-bold text-[#120e1b]">5,100</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">28 Th9, 2023</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 rounded-lg hover:bg-[#6324eb]/5 text-gray-500 hover:text-[#6324eb] transition-colors">
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 3 */}
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs overflow-hidden">
                                            <img alt="Marcus Vance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB76USz5Gd5D8Sbby_KHL1_do3kq4nh32szJB8IEZUy28ZAgw3dqal8OHaY9iXjwJ5ML8d_xfQ3oWuMte9lgcXQICqePWKurKZEp_cCr0kic1H6r8yCdKjasNq6_tP6YW3Yii425DI7_TNDJ5AbOxqe1AxNRSGnUPHj8p_GZJz9o9-MefAopo9zsvaFF3bHNF1x53QcC7goqNbz6h1FgMCZJ6B1m4Khe_6T7nBC-4wBrsJJEKyDhPIf8vmHgxOZtQjE4zWHZlZTpaA" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#120e1b]">Marcus Vance</span>
                                            <span className="text-[10px] text-gray-500">mvance@example.org</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold text-gray-700 bg-gray-100">B+</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Bị gắn cờ</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-purple-500 text-base">stars</span>
                                        <span className="text-sm font-bold text-[#120e1b]">120</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">15 Th1, 2023</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 rounded-lg hover:bg-[#6324eb]/5 text-gray-500 hover:text-[#6324eb] transition-colors">
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-xl">report_problem</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 4 */}
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs overflow-hidden">
                                            <img alt="Elena Lopez" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFKWgpRok8xmQzFGclMtO3o63W6I8hYCX_5Ho4Yl0bKh0vOQ9P1U0P3IA6F3bOQqszf5DLyUai4Va7VQN68vHIj530S6HT6ChwTWJwD8W9Y8w9iIUMY-QTvBz4aZpKA-YZOp4n1mj2ZzeZQMA1UnwZn0t69DFe_NvfcRbcdIGncG87Tf5hFgxdhFIQg67yBe7zMM6lMAsfSaACCRZMCiV8nagytlw9iSJmO0xqLyicWkKSyajTJFU1Jn7Br8rufXHyQfCfuL-g5Y8" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#120e1b]">Elena Lopez</span>
                                            <span className="text-[10px] text-gray-500">elena.l@example.com</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold text-gray-700 bg-gray-100">B-</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Đã xác minh</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-purple-500 text-base">stars</span>
                                        <span className="text-sm font-bold text-[#120e1b]">3,800</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">02 Th11, 2023</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 rounded-lg hover:bg-[#6324eb]/5 text-gray-500 hover:text-[#6324eb] transition-colors">
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 5 */}
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs overflow-hidden">
                                            <img alt="David Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkY1_3WvN89VqK2NhLKprut8lwCuUNdEc-zupJ4iH5h9Rn1vA-EszuszbOes8yKIzB0fbEMk0QgLQd6M8VJCnHWj1HML9z3LtNG6eP4c5dCaDgY3KbNLl3j3ZTZ8BwHLzpS10Mi0f7b90OQTVRE7s7rohrrYGgko7A6q7NRKQZon0afxza7cnm23TBVjcZz2gD6olt6Y7R-yottpwFc8s1fYyOsvK7vwkLgxZPnTOaIPPp5LTGVtprXnuoPdhHdR0z4eOTjcpQE5s" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#120e1b]">David Chen</span>
                                            <span className="text-[10px] text-gray-500">d.chen@hospital.com</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold text-gray-700 bg-gray-100">AB+</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">Chờ ID</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-purple-500 text-base">stars</span>
                                        <span className="text-sm font-bold text-[#120e1b]">850</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">19 Th8, 2023</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 rounded-lg hover:bg-[#6324eb]/5 text-gray-500 hover:text-[#6324eb] transition-colors">
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        </button>
                                        <button className="p-2 rounded-lg bg-[#6324eb]/10 text-[#6324eb] hover:bg-[#6324eb]/20 transition-colors">
                                            <span className="material-symbols-outlined text-xl">verified_user</span>
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Hiển thị <span className="font-bold">5</span> trên <span className="font-bold">12,842</span> người hiến</p>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="px-3 py-1 rounded-lg bg-[#6324eb] text-white text-xs font-bold">1</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-xs font-bold">2</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-xs font-bold">3</button>
                        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorManagementPage;
