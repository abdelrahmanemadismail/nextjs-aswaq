// components/listing/SimilarListings.tsx
import ListingCard from "@/components/ListingCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DisplayListing } from "@/types/listing-display"
import { Languages } from "@/constants/enums"
import { headers } from "next/headers"
import { Locale } from "@/i18n.config"
import getTrans from "@/utils/translation"

interface SimilarListingsProps {
 listings: DisplayListing[]
 categoryName: string
 categoryName_ar?: string
}

export async function SimilarListings({ listings, categoryName, categoryName_ar }: SimilarListingsProps) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
 if (listings.length === 0) return null

 // Use Arabic category name if available and locale is Arabic
 const localizedCategoryName = locale === Languages.ARABIC && categoryName_ar 
  ? categoryName_ar 
  : categoryName

 return (
   <Card className="mt-8">
     <CardHeader>
       <CardTitle>{t.listings.similar} {localizedCategoryName}</CardTitle>
     </CardHeader>
     <CardContent>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {listings.map((listing) => (
           <ListingCard
             key={listing.id}
             slug={listing.slug}
             photos={listing.images}
             title={locale === Languages.ARABIC && listing.title_ar ? listing.title_ar : listing.title}
             title_ar={listing.title_ar}
             price={listing.price}
             location={locale === Languages.ARABIC && listing.address_ar ? listing.address_ar : listing.address}
             location_ar={listing.address_ar}
             timestamp={listing.created_at}
           />
         ))}
       </div>
     </CardContent>
   </Card>
 )
}