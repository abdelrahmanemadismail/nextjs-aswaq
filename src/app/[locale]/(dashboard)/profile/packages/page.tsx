import { getUserPackages } from '@/actions/payment-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';
import { Button } from '@/components/ui/button';

export default async function UserPackagesPage() {
  const { packages, error } = await getUserPackages();
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);

  // Function to create localized paths
  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">{t.userPackages.title}</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">{t.userPackages.error} {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">{t.userPackages.title}</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t.userPackages.noPackages.title}</h2>
            <p className="text-muted-foreground mb-6">
              {t.userPackages.noPackages.description}
            </p>
            <div className="flex justify-center">
              <Link href={getLocalizedPath("/packages")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                {t.userPackages.noPackages.viewPackages}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">{t.userPackages.title}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((userPackage) => {
          const pkg = userPackage.package;
          if (!pkg) return null;
          
          const totalListings = pkg.listing_count + pkg.bonus_listing_count;
          const remainingListings = userPackage.listings_remaining + userPackage.bonus_listings_remaining;
          const usedListingsPercent = Math.round(((totalListings - remainingListings) / totalListings) * 100);
          
          // const expiryDate = new Date(userPackage.expires_at);
          // const isExpiringSoon = expiryDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
          
          return (
            <Card key={userPackage.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{locale === 'ar' && pkg.name_ar ? pkg.name_ar : pkg.name}</CardTitle>
                    <CardDescription>{locale === 'ar' && pkg.description_ar ? pkg.description_ar : pkg.description}</CardDescription>
                  </div>
                  {userPackage.is_featured && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">{t.userPackages.card.featured}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Listings usage */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.userPackages.card.listingsUsage}</span>
                      <span>
                        {totalListings - remainingListings} / {totalListings} {t.userPackages.card.used}
                      </span>
                    </div>
                    <Progress value={usedListingsPercent} className="h-2" />
                  </div>
                  
                  {/* Expiry information */}
                  {/* <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={isExpiringSoon ? 'text-amber-600' : ''}>
                      {t.userPackages.card.expires} {format(expiryDate, 'MMM d, yyyy')}
                      {isExpiringSoon && ` ${t.userPackages.card.soon}`}
                    </span>
                  </div> */}
                  
                  {/* Remaining details */}
                  <div className="border rounded-md p-3 bg-muted/30 space-y-2">
                    <div className="grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">{t.userPackages.card.regularListings}</span>
                      <span className="font-medium">{userPackage.listings_remaining}</span>
                    </div>
                    {pkg.bonus_listing_count > 0 && (
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-muted-foreground">{t.userPackages.card.bonusListings}</span>
                        <span className="font-medium">{userPackage.bonus_listings_remaining}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">{t.userPackages.card.listingDuration}</span>
                      <span className="font-medium">{pkg.duration_days} {t.userPackages.card.day}</span>
                    </div>
                    {pkg.bonus_duration_days > 0 && (
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-muted-foreground">{t.userPackages.card.bonusDuration}</span>
                        <span className="font-medium">{pkg.bonus_duration_days} {t.userPackages.card.days}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t text-xs text-muted-foreground pt-5">
                <div className="w-full">
                  <div className="flex justify-between mb-3">
                    <span>{t.userPackages.card.purchased} {formatDistanceToNow(new Date(userPackage.created_at), { addSuffix: true })}</span>
                    <span>{t.userPackages.card.id} {userPackage.id.split('-')[0]}</span>
                  </div>
                  <Link 
                    href={getLocalizedPath(`/sell`)} 
                    className="w-full"
                  >
                    <Button className="w-full">
                      {t.userPackages.card.usePackage || 'Use Package'}
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}