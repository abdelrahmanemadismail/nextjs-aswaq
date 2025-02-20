'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';

interface PackageCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  features: string[];
  className?: string;
}

export default function PackageCard({
  id,
  name,
  description,
  price,
  currency = 'AED',
  features,
  className = ''
}: PackageCardProps) {
  return (
    <Card className={`bg-background/60 ${className}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {price > 0 ? price.toFixed(2) : 'Free'} <span className="text-sm">{currency}</span>
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
        <StripeCheckoutButton packageId={id} className="w-full" buttonText="Select Package" />
      </CardFooter>
    </Card>
  );
}