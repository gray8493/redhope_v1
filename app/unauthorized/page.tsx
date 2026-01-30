"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#161121] p-6">
            <div className="max-w-md w-full bg-white dark:bg-[#1c162e] p-10 rounded-[40px] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-gray-100 dark:border-[#2d263d] text-center relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#6324eb]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center size-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-3xl mb-8 transform rotate-12">
                        <ShieldAlert className="w-10 h-10" />
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">403</h1>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Truy cập bị từ chối</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                        Rất tiếc, bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link href="/requests">
                            <Button className="w-full py-6 bg-[#6324eb] hover:bg-[#501ac2] text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all">
                                <Home className="w-5 h-5" />
                                Quay về trang chủ
                            </Button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại trang trước
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
