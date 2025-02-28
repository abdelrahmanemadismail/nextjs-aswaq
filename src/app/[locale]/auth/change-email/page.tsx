// app/auth/reset-password/page.tsx
import { Metadata } from 'next';
import ChangeEmailForm from '@/components/auth/ChangeEmail';

export const metadata: Metadata = {
  title: 'Change Email',
  description: 'Change your email',
};

export default function ChangeEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ChangeEmailForm />
    </div>
  );
}