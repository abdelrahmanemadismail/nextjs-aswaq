// components/listing/PropertyDetails.tsx
import { useTranslation } from "@/hooks/use-translation"

interface PropertyDetailsProps {
  details: {
    property_type: 'apartment' | 'villa' | 'commercial';
    bedrooms?: number;
    bathrooms?: number;
    square_footage?: number;
    community: string;
    community_ar?: string;
    furnished: boolean;
    payment_terms: 'rent' | 'sale';
  }
}

export function PropertyDetails({ details }: PropertyDetailsProps) {
  const { t, locale } = useTranslation()
  
  // Get localized content
  const localizedCommunity = locale === 'ar' && details.community_ar ? details.community_ar : details.community

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t.listings.properties.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.properties.propertyType}</h3>
          <p className="font-medium capitalize">
            {details.property_type === 'apartment' ? t.listings.properties.apartment :
             details.property_type === 'villa' ? t.listings.properties.villa :
             t.listings.properties.commercial}
          </p>
        </div>
        {details.bedrooms && (
          <div>
            <h3 className="text-sm text-muted-foreground">{t.listings.properties.bedrooms}</h3>
            <p className="font-medium">{details.bedrooms}</p>
          </div>
        )}
        {details.bathrooms && (
          <div>
            <h3 className="text-sm text-muted-foreground">{t.listings.properties.bathrooms}</h3>
            <p className="font-medium">{details.bathrooms}</p>
          </div>
        )}
        {details.square_footage && (
          <div>
            <h3 className="text-sm text-muted-foreground">{t.listings.properties.squareFootage}</h3>
            <p className="font-medium">{details.square_footage} {t.listings.properties.sqft}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.properties.community}</h3>
          <p className="font-medium">{localizedCommunity}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">{t.listings.properties.furnished}</h3>
          <p className="font-medium">{details.furnished ? t.common.yes : t.common.no}</p>
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