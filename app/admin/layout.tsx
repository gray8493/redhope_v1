import RoleGuard from '../../components/auth/RoleGuard';
import { AdminSidebar } from '../../components/AdminSidebar';
import { TopNav } from '../../components/TopNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav title="Hệ thống Quản trị" />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
