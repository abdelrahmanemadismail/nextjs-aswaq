'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { toast } from '@/hooks/use-toast';

interface BuyNowButtonProps extends ButtonProps {
  packageId: string;
  children?: React.ReactNode;
}

export default function BuyNowButton({ 
  packageId, 
  children = 'Select Package', 
  ...props 
}: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { profile } = useProfile();

  const handleClick = async () => {
    try {
      setLoading(true);
      
      if (!profile) {
        router.push(`/auth/login?redirectedFrom=/checkout/${packageId}`);
        return;
      }
      
      router.push(`/checkout/${packageId}`);
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: 'Checkout error',
        description: 'Failed to initiate checkout process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}