// actions/listing-display-actions.ts
'use server'

import { DisplayListing } from '@/types/listing-display'
import { createClient } from '@/utils/supabase/server'

export async function getListing(slug: string): Promise<DisplayListing> {
    const supabase = await createClient()
    
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:profiles!user_id (
          id,
          full_name,
          avatar_url,
          verification_status,
          join_date
        ),
        category:categories!category_id (
          id,
          name,
          slug,
          parent_id
        ),
        vehicle_details (*),
        property_details (*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
  
    if (error || !listing) {
      throw new Error('Listing not found')
    }
  
    return listing as DisplayListing
  }

  interface GetListingsParams {
    page?: number
    category?: string
    search?: string
    sort?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc'
    minPrice?: number
    maxPrice?: number
  }
  
  export async function getListings({
    page = 1,
    category,
    search,
    sort = 'date_desc',
    minPrice,
    maxPrice
  }: GetListingsParams) {
    const supabase = await createClient()
    const limit = 20
    const start = (page - 1) * limit
    const end = start + limit - 1
  
    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:profiles!user_id (
          full_name,
          avatar_url
        ),
        category:categories!category_id (
          id,
          name,
          slug,
          parent_id
        )
      `)
      .eq('is_active', true)
  
    // Apply filters
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', categoryData.id)

        const categoryIds = [categoryData.id, ...(subcategories?.map(c => c.id) || [])]
        query = query.in('category_id', categoryIds)
      }
    }
  
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
  
    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'date_asc':
        query = query.order('created_at', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }
  
    // Apply price filters
    if (minPrice) {
      query = query.gte('price', minPrice)
    }
    
    if (maxPrice) {
      query = query.lte('price', maxPrice)
    }
  
    // Get total count
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
  
    // Get paginated results
    const { data: listings, error } = await query
      .range(start, end)
  
    if (error) throw error
  
    return {
      listings,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

export async function getSimilarListings(categoryId: string, currentListingId: string) {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      *,
      user:profiles!user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('category_id', categoryId)
    .neq('id', currentListingId)
    .eq('is_active', true)
    .limit(3)

  return listings || []
}

export async function incrementViewCount(id: string) {
    const supabase = await createClient()
    
    await supabase.rpc('increment_listing_views', { listing_id: id })
}