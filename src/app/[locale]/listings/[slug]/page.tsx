// app/listings/[slug]/page.tsx
import { getListing, getSimilarListings, incrementViewCount } from '@/actions/listing-display-actions'
import { SimilarListings } from '@/components/listing/SimilarListings'
import { Metadata } from 'next'
import { Separator } from '@/components/ui/separator'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ListingMap } from '@/components/listing/ListingMap'
import { ListingDescription } from '@/components/listing/ListingDescription'
import { ImageGallery } from '@/components/listing/ImageGallery'
import { PropertyDetails } from '@/components/listing/PropertyDetails'
import { VehicleDetails } from '@/components/listing/VehicleDetails'
import { formatDistance } from 'date-fns'
import { Languages } from '@/constants/enums'
import { ListingActionButtons } from "@/components/listing/ListingActionButtons"
import { ListingMobileTopActions } from "@/components/listing/ListingMobileTopActions"

type tParams = Promise<{ slug: string; locale: string }>;

export async function generateMetadata(props: { params: tParams }): Promise<Metadata> {
  const { slug, locale } = await props.params

  const listing = await getListing(slug)
  const isArabic = locale === Languages.ARABIC

  // Use localized content for title and description
  const title = isArabic && listing.title_ar ? listing.title_ar : listing.title
  const description = isArabic && listing.description_ar ? listing.description_ar : listing.description

  return {
    title: `${title} | Aswaq`,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      images: [listing.images[0]],
    },
  }
}

export default async function ListingPage(props: { params: tParams }) {
  const { slug, locale } = await props.params
  const isArabic = locale === Languages.ARABIC

  const listing = await getListing(slug)
  await incrementViewCount(listing.id)
  const similarListings = await getSimilarListings(listing.category.id, listing.id)

  // Get translations
  const dict = await import(`@/dictionaries/${locale}.json`).then(module => module.default)
  const t = dict

  // Get localized content
  const listingTitle = isArabic && listing.title_ar ? listing.title_ar : listing.title

  // Check if coordinates are available to show the map
  const hasCoordinates = listing.latitude && listing.longitude

  return (
    <main className="container px-4 md:px-6 py-6 m-auto">
      <div className="lg:hidden">
        <BreadcrumbNav />
      </div>

      {/* Mobile Price and Actions Bar (Fixed at top on scroll) */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 backdrop-blur-sm py-3 -mx-4 px-4 md:px-6 lg:hidden border-b">
        <div className="text-xl font-bold">{listing.price} AED</div>
        <ListingMobileTopActions
          listingId={listing.id}
          sellerId={listing.user.id}
          phoneNumber={listing.user.phone_number}
          contactMethods={listing.contact_methods}
          listingTitle={listingTitle}
          translations={{
            phoneNotAvailable: t.listings.phoneNotAvailable,
            callSeller: t.listings.callSeller,
            whatsappNotAvailable: t.listings.whatsappNotAvailable,
            messageOnWhatsapp: t.listings.messageOnWhatsapp,
            whatsappMessage: t.listings.whatsappMessage
          }}
        />
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
            <h1 className="text-2xl font-bold">{isArabic && listing.title_ar ? listing.title_ar : listing.title}</h1>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {isArabic && listing.address_ar ? listing.address_ar : listing.address} • {formatDistance(new Date(listing.created_at), new Date(), { addSuffix: true })}
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
                  <CardDescription className="text-xs">{t.profile.memberSince} {formatDistance(new Date(listing.user.join_date), new Date(), { addSuffix: true })}</CardDescription>
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
              title_ar={listing.title_ar}
              location={listing.address}
              location_ar={listing.address_ar}
              timestamp={listing.created_at}
              description={listing.description}
              description_ar={listing.description_ar}
            />
          </div>

          {/* Mobile version of description without title */}
          <div className="lg:hidden">
            <h2 className="text-xl font-semibold mb-4">{t.listings.description}</h2>
            <div className="text-sm whitespace-pre-line">
              {isArabic && listing.description_ar ? listing.description_ar : listing.description}
            </div>
          </div>
        </div>

        {/* Right Column (Hidden on mobile and shown in different locations) */}
        <div className="hidden lg:block space-y-4">
          <div className="text-3xl font-bold">{listing.price} AED</div>

          <div className="mt-6 space-y-3">
            <ListingActionButtons
              listingId={listing.id}
              sellerId={listing.user.id}
              phoneNumber={listing.user.phone_number}
              contactMethods={listing.contact_methods}
              listingTitle={listingTitle}
              translations={{
                phoneNotAvailable: t.listings.phoneNotAvailable,
                callSeller: t.listings.callSeller,
                call: t.listings.actionButtons.phoneNumber,
                whatsappNotAvailable: t.listings.whatsappNotAvailable,
                messageOnWhatsapp: t.listings.messageOnWhatsapp,
                whatsapp: t.listings.actionButtons.whatsapp || "WhatsApp",
                whatsappMessage: t.listings.whatsappMessage
              }}
            />
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
                  <CardDescription>{t.profile.memberSince} {formatDistance(new Date(listing.user.join_date), new Date(), { addSuffix: true })}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {hasCoordinates && (
            <Card>
              <CardHeader>
                <CardTitle>{t.listings.map.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ListingMap
                  location={listing.address}
                  location_ar={listing.address_ar}
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  title={listing.title}
                  title_ar={listing.title_ar}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t.listings.generalTips.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>{t.listings.generalTips.publicPlaces}</p>
              <p>{t.listings.generalTips.advancePayment}</p>
              <p>{t.listings.generalTips.inspectProduct}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section for Mobile Only */}
      {hasCoordinates && (
        <div className="mt-6 lg:hidden">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{t.listings.map.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <ListingMap
                location={listing.address}
                location_ar={listing.address_ar}
                latitude={listing.latitude}
                longitude={listing.longitude}
                title={listing.title}
                title_ar={listing.title_ar}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Safety Tips for Mobile */}
      <div className="mt-6 lg:hidden">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{t.listings.generalTips.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 text-sm space-y-2">
            <p>{t.listings.generalTips.publicPlaces}</p>
            <p>{t.listings.generalTips.advancePayment}</p>
            <p>{t.listings.generalTips.inspectProduct}</p>
          </CardContent>
        </Card>
      </div>

      {/* Similar Listings */}
      <div className="mt-10 mb-20 lg:mb-10">
        <SimilarListings
          listings={similarListings}
          categoryName={listing.category.name}
          categoryName_ar={listing.category.name_ar}
        />
      </div>

      {/* Mobile Action Buttons (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background p-4 border-t lg:hidden">
        <ListingActionButtons
          listingId={listing.id}
          sellerId={listing.user.id}
          phoneNumber={listing.user.phone_number}
          contactMethods={listing.contact_methods}
          listingTitle={listingTitle}
          translations={{
            phoneNotAvailable: t.listings.phoneNotAvailable,
            callSeller: t.listings.callSeller,
            call: t.listings.actionButtons.call,
            whatsappNotAvailable: t.listings.whatsappNotAvailable,
            messageOnWhatsapp: t.listings.messageOnWhatsapp,
            whatsapp: t.listings.actionButtons.whatsapp || "WhatsApp",
            whatsappMessage: t.listings.whatsappMessage
          }}
        />
      </div>
    </main>
  )
}