// components/CategorySelector.tsx
"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Category } from '@/actions/category-actions'
import { getIcon } from '@/lib/utils'

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
  const [mainCategory, setMainCategory] = React.useState<Category | undefined>(
    selectedCategory ? categories.find(c => c.slug === selectedCategory.main_category) : undefined
  )

  const handleMainCategorySelect = (category: Category) => {
    if (!category.subCategories?.length) {
      onCategorySelect({ main_category: category.slug })
      setMainCategory(category)
      return
    }
    setMainCategory(category)
  }

  const handleSubCategorySelect = (subCategory: Category) => {
    if (mainCategory) {
      onCategorySelect({
        main_category: mainCategory.slug,
        sub_category: subCategory.slug
      })
    }
  }

  return (
    <div className="space-y-4">
      {!mainCategory || !mainCategory.subCategories?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon)
            const isSelected = selectedCategory?.main_category === category.slug
            return (
              <Card
                key={category.id}
                className={cn(
                  "p-4 cursor-pointer hover:border-primary transition-colors",
                  "flex items-center gap-3",
                  isSelected && "border-primary"
                )}
                onClick={() => handleMainCategorySelect(category)}
              >
                {Icon && <Icon className="h-8 w-8 text-primary" />}
                <span className="font-medium">{category.name}</span>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainCategory(undefined)}
              className="text-primary hover:underline"
            >
              ← Back to categories
            </button>
            <span className="text-muted-foreground">
              / {mainCategory.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCategory.subCategories.map((subCategory) => (
              <Card
                key={subCategory.id}
                className={cn(
                  "p-4 cursor-pointer hover:border-primary transition-colors",
                  selectedCategory?.sub_category === subCategory.slug && "border-primary"
                )}
                onClick={() => handleSubCategorySelect(subCategory)}
              >
                <span className="font-medium">{subCategory.name}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}