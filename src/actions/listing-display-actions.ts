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
          slug
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