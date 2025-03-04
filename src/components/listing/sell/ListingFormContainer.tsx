// components/listing/ListingFormContainer.tsx

"use client"

import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ListingFormData, ListingStep } from '@/types/listing'
import { listingFormSchema } from '@/schemas/listing'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CategoryStep } from './steps/CategoryStep'
import { ImageStep } from './steps/ImageStep'
import { DetailsStep } from './steps/DetailsStep'
import { PackageSelectionStep } from './steps/PackageSelectionStep'
import { ReviewStep } from './steps/ReviewStep'
import { Loader2, AlertCircle } from "lucide-react"
import { useTranslation } from '@/hooks/use-translation'
import { Languages } from '@/constants/enums'
import { useRouter } from 'next/navigation'

interface ListingFormContainerProps {
  initialData?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<void>
}

// Updated steps array to include package selection
const steps: ListingStep[] = ['category', 'images', 'details', 'package', 'review']

export function ListingFormContainer({ initialData, onSubmit }: ListingFormContainerProps) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const isArabic = locale === Languages.ARABIC
  const [currentStep, setCurrentStep] = React.useState<number>(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: initialData || {
      category: {
        main_category: '',
      },
      images: [],
      details: {
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        price: 0,
        address: '',
        address_ar: '',
        latitude: null,
        longitude: null,
        location_id: '',
        condition: 'new',
        is_negotiable: false,
        contact_method: ['phone'],
      },
      package_details: {
        user_package_id: '',
        is_bonus_listing: false,
        is_featured: false,
      }
    },
    mode: 'onChange',
  })

  const { handleSubmit, trigger, formState: { errors } } = methods

  const handleNext = async () => {
    const fields = getFieldsToValidate(currentStep)
    const isValid = await trigger(fields, { shouldFocus: true })
    
    // Debug: Log the validation state and errors
    console.log('Current Step:', currentStep);
    console.log('Fields to validate:', fields);
    console.log('Is valid:', isValid);
    console.log('Current errors:', errors);

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
      setValidationError(null)
    } else {
      // Find the first error 
      const errorStep = steps[currentStep]
      let errorMessage = t.listings.form.fixErrorsBeforeProceeding
      
      if (errorStep === 'category' && errors.category) {
        errorMessage = t.listings.form.selectCategoryError
        console.log('Category error:', errors.category);
      } else if (errorStep === 'images' && errors.images) {
        errorMessage = t.listings.form.uploadImageError
        console.log('Images error:', errors.images);
      } else if (errorStep === 'details' && errors.details) {
        // We'll display specific field errors in the component itself
        errorMessage = t.listings.form.completeRequiredFields
        console.log('Details errors:', errors.details);
      } else if (errorStep === 'package' && errors.package_details) {
        errorMessage = t.listings.packageSelection?.selectPackageError || 'Please select a valid package'
        console.log('Package errors:', errors.package_details);
      }
      
      // Set validation error message
      setValidationError(errorMessage)
      
      // Scroll to the top of the form to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    // If we're at the first step, navigate back to the previous page
    if (currentStep === 0) {
      router.back()
      return
    }
    
    // Otherwise, go to the previous step
    setCurrentStep((prev) => prev - 1)
    setValidationError(null)
  }

  const handleFormSubmit = async (data: ListingFormData) => {
    const isValid = await trigger()
    if (!isValid) {
      setValidationError(t.listings.form.fixErrorsBeforeSubmitting)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      setIsSubmitting(true)
      setValidationError(null)
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
      setValidationError(t.listings.form.errorSubmitting)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldsToValidate = (step: number): (keyof ListingFormData)[] => {
    switch (steps[step]) {
      case 'category':
        return ['category']
      case 'images':
        return ['images']
      case 'details':
        return ['details']
      case 'package':
        return ['package_details']
      default:
        return []
    }
  }

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'category':
        return <CategoryStep />
      case 'images':
        return <ImageStep />
      case 'details':
        return <DetailsStep />
      case 'package':
        return <PackageSelectionStep />
      case 'review':
        return <ReviewStep />
      default:
        return null
    }
  }

  // Get step title
  const getStepTitle = () => {
    switch (steps[currentStep]) {
      case 'category':
        return t.listings.form.chooseCategory
      case 'images':
        return t.listings.form.uploadImages
      case 'details':
        return t.listings.form.addDetails
      case 'package':
        return t.listings.packageSelection?.title || "Select Package"
      case 'review':
        return t.listings.form.reviewListing
      default:
        return ""
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} dir={isArabic ? 'rtl' : 'ltr'} className={isArabic ? 'font-arabic' : ''}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
          </CardHeader>

          {validationError && (
            <div className="px-6">
              <div className={`bg-red-50 border-${isArabic ? 'r' : 'l'}-4 border-red-500 p-4 mb-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className={`${isArabic ? 'mr-3' : 'ml-3'}`}>
                    <p className="text-sm text-red-700">
                      {validationError}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CardContent>
            {renderStep()}
          </CardContent>

          <CardFooter className="flex justify-between">
            {isArabic ? (
              <>
                <div className="flex gap-2">
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      {t.common.next}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubmit(handleFormSubmit)()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          {t.listings.form.publishing}
                        </>
                      ) : (
                        t.listings.form.publishListing
                      )}
                    </Button>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  {t.common.back}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  {t.common.back}
                </Button>

                <div className="flex gap-2">
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      {t.common.next}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubmit(handleFormSubmit)()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.listings.form.publishing}
                        </>
                      ) : (
                        t.listings.form.publishListing
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  )
}