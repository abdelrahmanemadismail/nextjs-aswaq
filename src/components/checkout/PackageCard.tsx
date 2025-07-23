import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import PaymobCheckoutButton from './PaymobCheckoutButton';
import { Button } from '../ui/button';
import { Languages } from "@/constants/enums";
import Link from 'next/link';
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';
import { createClient } from '@/utils/supabase/server';
import { ClaimPackageForm } from './ClaimPackageForm';

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

export default async function PackageCard({
  id,
  name,
  description,
  price,
  currency = 'AED', // Changed default currency to AED for UAE market
  features,
  className = '',
  isFree = false
}: PackageCardProps) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Convert currency to Arabic if needed
  const displayCurrency = locale === Languages.ARABIC ? 'د.إ' : currency; // AED symbol in Arabic
  
  // Generate the redirect URLs for authentication
  const signupUrl = `/${locale}/auth/signup`;

  return (
    <Card className={`bg-background/60 ${className}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {price > 0 ? price.toFixed(2) : t.payments.free} <span className="text-sm">{isFree ? "" : displayCurrency}</span>
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
        {!session ? (
          <Link href={signupUrl} className="w-full">
            <Button className="w-full">
              {t.payments.getStarted}
            </Button>
          </Link>
        ) : isFree ? (
          <ClaimPackageForm buttonText={t.payments.getStarted} />
        ) : (
          <PaymobCheckoutButton
            packageId={id}
            className="w-full"
            buttonText={t.payments.selectPackage}
          />
        )}
      </CardFooter>
    </Card>
  );
}