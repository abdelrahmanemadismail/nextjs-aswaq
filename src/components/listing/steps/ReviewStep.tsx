// components/listing/steps/ReviewStep.tsx

"use client"

import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { formatPrice } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useLocationStore } from '@/hooks/use-location-store'

export function ReviewStep() {
  const { watch } = useFormContext<ListingFormData>()
  const formData = watch()
  const [locationText, setLocationText] = useState<string>('No location selected')

  // Get the cities data from the location store
  const { countries, cities } = useLocationStore()

  // Find the selected location whenever location_id changes
  useEffect(() => {
    if (!formData.details.location_id) return

    // First try to find it in cities
    for (const countryId in cities) {
      const city = cities[countryId].find(city => city.id === formData.details.location_id)
      if (city) {
        const country = countries.find(c => c.id === countryId)
        setLocationText(`${city.name}, ${country?.name || ''}`)
        return
      }
    }

    // If not found in cities, check countries
    const country = countries.find(c => c.id === formData.details.location_id)
    if (country) {
      setLocationText(country.name)
    }
  }, [formData.details.location_id, countries, cities])

  const renderImages = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {formData.images.map((file, index) => (
        <div key={index} className="relative aspect-square">
          <Image
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      ))}
    </div>
  )

  const renderContactMethods = () => (
    <div className="flex gap-2">
      {formData.details.contact_method.map((method) => (
        <Badge key={method} variant="secondary">
          {method}
        </Badge>
      ))}
    </div>
  )

  const renderCategorySpecificDetails = () => {
    if (formData.vehicle_details) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Brand</dt>
                <dd>{formData.vehicle_details.brand}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Model</dt>
                <dd>{formData.vehicle_details.model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Year</dt>
                <dd>{formData.vehicle_details.year}</dd>
              </div>
              {formData.vehicle_details.mileage && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Mileage</dt>
                  <dd>{formData.vehicle_details.mileage.toLocaleString()} km</dd>
                </div>
              )}
              {formData.vehicle_details.color && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Color</dt>
                  <dd>{formData.vehicle_details.color}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Payment Terms</dt>
                <dd className="capitalize">{formData.vehicle_details.payment_terms}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )
    }

    if (formData.property_details) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Property Type</dt>
                <dd className="capitalize">{formData.property_details.property_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Payment Terms</dt>
                <dd className="capitalize">{formData.property_details.payment_terms}</dd>
              </div>
              {formData.property_details.bedrooms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Bedrooms</dt>
                  <dd>{formData.property_details.bedrooms}</dd>
                </div>
              )}
              {formData.property_details.bathrooms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Bathrooms</dt>
                  <dd>{formData.property_details.bathrooms}</dd>
                </div>
              )}
              {formData.property_details.square_footage && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Area</dt>
                  <dd>{formData.property_details.square_footage} sq ft</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Community</dt>
                <dd>{formData.property_details.community}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Furnished</dt>
                <dd>{formData.property_details.furnished ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>{formData.details.title}</CardTitle>
          <CardDescription>Preview your listing before publishing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images */}
          {renderImages()}

          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-2xl text-primary">
                {formatPrice(formData.details.price)}
                {formData.details.is_negotiable && (
                  <Badge variant="secondary" className="ml-2">
                    Negotiable
                  </Badge>
                )}
              </h3>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="mt-1 whitespace-pre-wrap">{formData.details.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
              <p className="mt-1">{formData.details.address}</p>
              <p className="mt-1">{locationText}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Condition</h4>
              <p className="mt-1 capitalize">{formData.details.condition}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Contact Methods</h4>
              {renderContactMethods()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Specific Details */}
      {renderCategorySpecificDetails()}
    </div>
  )
}