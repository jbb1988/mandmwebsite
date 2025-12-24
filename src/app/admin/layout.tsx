'use client';

import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();

  // Only show sidebar when authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return <AdminSidebar>{children}</AdminSidebar>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
