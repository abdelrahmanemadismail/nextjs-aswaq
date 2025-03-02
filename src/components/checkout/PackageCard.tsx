'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useProfile } from "@/context/ProfileContext";
import { useTranslation } from '@/hooks/use-translation';
import { Languages } from "@/constants/enums";

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
        {isFree ? 
         <Button disabled={!!profile} className="w-full" onClick={() => router.push('/auth/signup')}>
           {t.payments.getStarted}
         </Button>
         : 
          <StripeCheckoutButton
            packageId={id}
            className="w-full"
            buttonText={t.payments.selectPackage}
          />
         }
      </CardFooter>
    </Card>
  );
}