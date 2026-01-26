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

        // 2. Xác định vai trò (Xử lý kỹ cả metadata và profile)
        const userRole = (profile?.role || user?.user_metadata?.role || "").toLowerCase().trim();

        // LOG ĐỂ KIỂM TRA (Debug)
        console.log(`[RoleGuard] Path: ${pathname}, Role: "${userRole}"`);

        // Nếu chưa kịp load xong role, đừng làm gì cả, cứ đợi tí
        if (!userRole && !authLoading) {
            return;
        }

        // 3. Xử lý Admin
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

        // 5. Xử lý Donor (Chỉ Donor mới bị check hoàn thành hồ sơ)
        if (userRole === "donor") {
            const isProfileBasicComplete = !!(profile?.blood_group && profile?.city);
            const isFullComplete = isProfileBasicComplete && !!profile?.weight;

            // Nếu chưa xong thông tin cơ bản
            if (!isProfileBasicComplete) {
                if (pathname === "/complete-profile") {
                    setAuthorized(true);
                } else {
                    router.push("/complete-profile");
                }
            }
            // Nếu xong cơ bản nhưng chưa xác minh sức khỏe (Verification)
            else if (!isFullComplete) {
                if (pathname.includes("/verification") || pathname.includes("/screening")) {
                    setAuthorized(true);
                } else {
                    router.push("/complete-profile/verification");
                }
            }
            // Nếu đã xong hết
            else {
                if (allowedRoles.includes("donor") || pathname === "/dashboard") {
                    setAuthorized(true);
                } else {
                    router.push("/dashboard");
                }
            }
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
