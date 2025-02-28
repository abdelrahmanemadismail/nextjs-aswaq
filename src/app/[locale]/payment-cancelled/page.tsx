'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentCancelledPage() {
  const router = useRouter();
  
  return (
    <div className="max-w-2xl py-20 m-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>Your package purchase was not completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Cancelled</h2>
            <p className="text-center text-muted-foreground mb-6">
              You&apos;ve cancelled your payment process. No charges have been made.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/packages')}>
                Return to Packages
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 text-sm text-muted-foreground">
          <p>Need help? Contact our support team.</p>
        </CardFooter>
      </Card>
    </div>
  );
}