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
import { Loader2 } from "lucide-react"

interface ListingFormContainerProps {
  initialData?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<void>
}

const steps: ListingStep[] = ['category', 'images', 'details', 'review']

export function ListingFormContainer({ initialData, onSubmit }: ListingFormContainerProps) {
  const [currentStep, setCurrentStep] = React.useState<number>(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
        location: '',
        condition: 'new',
        is_negotiable: false,
        contact_method: ['phone'],
      },
    },
    mode: 'onChange',
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { handleSubmit, trigger, formState: { errors } } = methods

  const handleNext = async () => {
    const fields = getFieldsToValidate(currentStep)
    const isValid = await trigger(fields)

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleFormSubmit = async (data: ListingFormData) => {
    const isValid = await trigger()
    if (!isValid) return

    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
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