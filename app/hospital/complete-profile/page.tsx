"use client";

import {
    Building2,
    Phone,
    MapPin,
    FileText,
    ArrowRight,
    Loader2,
    ShieldCheck,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";

export default function HospitalProfileCompletion() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");

    const [formData, setFormData] = useState({
        hospital_name: "",
        license_number: "",
        phone: "",
        city: "",
        district: "",
        hospital_address: "",
        full_name: "" // For contact person
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                if (!user) {
                    router.push("/login");
                    return;
                }

                // Ensure it's a hospital
                const role = user.profile?.role || user.user_metadata?.role;
                if (role !== 'hospital' && role !== 'admin') {
                    router.push("/complete-profile");
                    return;
                }

                setUserId(user.id);
                setFormData(prev => ({
                    ...prev,
                    hospital_name: user.profile?.hospital_name || "",
                    license_number: user.profile?.license_number || "",
                    phone: user.profile?.phone || "",
                    city: user.profile?.city || "",
                    district: user.profile?.district || "",
                    hospital_address: user.profile?.hospital_address || "",
                    full_name: user.profile?.full_name || user.user_metadata?.full_name || ""
                }));
                setLoading(false);
            } catch (err: any) {
                console.error("Error fetching user:", err);
                setError("Không thể tải thông tin bệnh viện. Vui lòng thử lại.");
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const user = await authService.getCurrentUser();
            const role = user?.profile?.role || user?.user_metadata?.role || "hospital";

            if (!userId) {
                setError("Lỗi xác minh danh tính. Vui lòng đăng nhập lại.");
                setSubmitting(false);
                return;
            }

            await userService.upsert(userId, {
                ...formData,
                email: user?.email || "",
                role: role as any
            });
            router.push("/hospital");
        } catch (err: any) {
            // Log internal error for diagnostics
            console.error("Update failed detailed:", err);
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#101622]">
                <Loader2 className="w-10 h-10 animate-spin text-[#2b6cee]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans text-[#1e293b] dark:text-gray-100">
            {/* Header */}
            <header className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2b6cee] rounded-lg flex items-center justify-center text-white">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">REDHOPE <span className="text-[#2b6cee]">Hospital</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Hệ thống xác thực đối tác y tế
                </div>
            </header>

            <main className="flex justify-center py-12 px-4">
                <div className="w-full max-w-[900px]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Sidebar Info */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold mb-4">Hoàn tất đăng ký đối tác</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                    Vui lòng cung cấp chính xác thông tin pháp lý của bệnh viện để chúng tôi tiến hành xác minh quyền truy cập hệ thống quản lý máu.
                                </p>
                                <ul className="flex flex-col gap-4">
                                    <li className="flex gap-3 text-sm items-start">
                                        <div className="mt-1 w-5 h-5 shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        <span>Quản lý kho máu trực tuyến</span>
                                    </li>
                                    <li className="flex gap-3 text-sm items-start">
                                        <div className="mt-1 w-5 h-5 shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        <span>Khởi tạo chiến dịch hiến máu</span>
                                    </li>
                                    <li className="flex gap-3 text-sm items-start">
                                        <div className="mt-1 w-5 h-5 shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        <span>Kết nối người hiến tình nguyện</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                <h3 className="font-bold mb-2">Hỗ trợ kỹ thuật?</h3>
                                <p className="text-xs text-blue-100 mb-4 opacity-80">
                                    Nếu đơn vị gặp khó khăn trong việc đăng ký, vui lòng liên hệ hotline đối tác.
                                </p>
                                <button
                                    className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled
                                    aria-disabled="true"
                                    title="Tính năng đang được phát triển"
                                >
                                    Liên hệ ngay
                                </button>
                            </div>
                        </div>

                        {/* Form Area */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-8">
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                                        {error && (
                                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                                {error}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thông tin cơ sở y tế</h3>
                                                <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <label className="flex flex-col gap-2 md:col-span-2">
                                                    <span className="text-sm font-semibold">Tên bệnh viện / Cơ sở y tế</span>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="text"
                                                            name="hospital_name"
                                                            value={formData.hospital_name}
                                                            onChange={handleChange}
                                                            placeholder="VD: Bệnh viện Chợ Rẫy"
                                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-[#0f172a] focus:border-blue-500 outline-none transition-all text-sm"
                                                        />
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    </div>
                                                </label>

                                                <label className="flex flex-col gap-2">
                                                    <span className="text-sm font-semibold">Mã số giấy phép hoạt động</span>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="text"
                                                            name="license_number"
                                                            value={formData.license_number}
                                                            onChange={handleChange}
                                                            placeholder="VD: 123/BYT-GPHĐ"
                                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-[#0f172a] focus:border-blue-500 outline-none transition-all text-sm"
                                                        />
                                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    </div>
                                                </label>

                                                <label className="flex flex-col gap-2">
                                                    <span className="text-sm font-semibold">Số điện thoại liên hệ</span>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            placeholder="VD: 028 3855 4137"
                                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-[#0f172a] focus:border-blue-500 outline-none transition-all text-sm"
                                                        />
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    </div>
                                                </label>

                                                <label className="flex flex-col gap-2">
                                                    <span className="text-sm font-semibold">Tỉnh / Thành phố</span>
                                                    <input
                                                        required
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        placeholder="VD: TP. Hồ Chí Minh"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-[#0f172a] focus:border-blue-500 outline-none transition-all text-sm"
                                                    />
                                                </label>

                                                <label className="flex flex-col gap-2">
                                                    <span className="text-sm font-semibold">Quận / Huyện</span>
                                                    <input
                                                        required
                                                        type="text"
                                                        name="district"
                                                        value={formData.district}
                                                        onChange={handleChange}
                                                        placeholder="VD: Quận 5"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-[#0f172a] focus:border-blue-500 outline-none transition-all text-sm"
                                                    />
                                                </label>

                                                <label className="flex flex-col gap-2 md:col-span-2">
                                                    <span className="text-sm font-semibold">Địa chỉ cơ sở</span>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="text"
                                                            name="hospital_address"
                                                            value={formData.hospital_address}
                                                            onChange={handleChange}
                                                            placeholder="VD: 201B Nguyễn Chí Thanh, Phường 12, Quận 5"
                                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-[#0f172a] focus:border-blue-500 outline-none transition-all text-sm"
                                                        />
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-400 max-w-[200px]">
                                                Bằng cách gửi form, bạn cam kết các thông tin trên là chính xác.
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex items-center gap-2 px-10 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {submitting ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
