// app/[locale]/sell/images/page.tsx

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
import { ImageUpload } from '@/components/listing/sell/ImageUpload'
import { useTranslation } from '@/hooks/use-translation'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { validateStep } from '@/utils/listing-form-validation'

export default function ImagesPage() {
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
  
  // Handle images change
  const handleImagesChange = (files: File[]) => {
    // Filter out any non-File objects that might have come from localStorage
    const validFiles = files.filter(file => file instanceof File);
    
    updateFormField('images', validFiles);
    // Clear any validation errors
    setValidationError('images', null);
  }
  
  // Handle form navigation
  const handleNext = async () => {
    try {
      // Validate current step
      const validation = await validateStep('images', formData)
      
      if (!validation.valid) {
        // Set validation errors
        if (validation.errors) {
          Object.entries(validation.errors).forEach(([field, message]) => {
            setValidationError(field, message)
          })
        }
        return
      }
      
      // Navigate to details step
      router.push(getLocalizedPath(`/sell/details`))
    } catch (err) {
      console.error('Error navigating to next step:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }
  
  const handleBack = () => {
    // If there's a subcategory, go back to subcategory page
    // Otherwise, go back to main category page
    const hasSubCategory = !!formData.category?.sub_category
    
    if (hasSubCategory) {
      router.push(getLocalizedPath('/sell/category'))
    } else {
      router.push(getLocalizedPath('/sell/category'))
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.listings.form.uploadImages}</CardTitle>
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
      
      <CardContent>
        <ImageUpload
          images={formData.images || []}
          onChange={handleImagesChange}
          maxFiles={30}
          error={validationErrors['images']?.toString()}
        />
        
        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <h3 className="font-medium mb-2">{t.listings.photos.tipsHeading}</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• {t.listings.photos.tipLandscape}</li>
            <li>• {t.listings.photos.tipLighting}</li>
            <li>• {t.listings.photos.tipBackground}</li>
            <li>• {t.listings.photos.tipAppropriate}</li>
            <li>• {t.listings.photos.tipMultipleAngles}</li>
          </ul>
        </div>
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