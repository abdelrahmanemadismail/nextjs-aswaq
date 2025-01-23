// actions/listing-admin-actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'
import { z } from 'zod'
import { 
  type AdminListing, 
  type ListingStats, 
  type ListingFilters,
  type ListingSort,
  type ListingResponse 
} from '@/types/listing-admin'
import { revalidatePath } from 'next/cache'
import { updateListingSchema } from '@/schemas/listing-admin'

// Get listings with pagination and filters
export async function getAdminListings(
  page = 1,
  limit = 10,
  filters?: ListingFilters,
  sort?: ListingSort
): Promise<ListingResponse> {
  noStore()
  const supabase = await createClient()
  
  try {
    const start = (page - 1) * limit
    const end = start + limit - 1

    // Build base query
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:profiles!user_id (
          full_name,
          avatar_url
        ),
        category:categories!category_id (
          name,
          slug
        ),
        vehicle_details (*),
        property_details (*)
      `)

    // Apply filters
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'featured') {
          query = query.eq('is_featured', true)
        } else if (filters.status === 'active') {
          query = query.eq('is_active', true)
        } else if (filters.status === 'inactive') {
          query = query.eq('is_active', false)
        }
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
          query = query.gte('price', filters.priceRange.min)
        }
        if (filters.priceRange.max !== undefined) {
          query = query.lte('price', filters.priceRange.max)
        }
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString())
      }

      if (filters.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })

    // Get paginated results
    const { data, error } = await query.range(start, end)

    if (error) throw error

    return {
      data: data as AdminListing[],
      count: count ?? undefined,
    }
  } catch (error) {
    console.error('Error fetching listings:', error)
    return { error: 'Failed to fetch listings' }
  }
}

// Get listing statistics
export async function getListingStats(): Promise<ListingStats> {
  noStore()
  const supabase = await createClient()
  
  try {
    const [
      { count: total },
      { count: active },
      { count: featured },
      { count: reported }
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase.from('listings').select('*', { count: 'exact', head: true })
        .eq('is_featured', true),
      supabase.from('listings').select('*', { count: 'exact', head: true })
        .eq('status', 'reported')
    ])

    // Get today's listings
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    return {
      total: total ?? 0,
      active: active ?? 0,
      inactive: (total ?? 0) - (active ?? 0),
      featured: featured ?? 0,
      reported: reported ?? 0,
      today: todayCount ?? 0,
    }
  } catch (error) {
    console.error('Error fetching listing stats:', error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      featured: 0,
      reported: 0,
      today: 0,
    }
  }
}

// Update listing
export async function updateListing(
  id: string,
  data: z.infer<typeof updateListingSchema>
): Promise<ListingResponse> {
  const supabase = await createClient()
  
  try {
    const validated = updateListingSchema.parse(data)

    const { data: listing, error } = await supabase
      .from('listings')
      .update(validated)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/listings')
    return { data: listing as AdminListing }
  } catch (error) {
    console.error('Error updating listing:', error)
    return { error: 'Failed to update listing' }
  }
}

// Delete listing
export async function deleteListing(id: string): Promise<ListingResponse> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/listings')
    return { data: undefined }
  } catch (error) {
    console.error('Error deleting listing:', error)
    return { error: 'Failed to delete listing' }
  }
}

// Toggle listing feature status
export async function toggleListingFeature(id: string): Promise<ListingResponse> {
  const supabase = await createClient()
  
  try {
    // First get current feature status
    const { data: listing } = await supabase
      .from('listings')
      .select('is_featured')
      .eq('id', id)
      .single()

    if (!listing) throw new Error('Listing not found')

    // Toggle status
    const { data: updated, error } = await supabase
      .from('listings')
      .update({ is_featured: !listing.is_featured })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/listings')
    return { data: updated as AdminListing }
  } catch (error) {
    console.error('Error toggling listing feature:', error)
    return { error: 'Failed to toggle listing feature' }
  }
}

// Toggle listing active status
export async function toggleListingActive(id: string): Promise<ListingResponse> {
  const supabase = await createClient()
  
  try {
    // First get current active status
    const { data: listing } = await supabase
      .from('listings')
      .select('is_active')
      .eq('id', id)
      .single()

    if (!listing) throw new Error('Listing not found')

    // Toggle status
    const { data: updated, error } = await supabase
      .from('listings')
      .update({ is_active: !listing.is_active })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    revalidatePath('/admin/listings')
    return { data: updated as AdminListing }
  } catch (error) {
    console.error('Error toggling listing active:', error)
    return { error: 'Failed to toggle listing active' }
  }
}
