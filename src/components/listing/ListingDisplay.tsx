// components/listing/ListingDisplay.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ImageNavigation } from "@/components/ImageNavigation"
import { VehicleDetails } from '@/components/listing/VehicleDetails'
import { PropertyDetails } from '@/components/listing/PropertyDetails'
import { SellerProfile } from "@/components/listing/SellerProfile"
import { ListingMap } from "./ListingMap"
import { DisplayListing } from "@/types/listing-display"

interface ListingDisplayProps {
  listing: DisplayListing
}

export function ListingDisplay({ listing }: ListingDisplayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div className="relative aspect-square">
        <Image
          src={listing.images[currentImageIndex]}
          alt={listing.title}
          fill
          className="object-cover rounded-lg"
        />
        <ImageNavigation
          total={listing.images.length}
          current={currentImageIndex}
          onNext={() => setCurrentImageIndex((i) => (i + 1) % listing.images.length)}
          onPrev={() => setCurrentImageIndex((i) => (i - 1 + listing.images.length) % listing.images.length)}
          onDotClick={setCurrentImageIndex}
        />
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{listing.category.name}</Badge>
            <Badge variant="outline">{listing.condition}</Badge>
          </div>
        </div>

        <div>
          <p className="text-4xl font-bold text-primary">
            {formatPrice(listing.price)}
          </p>
        </div>

        <SellerProfile user={listing.user} />


        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="whitespace-pre-wrap">{listing.description}</p>
        </div>
      </div>
      {listing.vehicle_details && (
  <VehicleDetails details={listing.vehicle_details} />
)}
{listing.property_details && (
  <PropertyDetails details={listing.property_details} />
)}
<ListingMap location={listing.location} title={listing.title} />
    </div>
  )
}