"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ("donor" | "hospital" | "admin")[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, profile, loading: authLoading } = useAuth();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        // 1. Kiểm tra đăng nhập
        if (!user) {
            if (pathname !== "/login" && pathname !== "/register") {
                router.push("/login");
            }
            return;
        }

        // 2. Xác định vai trò
        // 2. Xác định vai trò strictly từ data
        const metadataRole = user?.user_metadata?.role;
        const profileRole = profile?.role;

        let userRole = (profileRole || metadataRole || "").toLowerCase().trim();

        // DEBUG CHI TIẾT
        console.log(`[RoleGuard DEBUG] Path: ${pathname}`);
        console.log(`[RoleGuard DEBUG] Metadata Role: "${metadataRole}"`);
        console.log(`[RoleGuard DEBUG] Profile Role: "${profileRole}"`);
        console.log(`[RoleGuard DEBUG] Final Determined Role: "${userRole || "donor (defaulted)"}"`);

        // Nếu không tìm thấy role nào, mặc định là donor
        if (!userRole && !authLoading) {
            userRole = "donor";
        }

        // 3. Xử lý Admin: Cho phép vào bất kỳ trang nào (đúng yêu cầu: "có thể vào bất kì trang nào")
        if (userRole === "admin") {
            setAuthorized(true);
            return;
        }

        // 4. Xử lý Hospital
        if (userRole === "hospital") {
            if (pathname.startsWith("/hospital")) {
                setAuthorized(true);
            } else {
                router.push("/hospital");
            }
            return;
        }

        // 5. Xử lý Donor
        if (userRole === "donor") {
            // Nếu đang ở trang Hospital hoặc Admin (vùng cấm của Donor)
            if (pathname.startsWith("/hospital") || pathname.startsWith("/admin")) {
                router.push("/dashboard");
                return;
            }

            // Cho phép truy cập bất kỳ trang nào khác (dashboard, complete-profile, vv.)
            setAuthorized(true);
            return;
        }

    }, [user, profile, authLoading, router, pathname, allowedRoles]);

    // Màn hình chờ
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
