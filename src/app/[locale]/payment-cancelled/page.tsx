'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';

export default function PaymentCancelledPage() {
  const router = useRouter();
  const { t, getLocalizedPath } = useTranslation();
  
  return (
    <div className="max-w-2xl py-20 m-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{t.payments.cancelled.title}</CardTitle>
          <CardDescription>{t.payments.cancelled.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.payments.cancelled.title}</h2>
            <p className="text-center text-muted-foreground mb-6">
              {t.payments.cancelled.message}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push(getLocalizedPath('/packages'))}>
                {t.payments.cancelled.returnToPackages}
              </Button>
              <Button variant="outline" onClick={() => router.push(getLocalizedPath('/'))}>
                {t.payments.cancelled.backToHome}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 text-sm text-muted-foreground">
          <p>{t.payments.cancelled.needHelp}</p>
        </CardFooter>
      </Card>
    </div>
  );
}