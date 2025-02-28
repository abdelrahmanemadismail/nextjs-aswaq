import { getAvailablePackages } from '@/actions/payment-actions';
import PackageCard from '@/components/checkout/PackageCard';
import { Card, CardContent } from '@/components/ui/card';

export default async function PackageList() {
    const { packages, error } = await getAvailablePackages();

    if (error) {
      return (
        <div className="">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Packages</h1>
            <Card>
              <CardContent className="py-8">
                <p className="text-destructive">Error loading packages: {error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatPackageFeatures = (pkg: any) => {
      const features = [];
      
      if (pkg.listing_count > 0) {
        features.push(`${pkg.listing_count} listing${pkg.listing_count > 1 ? 's' : ''}`);
      }
      
      if (pkg.bonus_listing_count > 0) {
        features.push(`${pkg.bonus_listing_count} bonus listing${pkg.bonus_listing_count > 1 ? 's' : ''}`);
      }
      
      features.push(`${pkg.duration_days} days`);
      if (pkg.bonus_duration_days > 0) {
        features.push(`${pkg.bonus_duration_days} bonus day${pkg.bonus_duration_days > 1 ? 's' : ''}`);
      }
      // features.push(`Valid for ${pkg.validity_days} days`);
      
      if (pkg.is_featured) {
        features.push('Featured listings');
      }
      
      return features;
    };
  
    return (
      <div>
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Choose Your Package</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan to start your journey with ASWAQ Online
            </p>
          </div>
  
          {/* Free Tier Packages */}
          {packages?.free_tier && packages.free_tier.length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold mb-8 text-center">Free Tier Packages</h2>
              <div className="flex justify-center">
                {packages.free_tier.map((pkg) => (
                  <div key={pkg.id} className="w-full max-w-md">
                    <PackageCard
                      id={pkg.id}
                      name={pkg.name}
                      description={pkg.description || undefined}
                      price={pkg.price}
                      features={formatPackageFeatures(pkg)}
                      isFree={true}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
  
          {/* Duration-Based Packages */}
          {packages?.duration && packages.duration.length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold mb-8 text-center">Duration-Based Packages</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.duration.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    id={pkg.id}
                    name={pkg.name}
                    description={pkg.description || undefined}
                    price={pkg.price}
                    features={formatPackageFeatures(pkg)}
                  />
                ))}
              </div>
            </section>
          )}
  
          {/* Bulk Packages */}
          {packages?.bulk && packages.bulk.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Bulk Packages</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.bulk.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    id={pkg.id}
                    name={pkg.name}
                    description={pkg.description || undefined}
                    price={pkg.price}
                    features={formatPackageFeatures(pkg)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
}