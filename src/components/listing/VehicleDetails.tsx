// components/listing/VehicleDetails.tsx

import { Locale } from "@/i18n.config";
import getTrans from "@/utils/translation";
import { headers } from "next/headers";

interface VehicleDetailsProps {
  details: {
    brand: string;
    model: string;
    year: number;
    color?: string;
    color_ar?: string;
    mileage?: number;
    specs?: string;
    specs_ar?: string;
    sub_category: 'car' | 'motorcycle' | 'boats' | 'heavytrucks';
    payment_terms: 'rent' | 'sale';
  }
}

export async function VehicleDetails({ details }: VehicleDetailsProps) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  // Get localized content
  const localizedColor = locale === 'ar' && details.color_ar ? details.color_ar : details.color
  const localizedSpecs = locale === 'ar' && details.specs_ar ? details.specs_ar : details.specs

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t.listings.vehicles.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.brand}</h3>
          <p className="font-medium">{details.brand}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.model}</h3>
          <p className="font-medium">{details.model}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.year}</h3>
          <p className="font-medium">{details.year}</p>
        </div>
        {localizedColor && (
          <div>
            <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.color}</h3>
            <p className="font-medium">{localizedColor}</p>
          </div>
        )}
        {details.mileage && (
          <div>
            <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.mileage}</h3>
            <p className="font-medium">{details.mileage.toLocaleString()} {t.listings.vehicles.km}</p>
          </div>
        )}
        {localizedSpecs && (
          <div>
            <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.specs}</h3>
            <p className="font-medium">{localizedSpecs}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.vehicles.subCategory}</h3>
          <p className="font-medium capitalize">{details.sub_category}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.common.paymentTerms}</h3>
          <p className="font-medium capitalize">
            {details.payment_terms === 'rent' ? t.listings.common.forRent : t.listings.common.forSale}
          </p>
        </div>
      </div>
    </div>
  )
}