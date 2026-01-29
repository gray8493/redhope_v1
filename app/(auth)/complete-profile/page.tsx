"use client";

import {
    User,
    Phone,
    MapPin,
    Droplet,
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BLOOD_GROUPS } from "@/lib/database.types";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { LocationSelector } from "@/components/shared/LocationSelector";
// import RoleGuard from "@/components/auth/RoleGuard";

export default function DonorProfileStep1() {
    return (
        <DonorProfileContent />
    );
}

function DonorProfileContent() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        full_name: user?.user_metadata?.full_name || "",
        phone: user?.phone || "",
        blood_group: "O+",
        gender: "Nam",
        dob: "",
        city: "",
        district: "",
        address: ""
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.user_metadata?.full_name || prev.full_name,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            // Validate Age >= 18
            if (formData.dob) {
                const birthDate = new Date(formData.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    setError("Theo quy định, bạn cần đủ 18 tuổi trở lên để tham gia hiến máu.");
                    setSubmitting(false);
                    return;
                }
            } else {
                setError("Vui lòng nhập ngày sinh.");
                setSubmitting(false);
                return;
            }

            const role = user?.role || "donor";

            // Clean data: empty strings should be null
            const cleanData = {
                ...formData,
                dob: formData.dob || null,
                phone: formData.phone || null,
                city: formData.city || null,
                district: formData.district || null,
                address: formData.address || null,
                email: user?.email,
                role: role as any
            };

            if (!user?.id) {
                console.error("No userId found for submission.");
                setError("Không thể xác định danh tính người dùng. Vui lòng đăng nhập lại.");
                setSubmitting(false);
                return;
            }

            // 1. Lưu dữ liệu
            await userService.upsert(user.id, cleanData);

            // 2. Refresh dữ liệu trong AuthContext
            if (refreshUser) await refreshUser();

            // 3. Chuyển hướng
            router.push("/complete-profile/verification");
        } catch (err: any) {
            // Log full error internally for diagnostics
            console.error("Update failed detailed:", err);

            // Return a user-safe message
            setError("Lỗi: Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

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
                                    <h1 className="text-2xl font-bold">Thông tin cá nhân cơ bản</h1>
                                    <span className="text-[#2b6cee] text-sm font-semibold bg-[#2b6cee]/10 px-3 py-1 rounded-full whitespace-nowrap">
                                        Bước 1 / 2
                                    </span>
                                </div>

                                <p className="text-[#4c669a] dark:text-gray-400 text-sm">
                                    Chào mừng anh/chị quay trở lại. Vui lòng hoàn thiện các thông tin cơ bản để tiếp tục hành trình hiến máu.
                                </p>

                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Tiến độ hồ sơ</p>
                                        <p className="text-sm font-medium">50%</p>
                                    </div>
                                    <div className="h-2 w-full bg-[#cfd7e7] dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#2b6cee] w-1/2 rounded-full transition-all duration-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                        {error}
                                    </div>
                                )}

                                {/* Section 1: Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Thông tin chung</h3>
                                        <p className="text-[#4c669a] dark:text-gray-400 text-sm">Cung cấp thông tin liên hệ và nhận diện cơ bản.</p>
                                    </div>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</span>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</span>
                                        <div className="relative">
                                            <input
                                                required
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày sinh</span>
                                        <div className="relative">
                                            <input
                                                required
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Giới tính</span>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] outline-none text-sm"
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhóm máu</span>
                                        <div className="relative">
                                            <select
                                                name="blood_group"
                                                value={formData.blood_group}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] outline-none text-sm appearance-none"
                                            >
                                                {BLOOD_GROUPS.map(bg => (
                                                    <option key={bg} value={bg}>{bg}</option>
                                                ))}
                                            </select>
                                            <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                                        </div>
                                    </label>
                                </div>

                                <hr className="border-[#cfd7e7] dark:border-gray-800" />

                                {/* Section 2: Address */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Địa chỉ cư trú</h3>
                                        <p className="text-[#4c669a] dark:text-gray-400 text-sm">Thông tin hỗ trợ kết nối với các điểm hiến máu gần nhất.</p>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <LocationSelector
                                            defaultCity={formData.city}
                                            defaultDistrict={formData.district}
                                            onCityChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                                            onDistrictChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
                                        />
                                    </div>

                                    <label className="flex flex-col gap-2 col-span-1 md:col-span-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ chi tiết</span>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] outline-none transition-all text-sm"
                                            />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        </div>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#2b6cee] hover:bg-[#2b6cee]/90 text-white font-bold text-sm shadow-lg shadow-[#2b6cee]/30 transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? "Đang lưu..." : "Lưu và Tiếp tục"}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-center gap-6 py-4">
                        <Link href="#" className="text-xs text-[#4c669a] hover:underline">Pháp lý</Link>
                        <Link href="#" className="text-xs text-[#4c669a] hover:underline">Bảo mật</Link>
                        <Link href="#" className="text-xs text-[#4c669a] hover:underline">Liên hệ</Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
