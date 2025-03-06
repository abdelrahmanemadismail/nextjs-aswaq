// app/[locale]/sell/details/page.tsx

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { validateStep } from '@/utils/listing-form-validation'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '@/components/ui/label'
import { LocationSelector } from '@/components/listing/sell/steps/LocationSelector'
import LocationPicker from '@/components/listing/sell/LocationPicker'
import { VehicleFields } from '@/components/listing/sell/steps/VehicleFields'
import { PropertyFields } from '@/components/listing/sell/steps/PropertyFields'
import { ListingFormData } from '@/types/listing'

export default function DetailsPage() {
  const { t, getLocalizedPath } = useTranslation()
  const router = useRouter()
  
  const [error, setError] = useState<string | null>(null)
  
  // Get form data from Zustand store
  const { 
    formData, 
    updateFormField, 
    setValidationError, 
    validationErrors 
  } = useListingFormStore()
  
  // Update a specific field in the details object
  const updateDetailsField = <K extends keyof ListingFormData['details']>(
    field: K, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    if (!formData.details) return
    
    updateFormField('details', {
      ...formData.details,
      [field]: value
    })
    
    // Clear validation error for this field
    setValidationError(`details.${field}`, null)
  }
  
  // Handle location selection from the map
  const handleLocationSelect = (location: {
    formatted_address: string
    coordinates: {
      lat: number
      lng: number
    }
  }) => {
    if (!formData.details) return
    
    updateFormField('details', {
      ...formData.details,
      address: location.formatted_address,
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng
    })
    
    // Clear validation errors
    setValidationError('details.address', null)
    setValidationError('details.latitude', null)
    setValidationError('details.longitude', null)
  }
  
  // Handle form navigation
  const handleNext = async () => {
    try {
      // Validate current step
      const validation = await validateStep('details', formData)
      
      if (!validation.valid) {
        // Set validation errors
        if (validation.errors) {
          Object.entries(validation.errors).forEach(([field, message]) => {
            setValidationError(field, message)
          })
        }
        return
      }
      
      // Update the current step in the store
      useListingFormStore.getState().setCurrentStep('details')
      
      // Navigate to package step
      router.push(getLocalizedPath(`/sell/package`))
    } catch (err) {
      console.error('Error navigating to next step:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }
  
  const handleBack = () => {
    router.push(getLocalizedPath('/sell/images'))
  }
  
  // Render category-specific fields based on selected category
  const renderCategorySpecificFields = () => {
    const mainCategory = formData.category?.main_category
    
    switch (mainCategory) {
      case 'vehicles':
        return <VehicleFields />
      case 'properties':
        return <PropertyFields />
      default:
        return null
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.listings.form.addDetails}</CardTitle>
      </CardHeader>
      
      {error && (
        <CardContent className="pt-0 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              {t.listings.form.title}
              {validationErrors['details.title'] && (
                <span className="ml-2 text-destructive text-sm">*</span>
              )}
            </Label>
            <Input
              id="title"
              placeholder={t.listings.form.titlePlaceholder}
              value={formData.details?.title || ''}
              onChange={(e) => updateDetailsField('title', e.target.value)}
              className={validationErrors['details.title'] ? "border-destructive" : ""}
            />
            {validationErrors['details.title'] && (
              <p className="text-sm text-destructive">{validationErrors['details.title']}</p>
            )}
          </div>

          {/* Title Arabic Field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="title_ar" className="flex items-center">
              {t.listings.form.titleArabic}
            </Label>
            <Input
              id="title_ar"
              placeholder={t.listings.form.titleArabicPlaceholder}
              value={formData.details?.title_ar || ''}
              onChange={(e) => updateDetailsField('title_ar', e.target.value)}
              dir="rtl"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              {t.listings.form.description}
              {validationErrors['details.description'] && (
                <span className="ml-2 text-destructive text-sm">*</span>
              )}
            </Label>
            <Textarea
              id="description"
              placeholder={t.listings.form.descriptionPlaceholder}
              className={`min-h-[120px] ${validationErrors['details.description'] ? "border-destructive" : ""}`}
              value={formData.details?.description || ''}
              onChange={(e) => updateDetailsField('description', e.target.value)}
            />
            {validationErrors['details.description'] && (
              <p className="text-sm text-destructive">{validationErrors['details.description']}</p>
            )}
          </div>

          {/* Description Arabic Field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="description_ar" className="flex items-center">
              {t.listings.form.descriptionArabic}
            </Label>
            <Textarea
              id="description_ar"
              placeholder={t.listings.form.descriptionArabicPlaceholder}
              className="min-h-[120px]"
              value={formData.details?.description_ar || ''}
              onChange={(e) => updateDetailsField('description_ar', e.target.value)}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Field */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center">
                {t.listings.form.price}
                {validationErrors['details.price'] && (
                  <span className="ml-2 text-destructive text-sm">*</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  placeholder={t.listings.form.pricePlaceholder}
                  value={formData.details?.price||''}
                  onChange={(e) => updateDetailsField('price', Number(e.target.value))}
                  className={`pl-16 ${validationErrors['details.price'] ? "border-destructive" : ""}`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none border-r bg-muted font-medium text-muted-foreground">
                  AED
                </div>
              </div>
              {validationErrors['details.price'] && (
                <p className="text-sm text-destructive">{validationErrors['details.price']}</p>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center">
                {t.listings.location.location}
                {validationErrors['details.address'] && (
                  <span className="ml-2 text-destructive text-sm">*</span>
                )}
              </Label>
              <div className="space-y-2">
                <Input
                  id="address"
                  placeholder={t.listings.location.locationPlaceholder}
                  value={formData.details?.address || ''}
                  onChange={(e) => updateDetailsField('address', e.target.value)}
                  readOnly
                  className={validationErrors['details.address'] ? "border-destructive" : ""}
                />
                <LocationPicker
                  onSelectLocation={handleLocationSelect}
                  initialLocation={
                    formData.details?.latitude && formData.details?.longitude 
                      ? { lat: formData.details.latitude, lng: formData.details.longitude }
                      : { lat: 23.4241, lng: 53.8478 } // UAE default coordinates
                  }
                />
              </div>
              {validationErrors['details.address'] && (
                <p className="text-sm text-destructive">{validationErrors['details.address']}</p>
              )}
            </div>
          </div>
          
          
          {/* City/Area Field */}
          <div className="space-y-2">
            <Label htmlFor="location_id" className="flex items-center">
              {t.listings.location.cityArea}
              {validationErrors['details.location_id'] && (
                <span className="ml-2 text-destructive text-sm">*</span>
              )}
            </Label>
            <LocationSelector
              onLocationSelect={(location) => {
                updateDetailsField('location_id', location.id)
              }}
              selectedLocationId={formData.details?.location_id}
              error={validationErrors['details.location_id']?.toString()}
            />
          </div>

          {/* Condition Field */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="flex items-center">
              {t.listings.form.condition}
              {validationErrors['details.condition'] && (
                <span className="ml-2 text-destructive text-sm">*</span>
              )}
            </Label>
            <Select
              value={formData.details?.condition || 'new'}
              onValueChange={(value: 'new' | 'used') => updateDetailsField('condition', value)}
            >
              <SelectTrigger 
                id="condition" 
                className={validationErrors['details.condition'] ? "border-destructive" : ""}
              >
                <SelectValue placeholder={t.listings.form.selectCondition} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t.listings.form.conditionNew}</SelectItem>
                <SelectItem value="used">{t.listings.form.conditionUsed}</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors['details.condition'] && (
              <p className="text-sm text-destructive">{validationErrors['details.condition']}</p>
            )}
          </div>

          {/* Negotiable Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_negotiable"
              checked={formData.details?.is_negotiable || false}
              onCheckedChange={(checked) => updateDetailsField('is_negotiable', !!checked)}
            />
            <Label htmlFor="is_negotiable">{t.listings.form.negotiable}</Label>
          </div>

          {/* Contact Methods */}
          <div className="space-y-2">
            <Label htmlFor="contact_methods" className="flex items-center">
              {t.listings.form.contactMethods}
              {validationErrors['details.contact_method'] && (
                <span className="ml-2 text-destructive text-sm">*</span>
              )}
            </Label>
            <div className={`flex flex-wrap gap-4 ${
              validationErrors['details.contact_method'] 
                ? "p-2 border border-destructive rounded-md bg-destructive/10" 
                : ""}`}
            >
              {[
                { value: 'phone', label: t.listings.form.contactPhone },
                { value: 'chat', label: t.listings.form.contactChat },
                { value: 'whatsapp', label: t.listings.form.contactWhatsapp }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={value}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    checked={(formData.details?.contact_method || []).includes(value as any)}
                    onCheckedChange={(checked) => {
                      const currentMethods = formData.details?.contact_method || []
                      if (checked) {
                        updateDetailsField('contact_method', [...currentMethods, value])
                      } else {
                        updateDetailsField(
                          'contact_method', 
                          currentMethods.filter(m => m !== value)
                        )
                      }
                    }}
                  />
                  <Label htmlFor={value}>
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            {validationErrors['details.contact_method'] && (
              <p className="text-sm text-destructive">{validationErrors['details.contact_method']}</p>
            )}
          </div>
        </div>
        
        {/* Category-specific fields */}
        {renderCategorySpecificFields()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {t.common.back}
        </Button>
        
        <Button onClick={handleNext}>
          {t.common.next}
        </Button>
      </CardFooter>
    </Card>
  )
}