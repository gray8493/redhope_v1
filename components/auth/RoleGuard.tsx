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

        // LOG CHO CÔNG TÁC CHẨN ĐOÁN (Chỉ Admin nhìn thấy trong Console)
        console.log("--- RoleGuard Check ---");
        console.log("Email:", user.email);
        console.log("Profile Role:", profile?.role);
        console.log("Metadata Role:", user?.user_metadata?.role);
        console.log("Final userRole:", `"${userRole}"`);

        // 1. Nếu là Admin, mở cửa ngay lập tức
        if (userRole === "admin") {
            console.log("RoleGuard: Quyền Admin được xác nhận.");
            setAuthorized(true);
            return;
        }

        // 2. Nếu không tìm thấy bất kỳ role nào
        if (!userRole) {
            console.warn("RoleGuard: Không tìm thấy vai trò người dùng.");
            // Đợi thêm 1s xem profile có kịp tải không trước khi đẩy ra login
            const timer = setTimeout(() => {
                router.push("/login?error=no_role");
            }, 1000);
            return () => clearTimeout(timer);
        }

        // 3. Kiểm tra các vai trò được phép khác
        const isAuthorized = allowedRoles.includes(userRole as any);

        if (isAuthorized) {
            setAuthorized(true);
        } else {
            console.warn(`RoleGuard: Truy cập bị từ chối cho role "${userRole}". Đang chuyển hướng...`);
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
