import RoleGuard from "@/components/auth/RoleGuard";

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={["hospital"]}>
            {children}
        </RoleGuard>
    );
}
