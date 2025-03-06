// app/[locale]/sell/review/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2, GiftIcon, Clock, Gem } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { validateStep } from '@/utils/listing-form-validation'
import { createListing } from '@/actions/listing-actions'
import { formatPrice } from '@/lib/utils'
import { useLocationStore } from '@/hooks/use-location-store'
import { toast } from '@/hooks/use-toast'
import { Languages } from '@/constants/enums'
import { UserPackage } from '@/types/package'
import { ListingFormData } from '@/types/listing'
import { clearFiles } from '@/services/indexedDB'

export default function ReviewPage() {
  const { t, locale, getLocalizedPath } = useTranslation()
  const router = useRouter()
  
  const [locationText, setLocationText] = useState<string>(t.listings.review.noLocation)
  const [packageInfo, setPackageInfo] = useState<UserPackage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagesLoading, setImagesLoading] = useState(false)
  
  // Get form data from Zustand store
  const { 
    formData, 
    setValidationError,
    setIsSubmitting: setStoreSubmitting,
    resetForm,
    loadImagesFromIndexedDB,
    imagesLoaded
  } = useListingFormStore()
  
  // Get location data from location store
  const { countries, cities } = useLocationStore()
  
  // Validate form data on load
  useEffect(() => {
    const validateFormData = async () => {
      try {
        // Validate the entire form before submission
        const validation = await validateStep('review', formData)
        
        if (!validation.valid) {
          // If validation fails, navigate back to the appropriate step
          // This is a simplified approach - ideally you would determine the right step
          router.push(getLocalizedPath('/sell/category'))
          return
        }
      } catch (err) {
        console.error('Error validating form data:', err)
        setError('An error occurred while validating the form data.')
      }
    }
    
    validateFormData()
  }, [formData, router, getLocalizedPath])
  
  // Load images from IndexedDB on component mount
  useEffect(() => {
    const loadImages = async () => {
      if (!formData.images?.length && !isSubmitting && !imagesLoaded) {
        try {
          setImagesLoading(true)
          await loadImagesFromIndexedDB()
        } catch (error) {
          console.error('Error loading images from IndexedDB:', error)
        } finally {
          setImagesLoading(false)
        }
      }
    }
    
    loadImages()
  }, [formData.images, loadImagesFromIndexedDB, isSubmitting, imagesLoaded])
  
  // Find the selected location whenever location_id changes
  useEffect(() => {
    if (!formData.details?.location_id) return

    // First try to find it in cities
    for (const countryId in cities) {
      const city = cities[countryId].find(city => city.id === formData.details?.location_id)
      if (city) {
        const country = countries.find(c => c.id === countryId)
        const cityName = locale === Languages.ARABIC && city.name_ar ? city.name_ar : city.name
        const countryName = country ? (locale === Languages.ARABIC && country.name_ar ? country.name_ar : country.name) : ''
        setLocationText(`${cityName}, ${countryName}`)
        return
      }
    }

    // If not found in cities, check countries
    const country = countries.find(c => c.id === formData.details?.location_id)
    if (country) {
      setLocationText(locale === Languages.ARABIC && country.name_ar ? country.name_ar : country.name)
    }
  }, [formData.details?.location_id, countries, cities, locale, t.listings.review.noLocation])
  
  // Fetch package information
  useEffect(() => {
    const fetchPackageInfo = async () => {
      if (!formData.package_details?.user_package_id) return

      try {
        // Import dynamically to avoid SSR issues
        const { getUserPackageById } = await import('@/actions/package-actions')
        const result = await getUserPackageById(formData.package_details?.user_package_id)
        
        if (result.package) {
          setPackageInfo(result.package)
        } else if (result.error) {
          console.error('Error fetching package:', result.error)
        }
      } catch (error) {
        console.error('Error fetching package info:', error)
      }
    }

    fetchPackageInfo()
  }, [formData.package_details?.user_package_id])
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setStoreSubmitting(true)
      setError(null)
      
      // Update the current step in the store to review
      useListingFormStore.getState().setCurrentStep('review')
      
      // Validate the entire form before submission
      const validation = await validateStep('review', formData)
      
      if (!validation.valid) {
        // Set validation errors
        if (validation.errors) {
          Object.entries(validation.errors).forEach(([field, message]) => {
            setValidationError(field, message)
          })
        }
        setIsSubmitting(false)
        setStoreSubmitting(false)
        return
      }
      
      // Submit the form - first, ensure the form data is complete
      if (!formData.category || !formData.images || !formData.details || !formData.package_details) {
        throw new Error('Form data is incomplete')
      }
      
      const completeFormData: ListingFormData = {
        category: formData.category,
        images: formData.images,
        details: formData.details,
        package_details: formData.package_details,
        vehicle_details: formData.vehicle_details,
        property_details: formData.property_details
      }
      
      const listingSlug = await createListing(completeFormData)
      
      // Show success toast
      toast({
        title: t.listings.success,
        description: t.listings.listingPublished,
      })
      
      // Clear images from IndexedDB
      await clearFiles()
      
      // Reset form data
      resetForm()
      
      // Navigate to the listing page
      router.push(getLocalizedPath(`/listings/${listingSlug}`))
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(t.listings.failedToCreate)
      setIsSubmitting(false)
      setStoreSubmitting(false)
      
      // Show error toast
      toast({
        title: t.common.error,
        description: t.listings.failedToCreate,
        variant: "destructive",
      })
    }
  }
  
  const handleBack = () => {
    router.push(getLocalizedPath('/sell/package'))
  }
  
  // Render images
  const renderImages = () => {
    if (imagesLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    
    // Make sure images exist and are valid File objects
    const validImages = formData.images?.filter(file => file instanceof File) || []
    
    if (validImages.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No images available</p>
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {validImages.map((file: File, index: number) => {
          let objectUrl = ''
          try {
            objectUrl = URL.createObjectURL(file)
          } catch (err) {
            console.error('Error creating object URL:', err)
            return null
          }
          
          return (
            <div key={index} className="relative aspect-square">
              <Image
                src={objectUrl}
                alt={t.listings.photos.uploadAlt.replace('{index}', (index + 1).toString())}
                fill
                className="object-cover rounded-lg"
                onLoad={() => {
                  // We could revoke URL here, but it's needed while image is displayed
                }}
                onError={() => {
                  // Revoke URL on error
                  if (objectUrl) URL.revokeObjectURL(objectUrl)
                }}
              />
            </div>
          )
        })}
      </div>
    )
  }

  // Render contact methods
  const renderContactMethods = () => (
    <div className="flex gap-2">
      {formData.details?.contact_method.map((method) => (
        <Badge key={method} variant="secondary">
          {method === 'phone' ? t.listings.form.contactPhone : 
           method === 'chat' ? t.listings.form.contactChat : 
           t.listings.form.contactWhatsapp}
        </Badge>
      ))}
    </div>
  )
  
  // Render package details
  const renderPackageDetails = () => {
    if (!packageInfo) return null;

    const packageName = locale === Languages.ARABIC && packageInfo.package?.name_ar 
      ? packageInfo.package.name_ar 
      : packageInfo.package?.name;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            {t.listings.packageSelection?.packageDetails || "Package Details"}
            {formData.package_details?.is_featured && (
              <Badge className="ml-2 bg-amber-500" variant="secondary">
                <Gem className="mr-1 h-3 w-3" />
                {t.userPackages.card.featured}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t.payments.selectPackage}</dt>
              <dd>{packageName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t.listings.packageSelection?.listingType || "Listing Type"}</dt>
              <dd className="flex items-center">
                {formData.package_details?.is_bonus_listing ? (
                  <>
                    <span>{t.listings.packageSelection?.bonusListing || "Bonus Listing"}</span>
                    <GiftIcon className="ml-1 h-3 w-3 text-amber-500" />
                  </>
                ) : (
                  <span>{t.listings.packageSelection?.regularListing || "Regular Listing"}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t.listings.packageSelection?.duration || "Duration"}</dt>
              <dd className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {packageInfo.package?.duration_days} {t.userPackages.card.days}
                  {formData.package_details?.is_bonus_listing && (packageInfo?.package?.bonus_duration_days ?? 0) > 0 && (
                    <> + {packageInfo?.package?.bonus_duration_days} {t.userPackages.card.days}</>
                  )}
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  };
  
  // Render category-specific details
  const renderCategorySpecificDetails = () => {
    if (formData.vehicle_details) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t.listings.vehicles.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.vehicles.brand}</dt>
                <dd>{formData.vehicle_details.brand}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.vehicles.model}</dt>
                <dd>{formData.vehicle_details.model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.vehicles.year}</dt>
                <dd>{formData.vehicle_details.year}</dd>
              </div>
              {formData.vehicle_details.mileage && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.listings.vehicles.mileage}</dt>
                  <dd>{formData.vehicle_details.mileage.toLocaleString()} {t.listings.vehicles.km}</dd>
                </div>
              )}
              {formData.vehicle_details.color && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.listings.vehicles.color}</dt>
                  <dd>
                    {locale === Languages.ARABIC && formData.vehicle_details.color_ar
                      ? formData.vehicle_details.color_ar
                      : formData.vehicle_details.color}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.common.paymentTerms}</dt>
                <dd className="capitalize">
                  {formData.vehicle_details.payment_terms === 'rent' 
                    ? t.listings.common.forRent 
                    : t.listings.common.forSale}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      );
    }

    if (formData.property_details) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t.listings.properties.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.properties.propertyType}</dt>
                <dd className="capitalize">
                  {formData.property_details.property_type === 'apartment' ? t.listings.properties.apartment :
                   formData.property_details.property_type === 'villa' ? t.listings.properties.villa :
                   t.listings.properties.commercial}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.common.paymentTerms}</dt>
                <dd className="capitalize">
                  {formData.property_details.payment_terms === 'rent' 
                    ? t.listings.common.forRent 
                    : t.listings.common.forSale}
                </dd>
              </div>
              {formData.property_details.bedrooms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.listings.properties.bedrooms}</dt>
                  <dd>{formData.property_details.bedrooms}</dd>
                </div>
              )}
              {formData.property_details.bathrooms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.listings.properties.bathrooms}</dt>
                  <dd>{formData.property_details.bathrooms}</dd>
                </div>
              )}
              {formData.property_details.square_footage && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.listings.properties.squareFootage}</dt>
                  <dd>{formData.property_details.square_footage} {t.listings.properties.sqft}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.properties.community}</dt>
                <dd>
                  {locale === Languages.ARABIC && formData.property_details.community_ar
                    ? formData.property_details.community_ar
                    : formData.property_details.community}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.listings.properties.furnished}</dt>
                <dd>{formData.property_details.furnished ? t.common.yes : t.common.no}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      );
    }

    return null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.listings.form.reviewListing}</CardTitle>
        <CardDescription>{t.listings.review.previewDescription}</CardDescription>
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
        {/* Package details */}
        {renderPackageDetails()}
        
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === Languages.ARABIC && formData.details?.title_ar
                ? formData.details.title_ar
                : formData.details?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            {renderImages()}

            {/* Basic Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-2xl text-primary">
                  {formatPrice(Number(formData.details?.price) || 0)}
                  {formData.details?.is_negotiable && (
                    <Badge variant="secondary" className="ml-2">
                      {t.listings.form.negotiable}
                    </Badge>
                  )}
                </h3>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t.listings.form.description}</h4>
                <p className="mt-1 whitespace-pre-wrap">
                  {locale === Languages.ARABIC && formData.details?.description_ar
                    ? formData.details.description_ar
                    : formData.details?.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t.listings.location.location}</h4>
                <p className="mt-1">
                  {locale === Languages.ARABIC && formData.details?.address_ar
                    ? formData.details.address_ar
                    : formData.details?.address}
                </p>
                <p className="mt-1">{locationText}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t.listings.form.condition}</h4>
                <p className="mt-1 capitalize">
                  {formData.details?.condition === 'new' 
                    ? t.listings.form.conditionNew 
                    : t.listings.form.conditionUsed}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t.listings.form.contactMethods}</h4>
                {renderContactMethods()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category-specific details */}
        {renderCategorySpecificDetails()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          {t.common.back}
        </Button>
        
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.listings.form.publishing}
            </>
          ) : (
            t.listings.form.publishListing
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}