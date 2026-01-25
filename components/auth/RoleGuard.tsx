"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ("donor" | "hospital" | "admin")[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authService.getCurrentUser();

                if (!user) {
                    router.push("/login");
                    return;
                }

                // Check role from profile or metadata (lowercase for comparison)
                const rawRole = user.profile?.role || user.user_metadata?.role || "";
                const userRole = rawRole.toLowerCase();

                console.log("RoleGuard - User Role:", userRole);
                console.log("RoleGuard - Allowed Roles:", allowedRoles);

                // Authorization logic
                const isAuthorized = userRole === "admin" || allowedRoles.includes(userRole as any);

                if (isAuthorized) {
                    setAuthorized(true);
                }
                else {
                    // Redirect to their respective dashboard if unauthorized
                    if (userRole === "hospital") router.push("/hospital");
                    else if (userRole === "admin") router.push("/admin"); // Safety redirect
                    else router.push("/dashboard");
                }
            } catch (error) {
                console.error("Auth Guard Error:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, allowedRoles]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#161121]">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner text-neutral"></span>
                    <p className="text-sm font-medium text-gray-500">Đang xác thực quyền truy cập...</p>
                </div>
            </div>
        );
    }

    return authorized ? <>{children}</> : null;
}
