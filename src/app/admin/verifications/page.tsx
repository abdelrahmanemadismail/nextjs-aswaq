// app/admin/verifications/page.tsx
import { Metadata } from 'next'
import VerificationsPage from '@/components/admin/VerificationsPage'

export const metadata: Metadata = {
  title: 'Verification Management',
  description: 'Manage user verification requests',
}

export default function Page() {
  return <VerificationsPage />
}