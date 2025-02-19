'use client';

import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/utils/stripe/stripe-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentFormProps {
  clientSecret: string;
  packageName: string;
  amount: number;
}

function CheckoutForm({ packageName, amount }: { packageName: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message || 'An unknown error occurred',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful!',
          description: 'Thank you for your purchase',
        });
        // Redirect or show success message
        window.location.href = '/payment/success';
      } else {
        toast({
          title: 'Payment processing',
          description: 'Your payment is being processed',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete your purchase</CardTitle>
          <CardDescription>
            {packageName} - {amount.toFixed(2)} AED
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ${amount.toFixed(2)} AED`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function PaymentForm({ clientSecret, packageName, amount }: PaymentFormProps) {
  if (!clientSecret) {
    return <div>Loading payment details...</div>;
  }

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <CheckoutForm packageName={packageName} amount={amount} />
    </Elements>
  );
}