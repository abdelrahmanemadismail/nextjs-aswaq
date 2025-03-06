"use client"

import React from 'react'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/use-translation'
// import { PropertyDetails } from '@/types/listing'

export function PropertyFields() {
  const { t } = useTranslation()
  const { formData, updateFormField } = useListingFormStore()
  
  const propertyDetails = {
    property_type: 'apartment' as const,
    payment_terms: 'sale' as const,
    bedrooms: null,
    bathrooms: null,
    square_footage: null,
    community: '',
    community_ar: null,
    furnished: false,
    ...formData.property_details
  } as const
  
  // Update a specific field in the property_details object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePropertyField = (field: string, value: any) => {
    updateFormField('property_details', {
      ...propertyDetails,
      [field]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.listings.properties.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property_type">{t.listings.properties.propertyType}</Label>
            <Select
              value={propertyDetails.property_type || ''}
              onValueChange={(value: 'apartment' | 'villa' | 'commercial') => {
                updatePropertyField('property_type', value)
              }}
            >
              <SelectTrigger id="property_type">
                <SelectValue placeholder={t.listings.properties.selectPropertyType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">{t.listings.properties.apartment}</SelectItem>
                <SelectItem value="villa">{t.listings.properties.villa}</SelectItem>
                <SelectItem value="commercial">{t.listings.properties.commercial}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">{t.listings.common.paymentTerms}</Label>
            <Select
              value={propertyDetails.payment_terms || 'sale'}
              onValueChange={(value: 'rent' | 'sale') => {
                updatePropertyField('payment_terms', value)
              }}
            >
              <SelectTrigger id="payment_terms">
                <SelectValue placeholder={t.listings.common.selectPaymentTerms} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">{t.listings.common.forSale}</SelectItem>
                <SelectItem value="rent">{t.listings.common.forRent}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">{t.listings.properties.bedrooms}</Label>
            <Input
              id="bedrooms"
              type="number"
              placeholder={t.listings.properties.bedroomsPlaceholder}
              value={propertyDetails.bedrooms || ''}
              onChange={(e) => updatePropertyField('bedrooms', parseInt(e.target.value) || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms">{t.listings.properties.bathrooms}</Label>
            <Input
              id="bathrooms"
              type="number"
              placeholder={t.listings.properties.bathroomsPlaceholder}
              value={propertyDetails.bathrooms || ''}
              onChange={(e) => updatePropertyField('bathrooms', parseInt(e.target.value) || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="square_footage">{t.listings.properties.squareFootage}</Label>
            <Input
              id="square_footage"
              type="number"
              placeholder={t.listings.properties.squareFootagePlaceholder}
              value={propertyDetails.square_footage || ''}
              onChange={(e) => updatePropertyField('square_footage', parseInt(e.target.value) || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">{t.listings.properties.community}</Label>
            <Input
              id="community"
              placeholder={t.listings.properties.communityPlaceholder}
              value={propertyDetails.community || ''}
              onChange={(e) => updatePropertyField('community', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="furnished">{t.listings.properties.furnished}</Label>
            <Switch
              id="furnished"
              checked={propertyDetails.furnished || false}
              onCheckedChange={(checked) => {
                updatePropertyField('furnished', checked)
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}