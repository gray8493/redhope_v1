import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-[#1f1f1f]">Bảng điều khiển</h2>
                <p className="text-gray-500 text-sm">Chào mừng bạn quay trở lại với hệ thống quản trị REDHOPE.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng người hiến</p>
                    <p className="text-2xl font-bold text-[#120e1b] mt-1">12,842</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +12% so với tháng trước
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bệnh viện đối tác</p>
                    <p className="text-2xl font-bold text-[#120e1b] mt-1">84</p>
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Mới thêm 2 bệnh viện
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Yêu cầu máu</p>
                    <p className="text-2xl font-bold text-[#120e1b] mt-1">156</p>
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">pending</span>
                        24 yêu cầu đang xử lý
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Điểm thưởng cấp</p>
                    <p className="text-2xl font-bold text-[#120e1b] mt-1">45.2K</p>
                    <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">stars</span>
                        Vouchers đã phát hành
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#120e1b] mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                            <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">person</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[#120e1b]">Người hiến tặng mới #120{i} vừa đăng ký</p>
                                <p className="text-xs text-gray-500">2 giờ trước</p>
                            </div>
                            <Link href="/admin/admin-donor" className="text-xs font-semibold text-[#6324eb] hover:underline">Chi tiết</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
