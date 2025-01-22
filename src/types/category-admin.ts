// types/category-admin.ts

import { type Database } from './database.types'

// Base type from database
type DbCategory = Database['public']['Tables']['categories']['Row']

// Category for display/manipulation in admin interface
export interface AdminCategory extends Omit<DbCategory, 'created_at' | 'updated_at'> {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  subCategories?: AdminCategory[]
  created_at: string
  display_in_header: boolean
  display_in_hero: boolean
  hero_image: string | null
}

// Input type for creating a new category
export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  parent_id?: string | null
  display_order?: number
  is_active?: boolean
  display_in_header?: boolean
  display_in_hero?: boolean
  hero_image?: string | null
}

// Input type for updating a category
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

// Response type for category operations
export type CategoryResponse = {
  data?: AdminCategory | AdminCategory[] | undefined
  error?: string
}

// Type for category table row actions
export type CategoryAction = 'edit' | 'delete' | 'toggle-status'

// Stats interface for category overview
export interface CategoryStats {
  total: number
  active: number
  inactive: number
  mainCategories: number
  subCategories: number
}

// Sort options for category table
export interface CategorySort {
  field: 'name' | 'display_order' | 'created_at'
  direction: 'asc' | 'desc'
}

// Filter options for category table
export interface CategoryFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  type?: 'all' | 'main' | 'sub'
}