// components/CategorySelector.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Category } from '@/types'
import { getIcon } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { Languages } from '@/constants/enums'

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
        } else {
          // If only a main category is selected, stay in main view
          setCurrentView('main')
        }
      }
    }
  }, [categories, selectedCategory])
  
  // Handle when a main category is clicked
  const handleMainCategoryClick = (category: Category) => {
    if (category.subcategories?.length) {
      // If it has subcategories, change the view without selecting yet
      setViewingCategory(category)
      setCurrentView('sub')
    } else {
      // If no subcategories, select this category directly
      onCategorySelect({ main_category: category.slug })
    }
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
            
            // Display name based on current language
            const categoryName = locale === Languages.ARABIC && category.name_ar 
              ? category.name_ar 
              : category.name
            
            return (
              <Card
                key={category.id}
                className={cn(
                  "p-4 cursor-pointer hover:border-primary transition-colors",
                  "flex items-center gap-3",
                  isSelected && "border-primary"
                )}
                onClick={() => handleMainCategoryClick(category)}
              >
                {Icon && <Icon className="h-8 w-8 text-primary" />}
                <span className="font-medium">{categoryName}</span>
              </Card>
            )
          })}
        </div>
      ) : (
        // Subcategories view
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToMain}
              className="text-primary hover:underline"
            >
              ← {t.common.back}
            </button>
            {viewingCategory && (
              <span className="text-muted-foreground">
                / {locale === Languages.ARABIC && viewingCategory.name_ar 
                    ? viewingCategory.name_ar 
                    : viewingCategory.name}
              </span>
            )}
          </div>

          {viewingCategory?.subcategories?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingCategory.subcategories.map((subCategory) => {
                const isSelected = selectedCategory?.sub_category === subCategory.slug
                // Display name based on current language
                const subCategoryName = locale === Languages.ARABIC && subCategory.name_ar 
                  ? subCategory.name_ar 
                  : subCategory.name
                
                return (
                  <Card
                    key={subCategory.id}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors",
                      isSelected && "border-primary"
                    )}
                    onClick={() => handleSubCategoryClick(subCategory)}
                  >
                    <span className="font-medium">{subCategoryName}</span>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center p-4">
              <p>{"No subcategories found"}</p>
            </div>
          )}
        </div>
      )}
      
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}