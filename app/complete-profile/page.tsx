"use client";

import {
    Droplet,
    ShieldCheck,
    ArrowRight,
    Mail,
    User,
    Phone,
    CreditCard,
    Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function CreateProfilePage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "admin@example.com",
        phone: "",
        idCard: "",
        dob: ""
    });
    const [gender, setGender] = useState("Nam");
    const [bloodGroup, setBloodGroup] = useState("A+");
    const [progress, setProgress] = useState(25); // Baseline for readonly fields (email) + defaults
    const [selectedDob, setSelectedDob] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        // Logic for 50% max on this page
        // Fields to fill: Name, Phone, ID, DOB. (Email is pre-filled, Gender/Blood default)
        // Total 'effort' fields = 4.
        // Base score = 10% (for defaults). Max add = 40%.

        let filledCount = 0;
        if (formData.fullName.length > 2) filledCount++;
        if (formData.phone.length > 8) filledCount++;
        if (formData.idCard.length > 8) filledCount++;
        if (formData.dob) filledCount++;

        const calculated = 10 + (filledCount * 10); // 10, 20, 30, 40, 50
        setProgress(calculated);
    }, [formData]);

    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] font-sans text-[#0d121b] dark:text-gray-100">

            {/* Main Content */}
            <main className="flex justify-center py-10 px-4">
                <div className="w-full max-w-[800px] flex flex-col gap-6">

                    {/* Card */}
                    <div className="bg-white dark:bg-[#151c2c] rounded-xl shadow-sm border border-[#cfd7e7] dark:border-gray-800 overflow-hidden">

                        {/* Progress Header */}
                        <div className="p-8 border-b border-[#cfd7e7] dark:border-gray-800">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <h1 className="text-2xl font-bold">Hoàn thiện hồ sơ</h1>
                                    <span className="text-[#2b6cee] text-sm font-semibold bg-[#2b6cee]/10 px-3 py-1 rounded-full whitespace-nowrap">
                                        Bước 1 / 2
                                    </span>
                                </div>

                                <p className="text-[#4c669a] dark:text-gray-400 text-sm">
                                    Chào mừng! Vui lòng cung cấp thông tin cá nhân để chúng tôi có thể hỗ trợ bạn tốt nhất.
                                </p>

                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Tiến độ hồ sơ</p>
                                        <p className="text-sm font-medium">{progress}%</p>
                                    </div>
                                    <div className="h-2 w-full bg-[#cfd7e7] dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#2b6cee] rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-8">
                            <form className="flex flex-col gap-8">

                                {/* Section 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tiêu đề mục */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                                            Thông tin định danh
                                        </h3>
                                        <p className="text-[#4c669a] dark:text-gray-400 text-sm">
                                            Thông tin cơ bản để xác thực danh tính của bạn.
                                        </p>
                                    </div>

                                    {/* Họ và tên */}
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</span>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="VD: Nguyễn Văn A"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Đăng nhập)</span>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder={formData.email ? "" : "VD: admin@example.com"}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm bg-gray-50 dark:opacity-70 "
                                            />
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                    </label>

                                    {/* Số điện thoại */}
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</span>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+84 90 123 4567"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                    </label>

                                    {/* Số CCCD */}
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số CCCD / CMND</span>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="idCard"
                                                value={formData.idCard}
                                                onChange={handleChange}
                                                placeholder="Nhập 12 số CCCD"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                    </label>
                                </div>

                                <hr className="border-[#cfd7e7] dark:border-gray-800" />

                                {/* Section 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-bold mb-1">Thông tin chi tiết</h3>
                                        <p className="text-[#4c669a] dark:text-gray-400 text-sm">Các thông tin bổ sung giúp hoàn thiện hồ sơ.</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày sinh</span>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] hover:border-[#2b6cee] focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm text-left"
                                                >
                                                    <span className={selectedDob ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                                                        {selectedDob ? format(selectedDob, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày sinh"}
                                                    </span>
                                                    <CalendarIcon className="text-gray-400 w-5 h-5" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDob}
                                                    onSelect={(date) => {
                                                        setSelectedDob(date);
                                                        if (date) {
                                                            setFormData(prev => ({ ...prev, dob: format(date, "yyyy-MM-dd") }));
                                                        }
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    captionLayout="dropdown"
                                                    fromYear={1940}
                                                    toYear={2010}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium">Giới tính</span>
                                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#1a2332] rounded-lg h-[50px]">
                                            {["Nam", "Nữ", "Khác"].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setGender(g)}
                                                    className={`flex-1 rounded-md text-sm font-medium transition-all ${gender === g
                                                        ? "bg-white dark:bg-gray-700 text-[#2b6cee] shadow-sm font-bold"
                                                        : "text-gray-500 hover:bg-white/50"
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Grid Selection (Blood Group) */}
                                    <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhóm máu</span>
                                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                                <button
                                                    key={bg}
                                                    type="button"
                                                    onClick={() => setBloodGroup(bg)}
                                                    className={`h-12 flex items-center justify-center rounded-lg border transition-all text-sm font-bold ${bloodGroup === bg
                                                        ? "border-[#2b6cee] bg-[#2b6cee]/10 text-[#2b6cee]"
                                                        : "border-[#cfd7e7] dark:border-gray-700 hover:border-[#2b6cee] hover:text-[#2b6cee] dark:text-gray-200"
                                                        }`}
                                                >
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Privacy Badge */}
                                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-[#2b6cee]/10 rounded-lg text-[#2b6cee]">
                                    <ShieldCheck className="w-6 h-6 shrink-0" />
                                    <p className="text-xs text-[#4c669a] dark:text-blue-200">
                                        Thông tin của bạn được mã hóa an toàn và chỉ được sử dụng cho mục đích xác thực nội bộ.
                                        Chúng tôi cam kết không chia sẻ dữ liệu cho bên thứ ba.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4">
                                    <Link href="/login">
                                        <button
                                            type="button"
                                            className="px-6 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            Quay lại
                                        </button>
                                    </Link>
                                    <Link href="/complete-profile/verification">
                                        <button
                                            type="button"
                                            className="px-8 py-3 rounded-lg bg-[#2b6cee] hover:bg-[#2b6cee]/90 text-white font-bold text-sm shadow-lg shadow-[#2b6cee]/30 flex items-center gap-2 transition-transform active:scale-95"
                                        >
                                            Tiếp tục
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>

                            </form>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-center gap-6 py-4">
                        <Link href="#" className="text-xs text-[#4c669a] hover:underline">Chính sách bảo mật</Link>
                        <Link href="#" className="text-xs text-[#4c669a] hover:underline">Điều khoản sử dụng</Link>
                        <Link href="#" className="text-xs text-[#4c669a] hover:underline">Trung tâm hỗ trợ</Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
