// components/listing/steps/CategoryStep.tsx

"use client"

import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import { CategorySelector } from '../CategorySelector'
import { useEffect, useState } from 'react'
import { getCategories } from '@/actions/category-actions'
import { Category } from '@/types'

export function CategoryStep() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    setValue,
    formState: { errors },
    watch,
  } = useFormContext<ListingFormData>()

  const selectedCategory = watch('category')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleCategorySelect = (category: { main_category: string, sub_category?: string }) => {
    setValue('category', category, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CategorySelector
        categories={categories}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        error={errors.category?.message || errors.category?.main_category?.message}
      />
    </div>
  )
}