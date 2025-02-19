'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { initiateCheckout } from '@/actions/payment-actions';

interface StripeCheckoutButtonProps {
  packageId: string;
  buttonText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary_outline';
}

export default function StripeCheckoutButton({
  packageId,
  buttonText = 'Select Plan',
  className = '',
  variant = 'default'
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!packageId) {
      toast({
        title: 'Error',
        description: 'Package ID is required',
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
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
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
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}