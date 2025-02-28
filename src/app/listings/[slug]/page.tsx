// app/listings/[slug]/page.tsx
import { getListing, getSimilarListings, incrementViewCount } from '@/actions/listing-display-actions'
import { SimilarListings } from '@/components/listing/SimilarListings'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageCircle, Phone, Share2, Flag } from 'lucide-react'
import { ListingMap } from '@/components/listing/ListingMap'
import { ListingDescription } from '@/components/listing/ListingDescription'
import { ImageGallery } from '@/components/listing/ImageGallery'
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
  await incrementViewCount(listing.id)
  const similarListings = await getSimilarListings(listing.category.id, listing.id)

  return (
    <main className="container px-4 md:px-6 py-6 m-auto">
      <div className="lg:hidden">
        <BreadcrumbNav />
      </div>

      {/* Mobile Price and Actions Bar (Fixed at top on scroll) */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 backdrop-blur-sm py-3 -mx-4 px-4 md:px-6 lg:hidden border-b">
        <div className="text-xl font-bold">{listing.price} AED</div>
        <div className="flex gap-2">
          <Button size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden lg:block mt-6">
        <BreadcrumbNav />
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
        {/* Left Column (Full width on mobile, 2/3 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={listing.images} />
          
          {/* Mobile-only title and price section */}
          <div className="lg:hidden space-y-2">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {listing.address} • {formatDistance(new Date(listing.created_at), new Date(), { addSuffix: true })}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile-only seller card */}
          <Card className="lg:hidden">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={listing.user.avatar_url || ''} />
                  <AvatarFallback>{listing.user.full_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{listing.user.full_name}</CardTitle>
                  <CardDescription className="text-xs">Member since {formatDistance(new Date(listing.user.join_date), new Date(), { addSuffix: true })}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Separator className="hidden lg:block" />
          
          {listing.vehicle_details && (
            <VehicleDetails details={listing.vehicle_details} />
          )}
          {listing.property_details && (
            <PropertyDetails details={listing.property_details} />
          )}
          
          <Separator />
          
          {/* Hide the title on desktop as it's in the description component */}
          <div className="hidden lg:block">
            <ListingDescription 
              title={listing.title} 
              location={listing.address} 
              timestamp={listing.created_at} 
              description={listing.description} 
            />
          </div>
          
          {/* Mobile version of description without title */}
          <div className="lg:hidden">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="text-sm whitespace-pre-line">{listing.description}</div>
          </div>
        </div>

        {/* Right Column (Hidden on mobile and shown in different locations) */}
        <div className="hidden lg:block space-y-4">
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

      {/* Map Section for Mobile Only */}
      <div className="mt-6 lg:hidden">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ListingMap
              location={listing.address}
              latitude={listing.latitude}
              longitude={listing.longitude}
              title={listing.title}
            />
          </CardContent>
        </Card>
      </div>

      {/* Safety Tips for Mobile */}
      <div className="mt-6 lg:hidden">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">General Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 text-sm space-y-2">
            <p>• Only meet in public places</p>
            <p>• Never pay or transfer data in advance</p>
            <p>• Inspect the product properly before purchasing</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Action Buttons (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background p-4 border-t lg:hidden">
        <div className="flex gap-2">
          <Button className="flex-1">
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </div>
      </div>

      {/* Similar Listings */}
      <div className="mt-10 mb-20 lg:mb-10">
        <SimilarListings listings={similarListings} categoryName={listing.category.name} />
      </div>
    </main>
  )
}