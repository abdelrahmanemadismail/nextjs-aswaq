// lib/category-validation.ts

import { AdminCategory } from "@/types/category-admin"
import { findCategoryById } from "./category-utils"

export const CATEGORY_CONSTRAINTS = {
  MAX_DEPTH: 3,
  MAX_CHILDREN: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
}

export function validateCategoryMove(
  categories: AdminCategory[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): { valid: boolean; error?: string } {
  const source = findCategoryById(categories, sourceId)
  const target = findCategoryById(categories, targetId)

  if (!source || !target) {
    return { valid: false, error: 'Invalid category' }
  }

  // Check for circular reference
  if (position === 'inside') {
    let current = target
    while (current.parent_id) {
      if (current.parent_id === source.id) {
        return {
          valid: false,
          error: 'Cannot move a category inside its own descendant'
        }
      }
      current = findCategoryById(categories, current.parent_id)!
    }
  }

  // Check depth limit
  if (position === 'inside') {
    const targetDepth = getDepth(categories, targetId)
    if (targetDepth >= CATEGORY_CONSTRAINTS.MAX_DEPTH) {
      return {
        valid: false,
        error: `Maximum category depth of ${CATEGORY_CONSTRAINTS.MAX_DEPTH} exceeded`
      }
    }
  }

  // Check children limit
  if (position === 'inside' && target.subCategories) {
    if (target.subCategories.length >= CATEGORY_CONSTRAINTS.MAX_CHILDREN) {
      return {
        valid: false,
        error: `Maximum number of subcategories (${CATEGORY_CONSTRAINTS.MAX_CHILDREN}) exceeded`
      }
    }
  }

  return { valid: true }
}

function getDepth(categories: AdminCategory[], categoryId: string): number {
  let depth = 0
  let current = findCategoryById(categories, categoryId)
  
  while (current?.parent_id) {
    depth++
    current = findCategoryById(categories, current.parent_id)
  }
  
  return depth
}

export function validateCategoryData(data: Partial<AdminCategory>): { 
  valid: boolean;
  error?: string 
} {
  if (data.name) {
    if (data.name.length < CATEGORY_CONSTRAINTS.NAME_MIN_LENGTH) {
      return {
        valid: false,
        error: `Name must be at least ${CATEGORY_CONSTRAINTS.NAME_MIN_LENGTH} characters`
      }
    }
    if (data.name.length > CATEGORY_CONSTRAINTS.NAME_MAX_LENGTH) {
      return {
        valid: false,
        error: `Name cannot exceed ${CATEGORY_CONSTRAINTS.NAME_MAX_LENGTH} characters`
      }
    }
  }

  if (data.description) {
    if (data.description.length > CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
      return {
        valid: false,
        error: `Description cannot exceed ${CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`
      }
    }
  }

  return { valid: true }
}