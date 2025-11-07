'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Phone, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ImageNavigation from "@/components/ImageNavigation"
import LikeButton from "@/components/LikeButton"
import { cn } from "@/lib/utils"
import { formatDistance } from "date-fns"
import { StartChat } from "@/components/chat/StartChat"
import { useTranslation } from "@/hooks/use-translation"
import { Languages, CURRENCY } from "@/constants/enums"

// Define the listing type
export interface Listing {
  id: string
  user_id: string // seller_id
  title: string
  title_ar?: string
  price: number | string
  slug: string
  images: string[] // photos
  address: string // location
  address_ar?: string
  created_at: string // timestamp
  condition?: string
  condition_ar?: string
  contact_methods?: ('phone' | 'chat' | 'whatsapp')[]
  phone_number?: string
  // For vehicle listings
  vehicle_details?: {
    mileage?: number
    year?: number
  }
  // Other listing properties as needed
}

export interface FullWidthListingCardProps {
  listing: Listing
  className?: string
  onLike?: () => void
  currency?: string
}

export default function FullWidthListingCard({
  listing,
  className = "",
  onLike,
  currency = CURRENCY.SYMBOL
}: FullWidthListingCardProps) {
  const { t, getLocalizedPath, locale } = useTranslation();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % listing.images.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + listing.images.length) % listing.images.length)
  }

  // Get localized content
  const isArabic = locale === Languages.ARABIC;
  const listingTitle = isArabic && listing.title_ar ? listing.title_ar : listing.title;
  const listingAddress = listing.address;
  const listingCondition = isArabic && listing.condition_ar ? listing.condition_ar : listing.condition;

  // Format vehicle details for display
  const mileage = listing.vehicle_details?.mileage
    ? `${listing.vehicle_details.mileage.toLocaleString()} ${t.listings.km}`
    : undefined

  const year = listing.vehicle_details?.year?.toString()

  return (
    <Card className={cn("flex flex-col md:flex-row w-full max-w-4xl overflow-hidden rounded-3xl", className)}>
      {/* Image container - full width on mobile, 40% on desktop */}
      <div className="relative w-full md:w-2/5 h-[250px] md:h-auto md:min-h-[300px] group z-10">
      <Link href={getLocalizedPath(`/listings/${listing.slug}`)} className="block">
        <Image
          src={listing.images[currentPhotoIndex]}
          alt={listingTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover w-full h-full"
        />
        </Link>

        <ImageNavigation
          total={listing.images.length}
          current={currentPhotoIndex}
          onNext={nextPhoto}
          onPrev={prevPhoto}
          onDotClick={setCurrentPhotoIndex}
          arrowSize="md"
        />
      </div>

      {/* Content container - full width on mobile, 60% on desktop */}
      <CardContent className="flex flex-col justify-between w-full md:w-3/5 p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {currency} {typeof listing.price === 'number' ? listing.price.toLocaleString() : listing.price}
            </h2>
            <div className="flex gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8 md:h-10 md:w-10"
                title={t.listings.share}
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <LikeButton
                onLike={onLike}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
                size="sm"
              />
            </div>
          </div>

          <Link href={getLocalizedPath(`/listings/${listing.slug}`)} className="block">
            <p className="text-lg md:text-xl text-muted-foreground line-clamp-2">{listingTitle}</p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {listingCondition && (
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs md:text-sm capitalize">
                  {listingCondition}
                </Badge>
              )}
              {mileage && (
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs md:text-sm">
                  {mileage}
                </Badge>
              )}
              {year && (
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs md:text-sm">
                  {year}
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2 text-xs md:text-sm text-muted-foreground">
              <span className="">{listingAddress}</span>
              <span>{formatDistance(new Date(listing.created_at), new Date(), { addSuffix: true })}</span>
            </div>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 md:mt-6">
          {/* Default to all contact methods if not specified */}
          {(!listing.contact_methods || listing.contact_methods.includes('phone')) && (
            <Button
              variant="outline"
              size="default"
              className="flex-1 border-primary text-primary hover:bg-primary/10 hover:text-primary text-sm md:text-base"
              onClick={() => {
                if (listing.phone_number) {
                  window.location.href = `tel:${listing.phone_number}`;
                }
              }}
              disabled={!listing.phone_number}
              title={!listing.phone_number ? t.listings.phoneNotAvailable : t.listings.callSeller}
            >
              <Phone className="w-4 h-4 mr-2" />
              {t.listings.call}
            </Button>
          )}

          {(!listing.contact_methods || listing.contact_methods.includes('chat')) && (
            <StartChat
              listingId={listing.id}
              sellerId={listing.user_id}
              className="flex-1 text-sm md:text-base"
            />
          )}

          {(!listing.contact_methods || listing.contact_methods.includes('whatsapp')) && (
            <Button
              variant="outline"
              size="default"
              className="flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] text-sm md:text-base"
              onClick={() => {
                if (listing.phone_number) {
                  // Format phone number to ensure it works with WhatsApp
                  const formattedNumber = listing.phone_number.replace(/[^\d+]/g, '');
                  // Create message with listing title
                  const message = t.listings.whatsappMessage.replace('{listingTitle}', listingTitle);
                  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }
              }}
              disabled={!listing.phone_number}
              title={!listing.phone_number ? t.listings.whatsappNotAvailable : t.listings.messageOnWhatsapp}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t.listings.whatsapp}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}