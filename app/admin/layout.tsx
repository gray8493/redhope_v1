import RoleGuard from '../../components/auth/RoleGuard';
import { AdminSidebar } from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
