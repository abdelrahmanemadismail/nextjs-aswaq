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
import { useTranslation } from '@/hooks/use-translation'
import { Label } from '@/components/ui/label'
// import { VehicleDetails } from '@/types/listing'

export function VehicleFields() {
  const { t } = useTranslation()
  const { formData, updateFormField } = useListingFormStore()
  
  const vehicleDetails = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: null,
    color_ar: null,
    version: null,
    mileage: null,
    specs: null,
    specs_ar: null,
    sub_category: 'car' as const,
    payment_terms: 'sale' as const,
    ...formData.vehicle_details
  } as const
  
  // Update a specific field in the vehicle_details object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateVehicleField = (field: string, value: any) => {
    updateFormField('vehicle_details', {
      ...vehicleDetails,
      [field]: value
    })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.listings.vehicles.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">{t.listings.vehicles.brand}</Label>
            <Input
              id="brand"
              placeholder={t.listings.vehicles.brandPlaceholder}
              value={vehicleDetails.brand || ''}
              onChange={(e) => updateVehicleField('brand', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">{t.listings.vehicles.model}</Label>
            <Input
              id="model"
              placeholder={t.listings.vehicles.modelPlaceholder}
              value={vehicleDetails.model || ''}
              onChange={(e) => updateVehicleField('model', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">{t.listings.vehicles.year}</Label>
            <Select
              value={vehicleDetails.year?.toString() || ''}
              onValueChange={(value) => updateVehicleField('year', parseInt(value))}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder={t.listings.vehicles.yearPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">{t.listings.vehicles.mileage}</Label>
            <Input
              id="mileage"
              type="number"
              placeholder={t.listings.vehicles.mileagePlaceholder}
              value={vehicleDetails.mileage || ''}
              onChange={(e) => updateVehicleField('mileage', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">{t.listings.vehicles.color}</Label>
            <Input
              id="color"
              placeholder={t.listings.vehicles.colorPlaceholder}
              value={vehicleDetails.color || ''}
              onChange={(e) => updateVehicleField('color', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">{t.listings.common.paymentTerms}</Label>
            <Select
              value={vehicleDetails.payment_terms || 'sale'}
              onValueChange={(value: 'rent' | 'sale') => updateVehicleField('payment_terms', value)}
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
        </div>
      </CardContent>
    </Card>
  )
}