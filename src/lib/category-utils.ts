// lib/category-utils.ts

import { AdminCategory } from "@/types/category-admin"

// Generate slug from string
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
}

// Flatten category tree into array
export function flattenCategories(
  categories: AdminCategory[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parentId: string | null = null,
  level = 0
): AdminCategory[] {
  return categories.reduce((acc: AdminCategory[], category) => {
    const flatCategory = { ...category, level }
    return [
      ...acc,
      flatCategory,
      ...(category.subCategories 
        ? flattenCategories(category.subCategories, category.id, level + 1) 
        : []
      ),
    ]
  }, [])
}

// Build category path string
export function getCategoryPath(
  categories: AdminCategory[],
  categoryId: string
): string {
  const paths: string[] = []
  let currentId = categoryId

  while (currentId) {
    const category = findCategoryById(categories, currentId)
    if (!category) break

    paths.unshift(category.name)
    currentId = category.parent_id || ''
  }

  return paths.join(' > ')
}

// Find category by ID in tree
export function findCategoryById(
  categories: AdminCategory[],
  id: string
): AdminCategory | null {
  for (const category of categories) {
    if (category.id === id) return category
    if (category.subCategories) {
      const found = findCategoryById(category.subCategories, id)
      if (found) return found
    }
  }
  return null
}

// Validate category hierarchy
export function validateCategoryHierarchy(
  categories: AdminCategory[],
  categoryId: string,
  parentId: string
): boolean {
  // Check if the parent is not a descendant of the category
  const isDescendant = (parent: string, child: string): boolean => {
    const category = findCategoryById(categories, child)
    if (!category) return false
    if (category.id === parent) return true
    return category.subCategories
      ? category.subCategories.some(sub => isDescendant(parent, sub.id))
      : false
  }

  return !isDescendant(categoryId, parentId)
}

// Sort categories by criteria
export function sortCategories(
  categories: AdminCategory[],
  sortBy: 'name' | 'display_order' | 'created_at',
  direction: 'asc' | 'desc' = 'asc'
): AdminCategory[] {
  const sorted = [...categories].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'display_order':
        comparison = a.display_order - b.display_order
        break
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }
    return direction === 'asc' ? comparison : -comparison
  })

  // Recursively sort subcategories
  return sorted.map(category => ({
    ...category,
    subCategories: category.subCategories 
      ? sortCategories(category.subCategories, sortBy, direction)
      : undefined
  }))
}

// Get available positions for a category
export function getAvailablePositions(
  categories: AdminCategory[],
  parentId: string | null = null
): number[] {
  const siblings = categories.filter(c => c.parent_id === parentId)
  const maxOrder = Math.max(...siblings.map(c => c.display_order), -1)
  return Array.from({ length: maxOrder + 2 }, (_, i) => i)
}

// Check if category has subcategories
export function hasSubcategories(category: AdminCategory): boolean {
  return Boolean(category.subCategories?.length)
}

// Get category depth in tree
export function getCategoryDepth(
  categories: AdminCategory[],
  categoryId: string,
  depth = 0
): number {
  const category = findCategoryById(categories, categoryId)
  if (!category) return depth
  return category.parent_id 
    ? getCategoryDepth(categories, category.parent_id, depth + 1)
    : depth
}

// Get root ancestor of a category
export function getRootAncestor(
  categories: AdminCategory[],
  categoryId: string
): AdminCategory | null {
  const category = findCategoryById(categories, categoryId)
  if (!category) return null
  return category.parent_id 
    ? getRootAncestor(categories, category.parent_id)
    : category
}

// Rearrange categories maintaining hierarchy
export function rearrangeCategories(
  categories: AdminCategory[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): AdminCategory[] {
  const source = findCategoryById(categories, sourceId)
  const target = findCategoryById(categories, targetId)
  
  if (!source || !target) return categories
  
  // Validate move
  if (position === 'inside' && hasSubcategories(source)) {
    throw new Error("Cannot move a category with subcategories as a child")
  }
  
  // Clone categories to avoid mutations
  const newCategories = JSON.parse(JSON.stringify(categories))
  
  // Remove source from current position
  const removeCategory = (cats: AdminCategory[], id: string) => {
    return cats.filter(c => {
      if (c.subCategories) {
        c.subCategories = removeCategory(c.subCategories, id)
      }
      return c.id !== id
    })
  }
  
  const withoutSource = removeCategory(newCategories, sourceId)
  
  // Add source to new position
  const addCategory = (cats: AdminCategory[], categoryToAdd: AdminCategory) => {
    return cats.map(c => {
      if (c.id === targetId) {
        if (position === 'inside') {
          c.subCategories = [...(c.subCategories || []), categoryToAdd]
        } else {
          const index = cats.findIndex(cat => cat.id === targetId)
          cats.splice(
            position === 'before' ? index : index + 1,
            0,
            categoryToAdd
          )
        }
      }
      if (c.subCategories) {
        c.subCategories = addCategory(c.subCategories, categoryToAdd)
      }
      return c
    })
  }
  
  return addCategory(withoutSource, source)
}