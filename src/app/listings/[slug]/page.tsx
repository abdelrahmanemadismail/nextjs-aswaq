// app/listings/[slug]/page.tsx
import { getListing, getSimilarListings, incrementViewCount } from '@/actions/listing-display-actions'
// import { ListingDisplay } from '@/components/listing/ListingDisplay'
import { SimilarListings } from '@/components/listing/SimilarListings'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import { Phone } from 'lucide-react'
import { ListingMap } from '@/components/listing/ListingMap'
import { ListingDescription } from '@/components/listing/ListingDescription'
// import { ListingDetails } from '@/components/listing/ListingDetails'
import { ImageGallery } from '@/components/listing/ImageGallery'
// import { ListingHighlights } from '@/components/listing/ListingHighlights'
import { PropertyDetails } from '@/components/listing/PropertyDetails'
import { VehicleDetails } from '@/components/listing/VehicleDetails'
import { formatDistance } from 'date-fns'

type tParams = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: tParams }): Promise<Metadata> {
  const { slug } = await props.params

  const listing = await getListing(slug)

  return {
    title: `${listing.title} | Aswaq`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: [listing.images[0]],
    },
  }
}

export default async function ListingPage(props: { params: tParams }) {
  const { slug } = await props.params

  const listing = await getListing(slug)
  console.log("le", listing)
  await incrementViewCount(listing.id)
  const similarListings = await getSimilarListings(listing.category.id, listing.id)

  return (
    <main className="container py-6 m-auto">
      <BreadcrumbNav />

      <div className="grid grid-cols-3 gap-8 mt-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          <ImageGallery images={listing.images} />
          <Separator />
          {listing.vehicle_details && (
            <VehicleDetails details={listing.vehicle_details} />
          )}
          {listing.property_details && (
            <PropertyDetails details={listing.property_details} />
          )}
          {/* <ListingDetails details={listing.details} /> */}
          <Separator />
          <ListingDescription title={listing.title} location={listing.address} timestamp={listing.created_at} description={listing.description} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="text-3xl font-bold">{listing.price} AED</div>

          <div className="flex flex-col gap-2">
            <Button className="w-full">
              <Phone className="mr-2 h-4 w-4" />
              Phone Number
            </Button>
            <Button variant="outline" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={listing.user.avatar_url || ''} />
                  <AvatarFallback>{listing.user.full_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{listing.user.full_name}</CardTitle>
                  <CardDescription>Member since {formatDistance(new Date(listing.user.join_date), new Date(), { addSuffix: true })}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* <Button variant="link" className="p-0">View Profile →</Button> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <ListingMap
                location={listing.address}
                latitude={listing.latitude}
                longitude={listing.longitude}
                title={listing.title}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Only meet in public places</p>
              <p>• Never pay or transfer data in advance</p>
              <p>• Inspect the product properly before purchasing</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <SimilarListings listings={similarListings} categoryName={listing.category.name} />
    </main>
  )
}