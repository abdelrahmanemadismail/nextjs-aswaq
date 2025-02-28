// app/auth/phone-verification/page.tsx
import { Metadata } from 'next';
import PhoneVerification from '@/components/auth/PhoneVerification';

export const metadata: Metadata = {
  title: 'Phone Verification',
  description: 'Verify your phone number',
};

export default function PhoneVerificationPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <PhoneVerification />
    </div>
  );
}