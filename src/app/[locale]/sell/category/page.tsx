// app/[locale]/sell/category/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
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
import { AlertCircle, Loader2 } from 'lucide-react'
import { CategorySelector } from '@/components/listing/sell/CategorySelector'
import { useTranslation } from '@/hooks/use-translation'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { getCategories } from '@/actions/category-actions'
import { Category } from '@/types'
// import { validateStep } from '@/utils/listing-form-validation'

export default function CategoryPage() {
  const { t, getLocalizedPath } = useTranslation()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get form data from Zustand store
  const { 
    formData, 
    updateFormField, 
    setValidationError, 
    validationErrors,
    setCurrentStep
  } = useListingFormStore()
  
  // Load categories when the component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('Failed to load categories. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCategories()
  }, [])
  
  // Handle category selection
  const handleCategorySelect = (category: { main_category: string, sub_category?: string }) => {
    updateFormField('category', category)
    // Clear any validation errors
    setValidationError('category', null)
  }
  
  // Validate the category selection
  const validateCategory = async () => {
    // First check if a main category is selected
    if (!formData.category?.main_category) {
      setValidationError('category', 'Please select a category')
      return false
    }
    
    // Find the selected category
    const selectedMainCategory = categories.find(
      c => c.slug === formData.category?.main_category
    )
    
    if (!selectedMainCategory) {
      setValidationError('category', 'Invalid category selected')
      return false
    }
    
    // If the category has subcategories, check if one is selected
    if (selectedMainCategory.subcategories?.length) {
      if (!formData.category.sub_category) {
        setValidationError('category', 'Please select a subcategory')
        return false
      }
      
      // Verify the subcategory exists
      const subcategoryExists = selectedMainCategory.subcategories.some(
        sub => sub.slug === formData.category?.sub_category
      )
      
      if (!subcategoryExists) {
        setValidationError('category', 'Invalid subcategory selected')
        return false
      }
    }
    
    return true
  }
  
  // Handle form navigation
  const handleNext = async () => {
    try {
      // Custom validation for category/subcategory
      const isValid = await validateCategory()
      if (!isValid) return
      
      // No errors, proceed to next step
      setCurrentStep('images')
      router.push(getLocalizedPath(`/sell/images`))
    } catch (err) {
      console.error('Error navigating to next step:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.listings.form.chooseCategory}</CardTitle>
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
        <CategorySelector
          categories={categories}
          onCategorySelect={handleCategorySelect}
          selectedCategory={formData.category}
          error={validationErrors['category']?.toString()}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push(getLocalizedPath('/'))}
        >
          {t.common.cancel}
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={isLoading}
        >
          {t.common.next}
        </Button>
      </CardFooter>
    </Card>
  )
}