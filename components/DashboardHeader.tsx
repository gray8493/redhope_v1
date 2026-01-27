"use client";

// import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
    // const { profile } = useAuth();
    const firstName = "người bạn"; // Default value
    const isVerified = true; // Default to verified for demo

    return (
        <div className="flex flex-col gap-6 ">
            <div className="flex flex-wrap justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Chào {firstName}!</h1>
                    <p className="text-slate-500 text-sm font-medium">Hôm nay là một ngày tuyệt vời để chia sẻ sự sống.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Verification Status */}
                    {!isVerified ? (
                        <a
                            href="/complete-profile/verification"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#6324eb] hover:bg-[#501ac2] text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-bold text-sm transform active:scale-95"
                        >
                            <span className="size-2 bg-white rounded-full animate-ping"></span>
                            Hoàn thành hồ sơ
                        </a>
                    ) : (
                        <div
                            onClick={() => alert("Hồ sơ của bạn đã được xác minh thành công!")}
                            className="flex flex-col items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trạng thái</p>
                            <div className="flex items-center gap-2">
                                <span className="size-2 bg-emerald-500 rounded-full"></span>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Hồ sơ đã xác minh</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
