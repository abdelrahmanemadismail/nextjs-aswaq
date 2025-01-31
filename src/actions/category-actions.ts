// actions/category-actions.ts
"use server"

import { createClient } from '@/utils/supabase/server'
import { Category } from '@/types'


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
    console.log(categoriesWithSubs)
    return categoriesWithSubs

  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}