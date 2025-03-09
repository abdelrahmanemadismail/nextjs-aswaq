'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useProfile } from "@/context/ProfileContext";
import { useTranslation } from '@/hooks/use-translation';
import { Languages } from "@/constants/enums";
import { getRamadanPackage } from '@/actions/package-actions';
import { toast } from '@/hooks/use-toast';

interface PackageCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  features: string[];
  className?: string;
  isFree?: boolean;
}

export default function PackageCard({
  id,
  name,
  description,
  price,
  currency = 'AED',
  features,
  className = '',
  isFree = false
}: PackageCardProps) {
    const router = useRouter();
    const { profile } = useProfile();
    const { t, locale } = useTranslation();
  
  // Convert currency to Arabic if needed
  const displayCurrency = locale === Languages.ARABIC ? 'د.إ' : currency;

  const handleGetPackage = async () => {
    const result = await getRamadanPackage();
    if (result.success) {
      // Show success message, e.g. "Ramadan package claimed successfully!"
      toast({
        title: t.common.success,
        description: "Ramadan package claimed successfully!",
      });
      router.push(`/${locale}/profile/packages`)
    } else {
      // Show error message, e.g. result.message
      // toast({
      //   title: t.common.error,
      //   description: result.message,
      //   variant: 'destructive',
      // });
    }
    router.push(`/${locale}/profile/packages`)
  };

  return (
    <Card className={`bg-background/60 ${className}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {price > 0 ? price.toFixed(2) : t.payments.free} <span className="text-sm">{isFree? "" : displayCurrency}</span>
        </div>
         
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {!profile ? (
          <Button 
            className="w-full" 
            onClick={() => router.push(`/${locale}/auth/signup`)}
          >
            {t.payments.getStarted}
          </Button>
        ) : isFree ? (
          <Button 
            className="w-full" 
            onClick={handleGetPackage}
          >
            {t.payments.getStarted}
          </Button>
        ) : (
          <StripeCheckoutButton
            packageId={id}
            className="w-full"
            buttonText={t.payments.selectPackage}
          />
        )}
      </CardFooter>
    </Card>
  );
}