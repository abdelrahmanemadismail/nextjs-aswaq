// actions/listing-display-actions.ts
'use server'

import { DisplayListing } from '@/types/listing-display'
import { createClient } from '@/utils/supabase/server'

export async function getListing(slug: string): Promise<DisplayListing> {
    const supabase = await createClient()
    const now = new Date().toISOString()
    
    // Get listing with active package listing
    const { data, error } = await supabase
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
          name_ar,
          slug,
          parent_id
        ),
        location:locations (
          id,
          name,
          name_ar,
          type,
          slug,
          parent:locations (
            id,
            name,
            name_ar,
            slug
          )
        ),
        vehicle_details (*),
        property_details (*),
        package_listings!inner (id)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('status', 'active')
      .gt('package_listings.remaining_days', 0)
      .single()
  
    if (error || !data) {
      throw new Error('Listing not found or has expired')
    }
    
    // Remove package_listings from response
    const { package_listings, ...listing } = data
    
    return listing as DisplayListing
  }

interface GetListingsParams {
  page?: number
  category?: string
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc'
  minPrice?: number
  maxPrice?: number
  country?: string
  city?: string
}

export async function getListings({
  page = 1,
  category,
  search,
  sort = 'date_desc',
  minPrice,
  maxPrice,
  country,
  city,
}: GetListingsParams) {
  const supabase = await createClient()
  const limit = 20
  const start = (page - 1) * limit
  const end = start + limit - 1
  const now = new Date().toISOString()

  // Build query with active package check
  let query = supabase
    .from('listings')
    .select(`
      *,
      user:profiles!user_id (
        id,
        full_name,
        avatar_url
      ),
      category:categories!category_id (
        id,
        name,
        name_ar,
        slug,
        parent_id
      ),
      location:locations (
        id,
        name,
        name_ar,
        type,
        slug,
        parent:locations (
          id,
          name,
          name_ar,
          slug
        )
      ),
      package_listings!inner (id)
    `)
    .eq('is_active', true)
    .eq('status', 'active')
    .gt('package_listings.remaining_days', 0)

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

  // Apply location filters
  if (city) {
    const { data: cityData } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', city)
      .eq('type', 'city')
      .single()

    if (cityData) {
      query = query.eq('location_id', cityData.id)
    }
  } else if (country) {
    const { data: countryData } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', country)
      .eq('type', 'country')
      .single()

    if (countryData) {
      const { data: cityData } = await supabase
        .from('locations')
        .select('id')
        .eq('parent_id', countryData.id)

      const cityIds = cityData?.map(city => city.id) || []
      if (cityIds.length > 0) {
        query = query.in('location_id', cityIds)
      }
    }
  }

  // Enhanced search with support for both languages
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,` +
      `description.ilike.%${search}%,` +
      `title_ar.ilike.%${search}%,` + // Search in Arabic title
      `description_ar.ilike.%${search}%` // Search in Arabic description
    )
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
      // First order by featured, then by created date
      query = query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
  }

  // Apply price filters
  if (minPrice) {
    query = query.gte('price', minPrice)
  }
  
  if (maxPrice) {
    query = query.lte('price', maxPrice)
  }

  // Get count - this is an approximation as we can't easily do a count with inner join
  // We might get a slightly higher count than actual available listings
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('status', 'active')

  // Get paginated results
  const { data: results, error } = await query
    .range(start, end)

  if (error) throw error
  
  // Remove package_listings from each result
  const listings = results.map(item => {
    const { package_listings, ...listing } = item
    return listing
  })

  return {
    listings,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getSimilarListings(categoryId: string, currentListingId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: results } = await supabase
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
        name_ar,
        slug
      ),
      location:locations (
        id,
        name,
        name_ar,
        type,
        slug,
        parent:locations (
          id,
          name,
          name_ar,
          slug
        )
      ),
      package_listings!inner (id)
    `)
    .eq('category_id', categoryId)
    .neq('id', currentListingId)
    .eq('is_active', true)
    .eq('status', 'active')
    .gt('package_listings.remaining_days', 0)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3)

  // Remove package_listings from results
  const listings = results?.map(item => {
    const { package_listings, ...listing } = item
    return listing
  }) || []

  return listings
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient()
  
  await supabase.rpc('increment_listing_views', { listing_id: id })
}