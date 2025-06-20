// components/listing/sell/CategorySelector.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Category } from '@/types'
import { getIcon } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { Languages } from '@/constants/enums'
import { ChevronLeft } from 'lucide-react'

interface CategorySelectorProps {
  categories: Category[]
  onCategorySelect: (category: { main_category: string, sub_category?: string }) => void
  selectedCategory?: { main_category: string, sub_category?: string }
  error?: string
}

export function CategorySelector({ 
  categories,
  onCategorySelect, 
  selectedCategory, 
  error 
}: CategorySelectorProps) {
  const { t, locale } = useTranslation()
  
  // Current view state - completely independent from selection
  const [currentView, setCurrentView] = useState<'main' | 'sub'>('main')
  
  // The category whose subcategories we're viewing (if any)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  
  // Effect to initialize the view based on selected category
  useEffect(() => {
    if (selectedCategory?.main_category) {
      const mainCat = categories.find(c => c.slug === selectedCategory.main_category)
      
      if (mainCat) {
        if (selectedCategory.sub_category && mainCat.subcategories?.length) {
          // If a subcategory is selected, we should view that category's subcategories
          setViewingCategory(mainCat)
          setCurrentView('sub')
        } else if (mainCat.subcategories?.length) {
          // If a main category is selected and it has subcategories, show subcategories view
          setViewingCategory(mainCat)
          setCurrentView('sub')
        } else {
          // If only a main category is selected (with no subcategories), stay in main view
          setCurrentView('main')
        }
      }
    }
  }, [categories, selectedCategory])
  
  // Handle when a main category is clicked
  const handleMainCategoryClick = (category: Category) => {
    // Always select the main category
    onCategorySelect({ main_category: category.slug })
    
    if (category.subcategories?.length) {
      // If it has subcategories, change the view to show them
      setViewingCategory(category)
      setCurrentView('sub')
    }
    // If no subcategories, we've already selected the main category
  }
  
  // Handle when a subcategory is clicked
  const handleSubCategoryClick = (subCategory: Category) => {
    if (viewingCategory) {
      onCategorySelect({
        main_category: viewingCategory.slug,
        sub_category: subCategory.slug
      })
    }
  }
  
  // Go back to main categories view
  const handleBackToMain = () => {
    setCurrentView('main')
    setViewingCategory(null)
    
    // Clear subcategory selection if we go back to main view
    if (selectedCategory?.sub_category) {
      onCategorySelect({ main_category: selectedCategory.main_category })
    }
  }
  
  // Helper to get localized category name
  const getLocalizedName = (category: Category) => {
    return locale === Languages.ARABIC && category.name_ar 
      ? category.name_ar 
      : category.name
  }
  
  return (
    <div className="space-y-4">
      {currentView === 'main' ? (
        // Main categories view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon)
            const isSelected = selectedCategory?.main_category === category.slug &&
                              (!selectedCategory.sub_category || !category.subcategories?.length)
            
            return (
              <Card
                key={category.id}
                className={cn(
                  "p-4 cursor-pointer hover:border-primary2 transition-colors",
                  "flex items-center gap-3",
                  isSelected && "border-primary2 bg-primary2/5"
                )}
                onClick={() => handleMainCategoryClick(category)}
              >
                {Icon && <Icon className="h-8 w-8 text-primary2" />}
                <span className="font-medium">{getLocalizedName(category)}</span>
              </Card>
            )
          })}
        </div>
      ) : (
        // Subcategories view
        <div className="space-y-4">
          <button
            onClick={handleBackToMain}
            className="flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>{t.listings.form.backToCategories}</span>
          </button>
          
          {viewingCategory && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">
                {getLocalizedName(viewingCategory)}
              </h3>
              
              {viewingCategory.subcategories?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingCategory.subcategories.map((subCategory) => {
                    const isSelected = selectedCategory?.sub_category === subCategory.slug
                    
                    return (
                      <Card
                        key={subCategory.id}
                        className={cn(
                          "p-4 cursor-pointer hover:border-primary2 transition-colors",
                          isSelected && "border-primary2 bg-primary2/5"
                        )}
                        onClick={() => handleSubCategoryClick(subCategory)}
                      >
                        <span className="font-medium">{getLocalizedName(subCategory)}</span>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No subcategories found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}