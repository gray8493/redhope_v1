"use client";

import {
    Droplet,
    ShieldCheck,
    ArrowLeft,
    CheckCircle,
    Upload,
    FileText,
    BadgeCheck,
    Calendar,
    Activity,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";

export default function VerificationProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");

    const [formData, setFormData] = useState({
        weight: "",
        last_donation_date: "",
        health_history: ""
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                if (!user) {
                    router.push("/login");
                    return;
                }
                setUserId(user.id);
                setLoading(false);
            } catch (err: any) {
                console.error("Error fetching user:", err);
                setError("Lỗi xác thực. Vui lòng đăng nhập lại.");
                router.push("/login");
            }
        };
        fetchUser();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            // 1. Validation & Sanitization
            const weightNum = parseFloat(formData.weight);
            if (isNaN(weightNum) || weightNum < 45) {
                setError("Cân nặng phải là số và tối thiểu 45kg để đủ điều kiện hiến máu.");
                setSubmitting(false);
                return;
            }

            if (formData.last_donation_date) {
                const donationDate = new Date(formData.last_donation_date);
                donationDate.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (donationDate > today) {
                    setError("Ngày hiến máu gần nhất không thể ở tương lai.");
                    setSubmitting(false);
                    return;
                }
            }

            const user = await authService.getCurrentUser();
            const role = user?.profile?.role || user?.user_metadata?.role || "donor";

            // Clean data
            const cleanData = {
                full_name: user?.profile?.full_name || user?.user_metadata?.full_name || "User",
                weight: weightNum,
                last_donation_date: formData.last_donation_date || null,
                health_history: formData.health_history?.trim() || null,
                email: user?.email || "",
                role: role as any
            };

            await userService.upsert(userId, cleanData);

            // Simulating a small delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 800));

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Verification update failed:", err);
            setError("Lỗi: Có lỗi xảy ra trong quá trình xác minh. Vui lòng thử lại.");
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
                                    <h1 className="text-2xl font-bold">Lịch sử hiến máu & Sức khỏe</h1>
                                    <span className="text-[#2b6cee] text-sm font-semibold bg-[#2b6cee]/10 px-3 py-1 rounded-full whitespace-nowrap">
                                        Bước 2 / 2
                                    </span>
                                </div>

                                <p className="text-[#4c669a] dark:text-gray-400 text-sm">
                                    Vui lòng cung cấp thông tin sức khỏe chính xác để đảm bảo an toàn cho bạn và người nhận máu.
                                </p>

                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Tiến độ hồ sơ</p>
                                        <p className="text-sm font-medium">100%</p>
                                    </div>
                                    <div className="h-2 w-full bg-[#cfd7e7] dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#2b6cee] w-full rounded-full transition-all duration-500"></div>
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

                                {/* Section 1: Health Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Chỉ số sức khỏe</h3>
                                        <p className="text-[#4c669a] dark:text-gray-400 text-sm">Các thông tin bắt buộc để xác định điều kiện hiến máu.</p>
                                    </div>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cân nặng (kg)</span>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                placeholder="VD: 65"
                                                className="w-full px-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày hiến máu gần nhất</span>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="last_donation_date"
                                                value={formData.last_donation_date}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm"
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                        </div>
                                        <span className="text-[10px] text-gray-400">Để trống nếu bạn chưa từng hiến máu.</span>
                                    </label>

                                    <label className="flex flex-col gap-2 col-span-1 md:col-span-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tiền sử bệnh lý / Lưu ý y tế</span>
                                        <textarea
                                            name="health_history"
                                            value={formData.health_history}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 dark:bg-[#1a2332] dark:text-white focus:border-[#2b6cee] focus:ring-2 focus:ring-[#2b6cee]/20 outline-none transition-all text-sm min-h-[100px]"
                                            placeholder="Vui lòng liệt kê các bệnh mãn tính, dị ứng thuốc, hoặc các phẫu thuật gần đây (nếu có)..."
                                        ></textarea>
                                    </label>
                                </div>

                                <hr className="border-[#cfd7e7] dark:border-gray-800" />

                                {/* Section 2: Uploads */}
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Xác minh danh tính</h3>
                                        <p className="text-[#4c669a] dark:text-gray-400 text-sm">Tải lên giấy tờ để xác thực thông tin tại điểm hiến máu.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Upload ID */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CCCD (Mặt trước & sau)</span>
                                            <div className="border-2 border-dashed border-[#cfd7e7] dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-[#1a2332]/50 hover:bg-gray-100 dark:hover:bg-[#1a2332] transition-colors cursor-pointer group">
                                                <div className="w-12 h-12 rounded-full bg-[#2b6cee]/10 flex items-center justify-center text-[#2b6cee] group-hover:scale-110 transition-transform">
                                                    <BadgeCheck className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-[#0d121b] dark:text-white">Nhấn để tải ảnh lên</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG (Tối đa 5MB)</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Cert */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Giấy chứng nhận hiến máu (Tùy chọn)</span>
                                            <div className="border-2 border-dashed border-[#cfd7e7] dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-[#1a2332]/50 hover:bg-gray-100 dark:hover:bg-[#1a2332] transition-colors cursor-pointer group">
                                                <div className="w-12 h-12 rounded-full bg-[#2b6cee]/10 flex items-center justify-center text-[#2b6cee] group-hover:scale-110 transition-transform">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-[#0d121b] dark:text-white">Nhấn để tải tài liệu</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Ảnh chụp hoặc PDF</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-[#2b6cee]/10 rounded-lg text-[#2b6cee]">
                                    <ShieldCheck className="w-6 h-6 shrink-0" />
                                    <p className="text-xs text-[#4c669a] dark:text-blue-200">
                                        Thông tin y tế của bạn được bảo mật tuyệt đối theo Luật Khám chữa bệnh và chỉ được chia sẻ với bác sĩ phụ trách.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4">
                                    <Link href="/complete-profile">
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#cfd7e7] dark:border-gray-700 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Quay lại
                                        </button>
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#2b6cee] hover:bg-[#2b6cee]/90 text-white font-bold text-sm shadow-lg shadow-[#2b6cee]/30 transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
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
