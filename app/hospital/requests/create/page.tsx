"use client";

import { useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    MapPin,
    Send,
    Save,
    User,
    FileText,
    Activity
} from "lucide-react";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function CreateRequestPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(false);
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                <HospitalSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="Tạo Yêu cầu Máu Mới" />

                    <main className="flex flex-1 justify-center py-10 px-4">
                        <div className="flex flex-col max-w-[800px] w-full gap-8">
                            {/* Page Heading */}
                            <div className="flex flex-col gap-2">
                                <h1 className="text-[#120e1b] dark:text-white text-3xl font-black leading-tight">Tạo Yêu cầu Máu Mới</h1>
                                <p className="text-slate-500 text-base font-normal">Điền thông tin yêu cầu để thông báo ngay lập tức cho người hiến phù hợp gần đây.</p>
                            </div>

                            <div className="bg-white dark:bg-[#1c162e] rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] p-8 shadow-sm">
                                {/* Section 1: Patient Information */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">1</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Thông tin Bệnh nhân</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[#120e1b] dark:text-white text-sm font-bold">Mã Hồ sơ Y tế / Mã Sự kiện (MRN)</label>
                                            <input className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all placeholder:text-slate-400" placeholder="MRN-123456" type="text" />
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Requirements */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">2</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Yêu cầu về Máu</h2>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <p className="text-[#120e1b] dark:text-white text-sm font-bold mb-3">Chọn Nhóm máu</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setSelectedBloodType(type)}
                                                        className={`flex h-12 items-center justify-center rounded-lg font-bold transition-all border-2 ${selectedBloodType === type
                                                            ? 'bg-[#6324eb] text-white border-[#6324eb] shadow-lg shadow-[#6324eb]/30 scale-105'
                                                            : 'bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white border-transparent hover:border-[#6324eb]/30 hover:bg-[#6324eb]/5'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Số lượng người hiến cần thiết</label>
                                                <input className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all" min="1" type="number" defaultValue="1" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Mức độ Khẩn cấp</label>
                                                <div className="flex p-1 bg-slate-100 dark:bg-[#251e36] rounded-xl h-12">
                                                    <button
                                                        onClick={() => setIsUrgent(false)}
                                                        className={`flex-1 rounded-lg text-sm font-bold transition-all ${!isUrgent
                                                            ? 'bg-white dark:bg-[#1c162e] shadow-sm text-[#6324eb] dark:text-white border border-slate-200 dark:border-slate-700'
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        Tiêu chuẩn
                                                    </button>
                                                    <button
                                                        onClick={() => setIsUrgent(true)}
                                                        className={`flex-1 rounded-lg text-sm font-bold transition-all ${isUrgent
                                                            ? 'bg-white dark:bg-[#1c162e] shadow-sm text-red-500 border border-slate-200 dark:border-slate-700'
                                                            : 'text-slate-500 hover:text-red-500/70 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        Khẩn cấp
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Location Details */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#6324eb] text-white text-sm font-bold">3</span>
                                        <h2 className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight">Địa điểm & Hậu cần</h2>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[#120e1b] dark:text-white text-sm font-bold">Điểm tiếp nhận (Bệnh viện/Trung tâm)</label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <input className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 pl-10 pr-4 text-base outline-none transition-all placeholder:text-slate-400" placeholder="Tìm tên bệnh viện hoặc địa chỉ" type="text" />
                                            </div>
                                        </div>

                                        {/* Map Placeholder */}
                                        <div className="w-full h-48 rounded-xl overflow-hidden border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-200 dark:bg-slate-800 relative group">
                                            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/HCMC_map.png/640px-HCMC_map.png')" }}></div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <MapPin className="text-[#6324eb] w-12 h-12 drop-shadow-lg animate-bounce" />
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-[#1c162e]/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-medium shadow-lg border border-white/20">
                                                <p className="text-[#6324eb] font-bold">Bệnh viện Đa khoa Trung tâm</p>
                                                <p className="text-slate-500">452 Đường Nguyễn Y, Quận 1, TP.HCM</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Khoa / Phòng</label>
                                                <input className="flex w-full rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all placeholder:text-slate-400" placeholder="Khoa Huyết học, Phòng 402" type="text" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[#120e1b] dark:text-white text-sm font-bold">Ngày giờ tiếp nhận / Thời hạn</label>
                                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                                    <PopoverTrigger asChild>
                                                        <button className="flex w-full items-center justify-between rounded-xl border border-[#ebe7f3] dark:border-[#2d263d] bg-slate-50 dark:bg-[#251e36] text-[#120e1b] dark:text-white hover:border-[#6324eb] focus:border-[#6324eb] focus:ring-1 focus:ring-[#6324eb] h-12 px-4 text-base outline-none transition-all">
                                                            <span className={selectedDate ? "" : "text-slate-400"}>
                                                                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày và giờ"}
                                                            </span>
                                                            <CalendarIcon className="text-slate-400 w-5 h-5" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={selectedDate}
                                                            onSelect={(date) => {
                                                                setSelectedDate(date);
                                                                setIsCalendarOpen(false);
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Footer Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-[#ebe7f3] dark:border-[#2d263d]">
                                    <button className="w-full sm:flex-1 h-14 bg-[#6324eb] text-white rounded-xl font-bold text-lg hover:bg-[#501ac2] transition-all shadow-lg shadow-[#6324eb]/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                                        <Send className="w-5 h-5" />
                                        Đăng Yêu cầu
                                    </button>
                                    <button className="w-full sm:w-auto px-8 h-14 bg-slate-100 dark:bg-[#251e36] text-[#120e1b] dark:text-white rounded-xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-[#2d263d] transition-all flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Save className="w-5 h-5" />
                                        Lưu Nháp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
