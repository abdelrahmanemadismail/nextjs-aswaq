// app/auth/reset-password/request/page.tsx
import { Metadata } from 'next';
import ResetPasswordRequest from '@/components/auth/ResetPasswordRequest';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Request a password reset link',
};

export default function ResetPasswordRequestPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ResetPasswordRequest />
    </div>
  );
}