// actions/category-actions.ts
"use server"

import { createClient } from '@/utils/supabase/server'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  hero_image: string | null
  display_in_hero: boolean
  display_in_header: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  
  subCategories?: Category[]
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  try {
    // First, get all main categories
    const { data: mainCategories, error: mainError } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (mainError) throw mainError
    if (!mainCategories) return []

    // Then get all subcategories
    const { data: subCategories, error: subError } = await supabase
      .from('categories')
      .select('*')
      .not('parent_id', 'is', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (subError) throw subError

    // Organize subcategories under their parent categories
    const categoriesWithSubs = mainCategories.map(mainCat => ({
      ...mainCat,
      subCategories: subCategories
        ?.filter(subCat => subCat.parent_id === mainCat.id)
        .map(subCat => ({
          id: subCat.id,
          name: subCat.name,
          slug: subCat.slug,
          description: subCat.description,
          icon: subCat.icon,
          display_order: subCat.display_order
        })) || []
    }))

    return categoriesWithSubs

  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}