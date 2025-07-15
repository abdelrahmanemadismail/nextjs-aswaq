import { getAvailablePackages } from '@/actions/payment-actions';
import PackageCard from '@/components/checkout/PackageCard';
import { Card, CardContent } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { Languages } from '@/constants/enums';
import getTrans from '@/utils/translation';
import { headers } from 'next/headers';


export default async function PackageList() {
    const url = (await headers()).get('x-url')
    const locale = url?.split('/')[3] as Locale
    const t = await getTrans(locale);
    const { packages, error } = await getAvailablePackages();

    if (error) {
      return (
        <div className="">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">{t.payments.packages}</h1>
            <Card>
              <CardContent className="py-8">
                <p className="text-destructive">{t.payments.errorLoadingPackages}: {error}</p>
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
        features.push(`${pkg.listing_count} ${pkg.listing_count > 1 ? t.payments.listings : t.payments.listing}`);
      }
      
      if (pkg.bonus_listing_count > 0) {
        // For Arabic, don't add 's' for plural
        if (locale === Languages.ARABIC) {
          features.push(`${pkg.bonus_listing_count} ${t.payments.bonusListing}`);
        } else {
          features.push(`${pkg.bonus_listing_count} ${t.payments.bonusListing}${pkg.bonus_listing_count > 1 ? 's' : ''}`);
        }
      }
      
      features.push(`${pkg.duration_days} ${t.payments.days}`);
      if (pkg.bonus_duration_days > 0) {
        // For Arabic, don't add 's' for plural
        if (locale === Languages.ARABIC) {
          features.push(`${pkg.bonus_duration_days} ${pkg.bonus_duration_days<=10 ? "أيام إضافية" : t.payments.bonusDay}`);
        } else {
          features.push(`${pkg.bonus_duration_days} ${t.payments.bonusDay}${pkg.bonus_duration_days > 1 ? 's' : ''}`);
        }
      }
      // features.push(`${t.payments.validFor} ${pkg.validity_days} ${t.payments.days}`);
      
      if (pkg.is_featured) {
        features.push(t.payments.featuredListings);
      }
      
      return features;
    };
  
    return (
      <div>
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">{t.payments.chooseYourPackage}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.payments.selectPerfectPlan}
            </p>
          </div>
  
          {/* Free Tier Packages */}
          {packages?.free_tier && packages.free_tier.length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold mb-8 text-center">{t.payments.freeTierPackages}</h2>
              <div className="flex justify-center">
                {packages.free_tier.map((pkg) => (
                  <div key={pkg.id} className="w-full max-w-md">
                    <PackageCard
                      id={pkg.id}
                      name={locale === 'ar' && pkg.name_ar ? pkg.name_ar : pkg.name}
                      description={locale === 'ar' && pkg.description_ar ? pkg.description_ar : (pkg.description || undefined)}
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
              <h2 className="text-3xl font-bold mb-8 text-center">{t.payments.durationBasedPackages}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.duration.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    id={pkg.id}
                    name={locale === 'ar' && pkg.name_ar ? pkg.name_ar : pkg.name}
                    description={locale === 'ar' && pkg.description_ar ? pkg.description_ar : (pkg.description || undefined)}
                    price={pkg.price}
                    features={formatPackageFeatures(pkg)}
                  />
                ))}
              </div>
            </section>
          )}
  
          {/* Bulk Packages */}
          {packages?.bulk && packages.bulk.length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold mb-8 text-center">{t.payments.bulkPackages}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.bulk.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    id={pkg.id}
                    name={locale === 'ar' && pkg.name_ar ? pkg.name_ar : pkg.name}
                    description={locale === 'ar' && pkg.description_ar ? pkg.description_ar : (pkg.description || undefined)}
                    price={pkg.price}
                    features={formatPackageFeatures(pkg)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Unlimited Packages */}
          {packages?.unlimited && packages.unlimited.length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold mb-8 text-center">{t.payments.unlimitedPackages}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.unlimited.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    id={pkg.id}
                    name={locale === 'ar' && pkg.name_ar ? pkg.name_ar : pkg.name}
                    description={locale === 'ar' && pkg.description_ar ? pkg.description_ar : (pkg.description || undefined)}
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