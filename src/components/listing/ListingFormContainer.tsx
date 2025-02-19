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
import { ReviewStep } from './steps/ReviewStep'
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ListingFormContainerProps {
  initialData?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<void>
}

const steps: ListingStep[] = ['category', 'images', 'details', 'review']

export function ListingFormContainer({ initialData, onSubmit }: ListingFormContainerProps) {
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
        description: '',
        price: 0,
        address: '',
        location_id: '',
        condition: 'new',
        is_negotiable: false,
        contact_method: ['phone'],
      },
    },
    mode: 'onChange',
  })

  const { handleSubmit, trigger, formState: { errors, isSubmitted } } = methods

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
      let errorMessage = "Please fix the errors before proceeding"
      
      if (errorStep === 'category' && errors.category) {
        errorMessage = "Please select a category before proceeding"
        console.log('Category error:', errors.category);
      } else if (errorStep === 'images' && errors.images) {
        errorMessage = "Please upload at least one image before proceeding"
        console.log('Images error:', errors.images);
      } else if (errorStep === 'details' && errors.details) {
        // We'll display specific field errors in the component itself
        errorMessage = "Please complete all required fields"
        console.log('Details errors:', errors.details);
      }
      
      // Set validation error message
      setValidationError(errorMessage)
      
      // Scroll to the top of the form to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setValidationError(null)
  }

  const handleFormSubmit = async (data: ListingFormData) => {
    const isValid = await trigger()
    if (!isValid) {
      setValidationError("Please fix the errors before submitting")
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      setIsSubmitting(true)
      setValidationError(null)
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
      setValidationError("An error occurred while submitting the form")
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
      case 'review':
        return <ReviewStep />
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              {currentStep === 0 && 'Choose a Category'}
              {currentStep === 1 && 'Upload Images'}
              {currentStep === 2 && 'Add Details'}
              {currentStep === 3 && 'Review Your Listing'}
            </CardTitle>
          </CardHeader>

          {validationError && (
            <div className="px-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
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
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
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
                      Publishing...
                    </>
                  ) : (
                    'Publish Listing'
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  )
}