import { getUserPackages } from '@/actions/payment-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default async function UserPackagesPage() {
  const { packages, error } = await getUserPackages();

  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">My Packages</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">Error loading packages: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">My Packages</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Active Packages</h2>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have any active packages. Purchase a package to start listing items.
            </p>
            <div className="flex justify-center">
              <Link href="/packages" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                View Available Packages
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">My Packages</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((userPackage) => {
          const pkg = userPackage.package;
          if (!pkg) return null;
          
          const totalListings = pkg.listing_count + pkg.bonus_listing_count;
          const remainingListings = userPackage.listings_remaining + userPackage.bonus_listings_remaining;
          const usedListingsPercent = Math.round(((totalListings - remainingListings) / totalListings) * 100);
          
          const expiryDate = new Date(userPackage.expires_at);
          const isExpiringSoon = expiryDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
          
          return (
            <Card key={userPackage.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                  {userPackage.is_featured && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Listings usage */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Listings Usage</span>
                      <span>
                        {totalListings - remainingListings} / {totalListings} used
                      </span>
                    </div>
                    <Progress value={usedListingsPercent} className="h-2" />
                  </div>
                  
                  {/* Expiry information */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={isExpiringSoon ? 'text-amber-600' : ''}>
                      Expires {format(expiryDate, 'MMM d, yyyy')}
                      {isExpiringSoon && ' (soon)'}
                    </span>
                  </div>
                  
                  {/* Remaining details */}
                  <div className="border rounded-md p-3 bg-muted/30 space-y-2">
                    <div className="grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">Regular listings:</span>
                      <span className="font-medium">{userPackage.listings_remaining}</span>
                    </div>
                    {pkg.bonus_listing_count > 0 && (
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-muted-foreground">Bonus listings:</span>
                        <span className="font-medium">{userPackage.bonus_listings_remaining}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">Listing duration:</span>
                      <span className="font-medium">{pkg.duration_days} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t text-xs text-muted-foreground">
                <div className="w-full flex justify-between">
                  <span>Purchased {formatDistanceToNow(new Date(userPackage.created_at), { addSuffix: true })}</span>
                  <span>ID: {userPackage.id.split('-')[0]}</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}