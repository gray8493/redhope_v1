import RoleGuard from "@/components/auth/RoleGuard";

export default function CompleteProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={["donor", "admin"]}>
            {children}
        </RoleGuard>
    );
}
