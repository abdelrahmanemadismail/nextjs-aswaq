// actions/listing-actions.ts

"use client"

import { ListingFormData } from '@/types/listing'
import { createClient } from '@/utils/supabase/client'
import { uploadListingImages } from '@/lib/storage'

export async function createListing(data: ListingFormData): Promise<string> {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }
  
    try {
            // First, get the category ID using the slug
    const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', data.category.main_category)
    .single()

  if (categoryError || !categoryData) {
    throw new Error('Category not found')
  }
      // Upload images first
      const imagePaths = await uploadListingImages(data.images, user.id)
  
      // Create the listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          category_id: categoryData.id,
          title: data.details.title,
          description: data.details.description,
          price: data.details.price,
          location: data.details.location,
          condition: data.details.condition,
          images: imagePaths,
          status: 'active',
          is_active: true,
        })
        .select()
        .single()
  
      if (listingError) {
        throw listingError
      }
  
      // Insert category-specific details if any
      if (data.category.main_category === 'vehicles' && data.vehicle_details) {
        const { error: vehicleError } = await supabase
          .from('vehicle_details')
          .insert({
            listing_id: listingData.id,
            ...data.vehicle_details,
            condition: data.details.condition // Add condition here
          })
  
        if (vehicleError) {
          // If vehicle details insertion fails, delete the listing
          await supabase.from('listings').delete().eq('id', listingData.id)
          throw vehicleError
        }
      }
  
      if (data.category.main_category === 'properties' && data.property_details) {
        const { error: propertyError } = await supabase
          .from('property_details')
          .insert({
            listing_id: listingData.id,
            ...data.property_details,
            condition: data.details.condition // Add condition here
          })
  
        if (propertyError) {
          // If property details insertion fails, delete the listing
          await supabase.from('listings').delete().eq('id', listingData.id)
          throw propertyError
        }
      }
  
      return listingData.slug
    } catch (error) {
      console.error('Error creating listing:', error)
      throw error
    }
  }