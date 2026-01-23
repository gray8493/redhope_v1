import RoleGuard from "@/components/auth/RoleGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={["donor"]}>
            {children}
        </RoleGuard>
    );
}
