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
import { 
  // updateListingSchema, 
  // updateVehicleDetailsSchema,
  // updatePropertyDetailsSchema,
  fullUpdateListingSchema
} from '@/schemas/listing-admin'

// Get listings with pagination and filters
export async function getAdminListings(
  page = 1,
  limit = 10,
  filters?: ListingFilters,
  sort?: ListingSort,
  locale: string = 'en'
): Promise<ListingResponse> {
  noStore()
  const supabase = await createClient()
  
  try {
    const start = (page - 1) * limit
    const end = start + limit - 1
    const isArabic = locale === 'ar'

    // Build base query
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:profiles!user_id (
          full_name,
          email,
          avatar_url
        ),
        category:categories!category_id (
          name,
          name_ar,
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
        } else if (filters.status === 'reported') {
          query = query.eq('status', 'reported')
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

      // Enhanced search to include Arabic content
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,` +
          `description.ilike.%${filters.search}%,` +
          `title_ar.ilike.%${filters.search}%,` +
          `description_ar.ilike.%${filters.search}%`
        )
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

    // Format the results
    const formattedData = data.map(listing => {
      return {
        ...listing,
        // If we're in Arabic mode and the Arabic field exists, use it
        title: isArabic && listing.title_ar ? listing.title_ar : listing.title,
        description: isArabic && listing.description_ar ? listing.description_ar : listing.description,
        address: isArabic && listing.address_ar ? listing.address_ar : listing.address,
        category: {
          ...listing.category,
          name: isArabic && listing.category.name_ar ? listing.category.name_ar : listing.category.name,
        },
        // Keep all fields for admin purposes
      } as AdminListing;
    });

    return {
      data: formattedData,
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
  data: z.infer<typeof fullUpdateListingSchema>
): Promise<ListingResponse> {
  const supabase = await createClient()
  
  try {
    // Validate all the data first
    const validated = fullUpdateListingSchema.parse(data)
    
    // Extract the vehicle and property details if they exist
    const { vehicle_details, property_details, ...listingData } = validated
    
    // First update the main listing
    const { data: listing, error } = await supabase
      .from('listings')
      .update(listingData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If vehicle details are provided, update them
    if (vehicle_details && Object.keys(vehicle_details).length > 0) {
      const { error: vehicleError } = await supabase
        .from('vehicle_details')
        .update(vehicle_details)
        .eq('listing_id', id)
      
      if (vehicleError) throw vehicleError
    }

    // If property details are provided, update them
    if (property_details && Object.keys(property_details).length > 0) {
      const { error: propertyError } = await supabase
        .from('property_details')
        .update(property_details)
        .eq('listing_id', id)
      
      if (propertyError) throw propertyError
    }

    revalidatePath('/admin/listings')
    return { data: listing as AdminListing }
  } catch (error) {
    console.error('Error updating listing:', error)
    return { error: 'Failed to update listing' }
  }
}

// Get full listing details for editing
export async function getAdminListing(id: string): Promise<ListingResponse> {
  noStore()
  const supabase = await createClient()
  
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:profiles!user_id (
          full_name,
          email,
          avatar_url
        ),
        category:categories!category_id (
          id,
          name,
          name_ar,
          slug
        ),
        vehicle_details (*),
        property_details (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: listing as AdminListing }
  } catch (error) {
    console.error('Error fetching listing:', error)
    return { error: 'Failed to fetch listing' }
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