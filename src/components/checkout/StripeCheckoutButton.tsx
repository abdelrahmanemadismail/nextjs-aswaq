'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { initiateCheckout } from '@/actions/payment-actions';
import { useTranslation } from '@/hooks/use-translation';

interface StripeCheckoutButtonProps {
  packageId: string;
  buttonText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary_outline';
}

export default function StripeCheckoutButton({
  packageId,
  buttonText,
  className = '',
  variant = 'default'
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const defaultButtonText = t.payments.selectPlan;
  const finalButtonText = buttonText || defaultButtonText;

  const handleClick = async () => {
    if (!packageId) {
      toast({
        title: t.common.error,
        description: t.payments.packageIdRequired,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await initiateCheckout({ packageId });
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.checkoutUrl) {
        // Redirect to Stripe checkout page
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(t.payments.noCheckoutUrl);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: t.payments.checkoutFailed,
        description: error instanceof Error ? error.message : t.common.unexpectedError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          {t.common.processing}
        </>
      ) : (
        finalButtonText
      )}
    </Button>
  );
}