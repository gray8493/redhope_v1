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

        // 3. Xử lý Admin
        if (userRole === "admin") {
            if (pathname.startsWith("/complete-profile") || pathname === "/dashboard") {
                router.push("/admin");
                return;
            }
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
            const isProfileBasicComplete = !!(profile?.blood_group && profile?.city);
            const isFullComplete = isProfileBasicComplete && !!profile?.full_name;

            // Nếu đang ở trang Hospital hoặc Admin (vùng cấm của Donor)
            if (pathname.startsWith("/hospital") || pathname.startsWith("/admin")) {
                router.push(isFullComplete ? "/dashboard" : "/complete-profile");
                return;
            }

            if (!isProfileBasicComplete) {
                // CHƯA XONG CƠ BẢN -> Luôn phải ở /complete-profile
                if (pathname === "/complete-profile") {
                    setAuthorized(true);
                } else {
                    router.push("/complete-profile");
                }
            } else if (!isFullComplete) {
                // XONG CƠ BẢN NHƯNG CHƯA XÁC MINH -> Luôn phải ở /complete-profile/verification
                if (pathname.startsWith("/complete-profile/verification")) {
                    setAuthorized(true);
                } else {
                    router.push("/complete-profile/verification");
                }
            } else {
                // ĐÃ XONG HẾT
                if (pathname.startsWith("/complete-profile")) {
                    router.push("/dashboard"); // Không cho ở lại trang profile completion nữa
                } else if (pathname === "/dashboard" || allowedRoles.includes("donor")) {
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
