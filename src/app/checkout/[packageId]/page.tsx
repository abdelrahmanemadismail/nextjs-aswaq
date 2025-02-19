'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import PaymentForm from '@/components/payments/PaymentForm';
import { createPaymentIntent } from '@/services/payment-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [packageData, setPackageData] = useState<any>(null);

  useEffect(() => {
    if (!profile && !isLoading) {
      router.push('/auth/login?redirectedFrom=/checkout/' + params.packageId);
      return;
    }

    // Fetch package details and create payment intent
    const fetchPackageAndCreateIntent = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch package details from API or use context
        const response = await fetch(`/api/packages/${params.packageId}`);
        if (!response.ok) {
          throw new Error('Package not found');
        }
        
        const packageDetails = await response.json();
        setPackageData(packageDetails);
        
        // 2. Create payment intent
        const { clientSecret } = await createPaymentIntent(
          params.packageId as string,
          profile?.id || ""
        );
        
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error preparing checkout:', err);
        setError(err instanceof Error ? err.message : 'Failed to load checkout');
        toast({
          title: 'Checkout error',
          description: 'Failed to prepare checkout. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackageAndCreateIntent();
  }, [params.packageId, profile, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Preparing checkout...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Checkout Error</CardTitle>
          <CardDescription>We encountered a problem</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            Go back
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!packageData || !clientSecret) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Purchase</h1>
      <PaymentForm 
        clientSecret={clientSecret}
        packageName={packageData.name}
        amount={packageData.price}
      />
    </div>
  );
}