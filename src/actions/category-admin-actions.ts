// actions/category-admin-actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { 
  type CategoryResponse, 
  type AdminCategory, 
  type CategoryStats,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryFilters 
} from '@/types/category-admin'
import { categoryFormSchema, categoryUpdateSchema } from '@/schemas/category-admin'
import { revalidatePath } from 'next/cache'

// Get all categories with hierarchical structure
export async function getAdminCategories(
  filters?: CategoryFilters
): Promise<CategoryResponse> {
  const supabase = await createClient()
  
  try {
    // Build query based on filters
    let query = supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    // Apply filters
    if (filters) {
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active')
      }
      if (filters.type === 'main') {
        query = query.is('parent_id', null)
      } else if (filters.type === 'sub') {
        query = query.not('parent_id', 'is', null)
      }
    }

    const { data, error } = await query

    if (error) throw error

    // Organize into hierarchy
    const categories = organizeCategories(data)

    return { data: categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { error: 'Failed to fetch categories' }
  }
}

// Get category statistics
export async function getCategoryStats(): Promise<CategoryStats> {
  const supabase = await createClient()
  
  try {
    const [
      { count: total }, 
      { count: active },
      { count: mainCategories }
    ] = await Promise.all([
      supabase.from('categories').select('*', { count: 'exact' }),
      supabase.from('categories').select('*', { count: 'exact' }).eq('is_active', true),
      supabase.from('categories').select('*', { count: 'exact' }).is('parent_id', null)
    ])

    return {
      total: total || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
      mainCategories: mainCategories || 0,
      subCategories: (total || 0) - (mainCategories || 0)
    }
  } catch (error) {
    console.error('Error fetching category stats:', error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      mainCategories: 0,
      subCategories: 0
    }
  }
}

// Create new category
export async function createCategory(
  input: CreateCategoryInput
): Promise<CategoryResponse> {
  const supabase = await createClient()
  
  try {
    // Validate input
    const validated = categoryFormSchema.parse({
      ...input,
      display_in_header: input.display_in_header ?? false,
      display_in_hero: input.display_in_hero ?? false,
      hero_image: input.hero_image || null,
    })

    // If display_in_hero is true but no hero_image is provided, return error
    if (validated.display_in_hero && !validated.hero_image) {
      return { error: 'Hero image is required when display in hero is enabled' }
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('categories')
      .select('slug')
      .eq('slug', validated.slug)
      .single()

    if (existing) {
      return { error: 'A category with this slug already exists' }
    }

    // Insert category
    const { data, error } = await supabase
      .from('categories')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/categories')
    return { data }
  } catch (error) {
    console.error('Error creating category:', error)
    return { error: 'Failed to create category' }
  }
}

// Update existing category
export async function updateCategory(
  input: UpdateCategoryInput
): Promise<CategoryResponse> {
  const supabase = await createClient()
  
  try {
    // Validate input
    const validated = categoryUpdateSchema.parse({
      ...input,
      display_in_header: input.display_in_header ?? undefined,
      display_in_hero: input.display_in_hero ?? undefined,
      hero_image: input.hero_image ?? undefined,
    })

    // If display_in_hero is true but no hero_image is provided, return error
    if (validated.display_in_hero && !validated.hero_image) {
      return { error: 'Hero image is required when display in hero is enabled' }
    }

    // Check for duplicate slug if slug is being updated
    if (validated.slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('slug')
        .eq('slug', validated.slug)
        .neq('id', validated.id)
        .single()

      if (existing) {
        return { error: 'A category with this slug already exists' }
      }
    }

    // Update category
    const { data, error } = await supabase
      .from('categories')
      .update(validated)
      .eq('id', validated.id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/categories')
    return { data }
  } catch (error) {
    console.error('Error updating category:', error)
    return { error: 'Failed to update category' }
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<CategoryResponse> {
  const supabase = await createClient()
  
  try {
    // Check if category has subcategories
    const { data: subcategories } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id)

    if (subcategories && subcategories.length > 0) {
      return { error: 'Cannot delete category with subcategories' }
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/categories')
    return { data: undefined }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { error: 'Failed to delete category' }
  }
}

// Update category order
export async function updateCategoryOrder(
  orderedIds: string[]
): Promise<CategoryResponse> {
  const supabase = await createClient()
  
  try {
    // Update each category's display_order
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index
    }))

    const { error } = await supabase
      .from('categories')
      .upsert(updates)

    if (error) throw error

    revalidatePath('/admin/categories')
    return { data: undefined }
  } catch (error) {
    console.error('Error updating category order:', error)
    return { error: 'Failed to update category order' }
  }
}

// Helper function to organize categories into hierarchy
function organizeCategories(categories: AdminCategory[]): AdminCategory[] {
  const categoryMap = new Map<string, AdminCategory>()
  const rootCategories: AdminCategory[] = []

  // First pass: Create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, subCategories: [] })
  })

  // Second pass: Organize into hierarchy
  categories.forEach(category => {
    const categoryWithSubs = categoryMap.get(category.id)!
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.subCategories?.push(categoryWithSubs)
      }
    } else {
      rootCategories.push(categoryWithSubs)
    }
  })

  return rootCategories
}