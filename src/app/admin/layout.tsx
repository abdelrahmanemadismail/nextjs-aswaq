import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { ProfileProvider } from '@/context/ProfileContext';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Aswaq Admin Dashboard',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <AdminLayout>{children}</AdminLayout>
    </ProfileProvider>
  );
}