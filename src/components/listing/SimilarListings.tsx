// components/listing/SimilarListings.tsx
import ListingCard from "@/components/ListingCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DisplayListing } from "@/types/listing-display"

interface SimilarListingsProps {
 listings: DisplayListing[]
 categoryName: string
}

export function SimilarListings({ listings, categoryName }: SimilarListingsProps) {
 if (listings.length === 0) return null

 return (
   <Card className="mt-8">
     <CardHeader>
       <CardTitle>Similar {categoryName}</CardTitle>
     </CardHeader>
     <CardContent>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {listings.map((listing) => (
           <ListingCard
             key={listing.id}
             slug={listing.slug}
             photos={listing.images}
             title={listing.title}
             price={listing.price}
             location={listing.address} 
             timestamp={listing.created_at}
           />
         ))}
       </div>
     </CardContent>
   </Card>
 )
}