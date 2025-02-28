'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/actions/payment-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found in URL');
      return;
    }
    
    const verifyAndProcessPayment = async () => {
      try {
        const result = await verifyPayment(sessionId);
        
        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error);
        } else {
          setStatus('success');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };
    
    verifyAndProcessPayment();
  }, [searchParams]);
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center">
            <LoaderCircle className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-lg">Processing your payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-center text-muted-foreground mb-6">
              Thank you for your purchase. Your package has been activated.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/profile/packages')}>
                View My Packages
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Verification Failed</h2>
            <p className="text-center text-muted-foreground mb-2">
              We couldn&apos;t verify your payment.
            </p>
            <p className="text-center text-sm text-destructive mb-6">
              {errorMessage || 'Please try again or contact support.'}
            </p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={() => router.push('/packages')}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/help')}>
                Contact Support
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-2xl py-20 m-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Payment Confirmation</CardTitle>
          <CardDescription>ASWAQ Online Package Purchase</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 text-sm text-muted-foreground">
          <p>Transaction ID: {searchParams.get('session_id') || 'N/A'}</p>
        </CardFooter>
      </Card>
    </div>
  );
}