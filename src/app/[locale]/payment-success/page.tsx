'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/actions/payment-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, getLocalizedPath } = useTranslation();
  
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
            <p className="text-lg">{t.payments.success.processing}</p>
            <p className="text-sm text-muted-foreground">{t.payments.success.pleaseWait}</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.payments.success.successTitle}</h2>
            <p className="text-center text-muted-foreground mb-6">
              {t.payments.success.successMessage}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push(getLocalizedPath('/profile/packages'))}>
                {t.payments.success.viewPackages}
              </Button>
              <Button variant="outline" onClick={() => router.push(getLocalizedPath('/'))}>
                {t.payments.success.backToHome}
              </Button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.payments.success.errorTitle}</h2>
            <p className="text-center text-muted-foreground mb-2">
              {t.payments.success.errorMessage}
            </p>
            <p className="text-center text-sm text-destructive mb-6">
              {errorMessage || t.payments.success.errorDefault}
            </p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={() => router.push(getLocalizedPath('/packages'))}>
                {t.payments.success.tryAgain}
              </Button>
              <Button variant="outline" onClick={() => router.push(getLocalizedPath('/help'))}>
                {t.payments.success.contactSupport}
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
          <CardTitle>{t.payments.success.title}</CardTitle>
          <CardDescription>{t.payments.success.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 text-sm text-muted-foreground">
          <p>{t.payments.success.transactionId} {searchParams.get('session_id') || 'N/A'}</p>
        </CardFooter>
      </Card>
    </div>
  );
}