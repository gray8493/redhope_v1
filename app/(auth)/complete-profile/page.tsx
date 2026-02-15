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
    const { user, loading, refreshUser } = useAuth();
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
        if (!loading && !user) {
            router.push("/login?redirect=/complete-profile");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.user_metadata?.full_name || prev.full_name,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#0065FF] animate-spin" />
                    <p className="text-sm font-medium text-gray-500">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

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
                const parts = formData.dob.split('-');
                if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
                    setError("Vui lòng chọn đầy đủ ngày, tháng, năm sinh.");
                    setSubmitting(false);
                    return;
                }

                const birthDate = new Date(formData.dob);
                if (isNaN(birthDate.getTime())) {
                    setError("Ngày sinh không hợp lệ.");
                    setSubmitting(false);
                    return;
                }

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
                email: user?.email || user?.user_metadata?.email || "",
                role: role as any
            };

            console.log("Submitting profile data:", cleanData);

            if (!user?.id) {
                console.error("No userId found for submission.");
                setError("Không thể xác định danh tính người dùng. Vui lòng đăng nhập lại.");
                setSubmitting(false);
                return;
            }

            // 1. Lưu dữ liệu qua API
            const response = await fetch('/api/auth/register-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    email: user.email || user.user_metadata?.email || formData.full_name, // fallback as email might be used for identification
                    fullName: cleanData.full_name,
                    role: cleanData.role,
                    phone: cleanData.phone,
                    dob: cleanData.dob,
                    gender: cleanData.gender,
                    bloodGroup: cleanData.blood_group,
                    city: cleanData.city,
                    district: cleanData.district,
                    address: cleanData.address
                }),
            });

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error("Failed to parse JSON response", jsonError);
                // If JSON parsing fails, try to get text for debugging
                /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                const text = await response.text().catch(() => null);
                throw new Error(`Server returned non-JSON response (${response.status}). Check server logs.`);
            }

            if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status} ${response.statusText}`);
            }

            // 2. Refresh dữ liệu trong AuthContext
            if (refreshUser) await refreshUser();

            // 3. Chuyển hướng
            router.push("/complete-profile/verification");
        } catch (err: any) {
            // Log full error internally for diagnostics
            console.error("Profile update failed (raw):", err);
            console.error("Profile update failed (details):", {
                name: err?.name,
                message: err?.message,
                stack: err?.stack,
                details: err?.details,
                hint: err?.hint,
                code: err?.code,
                json: JSON.stringify(err, Object.getOwnPropertyNames(err))
            });

            // Return a user-safe message
            setError(err.message || "Lỗi: Có lỗi xảy ra. Vui lòng thử lại sau.");
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
                        <div className="p-6 md:p-8 border-b border-[#cfd7e7] dark:border-gray-800">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <h1 className="text-xl md:text-2xl font-bold">Thông tin cá nhân cơ bản</h1>
                                    <span className="text-[#0065FF] text-xs md:text-sm font-semibold bg-[#0065FF]/10 px-3 py-1 rounded-full whitespace-nowrap">
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
                                        <div className="h-full bg-[#0065FF] w-1/2 rounded-full transition-all duration-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 md:p-8">
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
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] focus:ring-2 focus:ring-[#0065FF]/20 outline-none transition-all text-sm"
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
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] focus:ring-2 focus:ring-[#0065FF]/20 outline-none transition-all text-sm"
                                            />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày sinh</span>
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Day */}
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full px-3 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] outline-none text-sm appearance-none"
                                                    value={formData.dob ? formData.dob.split('-')[2] : ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => {
                                                            const parts = prev.dob ? prev.dob.split('-') : ["", "", ""];
                                                            const y = parts[0] || "";
                                                            const m = parts[1] || "";
                                                            return { ...prev, dob: `${y}-${m}-${val}` };
                                                        });
                                                    }}
                                                >
                                                    <option value="">Ngày</option>
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                        <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Month */}
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full px-3 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] outline-none text-sm appearance-none"
                                                    value={formData.dob ? formData.dob.split('-')[1] : ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => {
                                                            const parts = prev.dob ? prev.dob.split('-') : ["", "", ""];
                                                            const y = parts[0] || "";
                                                            const d = parts[2] || "";
                                                            return { ...prev, dob: `${y}-${val}-${d}` };
                                                        });
                                                    }}
                                                >
                                                    <option value="">Tháng</option>
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                        <option key={m} value={m.toString().padStart(2, '0')}>Tháng {m}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Year */}
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full px-3 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] outline-none text-sm appearance-none"
                                                    value={formData.dob ? formData.dob.split('-')[0] : ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => {
                                                            const parts = prev.dob ? prev.dob.split('-') : ["", "", ""];
                                                            const m = parts[1] || "";
                                                            const d = parts[2] || "";
                                                            return { ...prev, dob: `${val}-${m}-${d}` };
                                                        });
                                                    }}
                                                >
                                                    <option value="">Năm</option>
                                                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 16 - i).map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Giới tính</span>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] outline-none text-sm"
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
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] outline-none text-sm appearance-none"
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
                                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#0065FF] outline-none transition-all text-sm"
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
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 md:py-3 rounded-lg bg-[#0065FF] hover:bg-[#0065FF]/90 text-white font-bold text-sm shadow-lg shadow-[#0065FF]/30 transition-transform active:scale-95 disabled:opacity-50"
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
