"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Clock, ShieldCheck, Mail, Phone, MessageCircle, FileText, AlertTriangle, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function PendingVerificationPage() {
    const { profile, signOut, refreshUser } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false);

    const status = profile?.verification_status || "pending";
    const rejectionNote = profile?.verification_note;

    // Auto-redirect when status becomes approved
    useEffect(() => {
        if (status === "approved") {
            toast.success("🎉 Hồ sơ đã được phê duyệt! Đang chuyển hướng...");
            const timer = setTimeout(() => {
                router.push("/hospital-dashboard");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    const handleCheckStatus = async () => {
        setIsChecking(true);
        try {
            await refreshUser();
            // After refreshUser, the useEffect above will handle redirect if approved
            toast.success("Đã cập nhật trạng thái mới nhất.");
            setTimeout(() => {
                setIsChecking(false);
            }, 800);
        } catch {
            toast.error("Không thể kiểm tra trạng thái. Vui lòng thử lại.");
            setIsChecking(false);
        }
    };

    // If approved, show success state
    if (status === "approved") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f172a] dark:to-[#1e1b4b] p-4">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-8 rounded-[2rem] border border-emerald-200 dark:border-emerald-800 shadow-2xl">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">Đã được phê duyệt!</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Đang chuyển hướng đến trang điều hành...</p>
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mt-4" />
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig: Record<string, { icon: React.ReactNode; title: string; desc: string; color: string; bgColor: string; borderColor: string }> = {
        pending: {
            icon: <Clock className="w-10 h-10" />,
            title: "Hồ sơ đang chờ xác nhận",
            desc: "Hồ sơ bệnh viện của bạn đã được gửi thành công. Đội ngũ quản trị RedHope sẽ liên hệ qua Zalo hoặc Email để xác minh thông tin.",
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-950/30",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        in_review: {
            icon: <ShieldCheck className="w-10 h-10" />,
            title: "Hồ sơ đang được xem xét",
            desc: "Admin đã tiếp nhận và đang xem xét hồ sơ của bạn. Vui lòng kiểm tra Zalo hoặc Email để phản hồi nếu cần bổ sung thêm giấy tờ.",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-950/30",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        rejected: {
            icon: <AlertTriangle className="w-10 h-10" />,
            title: "Hồ sơ chưa đạt yêu cầu",
            desc: "Rất tiếc, hồ sơ của bạn chưa đủ điều kiện để được phê duyệt. Vui lòng xem lý do bên dưới và cập nhật lại hồ sơ.",
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-50 dark:bg-red-950/30",
            borderColor: "border-red-200 dark:border-red-800",
        },
    };

    const currentStatus = statusConfig[status] || statusConfig.pending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f172a] dark:to-[#1e1b4b] p-4">
            <div className="w-full max-w-lg">
                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Header */}
                    <div className={`${currentStatus.bgColor} ${currentStatus.borderColor} border-b p-8 flex flex-col items-center text-center gap-4`}>
                        <div className={`${currentStatus.color} p-4 rounded-2xl bg-white/60 dark:bg-black/20 shadow-sm`}>
                            {currentStatus.icon}
                        </div>
                        <div>
                            <h1 className={`text-xl font-black tracking-tight ${currentStatus.color}`}>{currentStatus.title}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{currentStatus.desc}</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        {/* Rejection reason */}
                        {status === "rejected" && rejectionNote && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Lý do từ chối</p>
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{rejectionNote}</p>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ Admin</p>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">admin@redhope.vn</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <MessageCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zalo: 0901 234 567</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hotline: 1900 1234</span>
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giấy tờ cần chuẩn bị</p>
                            <div className="space-y-2">
                                {[
                                    "Giấy phép hoạt động khám chữa bệnh",
                                    "Giấy chứng nhận đủ điều kiện an toàn vệ sinh",
                                    "Giấy xác nhận cơ sở truyền máu (nếu có)",
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            {status === "rejected" && (
                                <Link href="/complete-hospital-profile">
                                    <Button className="w-full h-12 rounded-xl bg-[#0065FF] hover:bg-blue-700 font-black italic tracking-tight shadow-lg shadow-blue-500/20">
                                        CẬP NHẬT LẠI HỒ SƠ
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl font-bold"
                                onClick={handleCheckStatus}
                                disabled={isChecking}
                            >
                                {isChecking ? "Đang kiểm tra..." : "Kiểm tra lại trạng thái"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-10 text-sm text-slate-400 font-medium"
                                onClick={async () => {
                                    await signOut();
                                    router.push('/login');
                                }}
                            >
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    © {new Date().getFullYear()} RedHope — Kết nối sự sống
                </p>
            </div>
        </div>
    );
}
