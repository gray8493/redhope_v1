"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#120e1b] dark:to-[#1c162e] px-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <WifiOff className="w-12 h-12 text-slate-400" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
                    Không có kết nối mạng
                </h1>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Có vẻ như bạn đang offline. Vui lòng kiểm tra kết nối internet và thử lại.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6324eb] text-white font-bold rounded-xl hover:bg-[#501ac2] transition-all shadow-lg shadow-[#6324eb]/20"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Thử lại
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Trang chủ
                    </Link>
                </div>

                {/* Tips */}
                <div className="mt-12 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-left">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3">Mẹo khắc phục:</h3>
                    <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-[#6324eb]">•</span>
                            Kiểm tra Wi-Fi hoặc dữ liệu di động
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#6324eb]">•</span>
                            Tắt chế độ máy bay nếu đang bật
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#6324eb]">•</span>
                            Thử khởi động lại router hoặc thiết bị
                        </li>
                    </ul>
                </div>

                {/* Footer */}
                <p className="mt-8 text-xs text-slate-400">
                    RedHope - Kết nối cộng đồng hiến máu
                </p>
            </div>
        </div>
    );
}
