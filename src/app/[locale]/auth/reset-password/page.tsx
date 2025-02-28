// app/auth/reset-password/page.tsx
import { Metadata } from 'next';
import NewPasswordForm from '@/components/auth/NewPasswordForm';

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Set your new password',
};

export default function NewPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <NewPasswordForm />
    </div>
  );
}