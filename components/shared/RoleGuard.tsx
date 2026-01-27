"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== 'admin' && !allowedRoles.includes(user.role)) {
                router.push("/unauthorized");
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading || !user || (user.role !== 'admin' && !allowedRoles.includes(user.role))) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
