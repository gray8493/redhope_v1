"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ("donor" | "hospital" | "admin")[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        const rawRole = profile?.role || user?.user_metadata?.role || "";
        const userRole = rawRole.toLowerCase().trim();

        // LOG CHẨN ĐOÁN
        console.log(`[RoleGuard] User: ${user.email}, Role: "${userRole}"`);

        // 1. Nếu là Admin, cho phép vào tất cả các trang
        if (userRole === "admin") {
            setAuthorized(true);
            return;
        }

        // 2. Nếu chưa có role, tiếp tục chờ (Loading) thay vì đẩy ra ngay
        if (!userRole) {
            return;
        }

        // 3. Kiểm tra vai trò thông thường
        const isAuthorized = allowedRoles.includes(userRole as any);

        if (isAuthorized) {
            setAuthorized(true);
        } else {
            const target = userRole === "hospital" ? "/hospital" : "/dashboard";
            if (typeof window !== 'undefined' && window.location.pathname !== target) {
                router.push(target);
            }
        }
    }, [user, profile, authLoading, router, allowedRoles.join(',')]);

    if (authLoading || (!authorized && user)) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#161121]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6324eb]" />
                    <p className="text-sm font-medium text-gray-500">Đang chuẩn bị không gian làm việc...</p>
                </div>
            </div>
        );
    }

    return authorized ? <>{children}</> : null;
}
