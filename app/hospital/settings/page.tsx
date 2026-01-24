"use client";

import {
    User,
    Bell,
    Shield,
    Save,
    Hotel,
    Mail,
    Phone,
    MapPin,
    Lock
} from "lucide-react";
import { useState } from "react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";

export default function SettingsPage() {
    const [emailAlert, setEmailAlert] = useState(true);
    const [newDonorAlert, setNewDonorAlert] = useState(false);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Cài đặt Hệ thống" />

                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[1000px] flex-1 px-4 md:px-8 space-y-8">

                            {/* Tabs (Visual only for now) */}
                            <div className="flex border-b border-[#ebe7f3] dark:border-[#2d263d] space-x-8">
                                <button className="pb-4 border-b-2 border-[#6324eb] text-[#6324eb] font-bold text-sm">Hồ sơ Bệnh viện</button>
                                <button className="pb-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">Thông báo</button>
                                <button className="pb-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">Bảo mật</button>
                                <button className="pb-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">Quản lý Nhân viên</button>
                            </div>

                            {/* Profile Settings */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Hotel className="w-5 h-5 text-slate-400" />
                                        Thông tin chung
                                    </h2>
                                </div>

                                <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên Bệnh viện</label>
                                            <input className="px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="Bệnh viện Đa khoa Trung tâm" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mã Định danh (Hospital ID)</label>
                                            <input className="px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-100 dark:bg-[#251e36]/50 text-slate-500 outline-none cursor-not-allowed" defaultValue="HOS-8821-XC" disabled />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Liên hệ</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="admins@cityhospital.org" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Số Điện thoại</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="+84 28 3933 9999" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Địa chỉ Trụ sở</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input className="w-full pl-10 px-4 py-3 rounded-lg border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] outline-none focus:border-[#6324eb] transition-colors" defaultValue="452 Đường Nguyễn Y, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                        <button className="flex items-center gap-2 px-6 py-3 bg-[#6324eb] text-white rounded-xl font-bold hover:bg-[#501ac2] transition-colors shadow-lg shadow-[#6324eb]/20">
                                            <Save className="w-4 h-4" />
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications Settings (Brief) */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-slate-400" />
                                        Cấu hình Thông báo
                                    </h2>
                                </div>
                                <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl border border-[#ebe7f3] dark:border-[#2d263d] shadow-sm space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#251e36] rounded-xl">
                                        <div>
                                            <p className="font-bold text-[#120e1b] dark:text-white">Cảnh báo Tồn kho Nguy cấp</p>
                                            <p className="text-xs text-slate-500">Gửi email khi lượng máu nhóm bất kỳ xuống dưới 10%</p>
                                        </div>
                                        <div
                                            className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${emailAlert ? 'bg-[#6324eb]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            onClick={() => setEmailAlert(!emailAlert)}
                                        >
                                            <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${emailAlert ? 'left-6' : 'left-1'}`}></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#251e36] rounded-xl">
                                        <div>
                                            <p className="font-bold text-[#120e1b] dark:text-white">Thông báo Người hiến mới</p>
                                            <p className="text-xs text-slate-500">Nhận thông báo khi có người hiến đăng ký yêu cầu của bạn</p>
                                        </div>
                                        <div
                                            className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${newDonorAlert ? 'bg-[#6324eb]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            onClick={() => setNewDonorAlert(!newDonorAlert)}
                                        >
                                            <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${newDonorAlert ? 'left-6' : 'left-1'}`}></span>
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
