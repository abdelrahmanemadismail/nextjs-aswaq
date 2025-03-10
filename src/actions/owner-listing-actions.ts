'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

/**
 * Updates a listing's status to 'sold'
 * @param listingId - The UUID of the listing to mark as sold
 */
export async function markListingAsSold(listingId: string) {
  try {
    const supabase = await createClient()
    
    // Get current session to ensure user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    // Check if the user is the owner of the listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single()
    
    if (fetchError) {
      return { success: false, error: fetchError.message }
    }
    
    if (listing.user_id !== user.id) {
      return { success: false, error: 'Not authorized to update this listing' }
    }
    
    // Update the listing status to 'sold'
    const { error: updateError } = await supabase
      .from('listings')
      .update({ 
        status: 'sold',
        updated_at: new Date().toISOString() 
      })
      .eq('id', listingId)
    
    if (updateError) {
      return { success: false, error: updateError.message }
    }
    
    // Revalidate the listing page
    revalidatePath(`/listings/${listingId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error marking listing as sold:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Updates a listing's status to 'unavailable'
 * @param listingId - The UUID of the listing to disable
 */
export async function disableListing(listingId: string) {
  try {
    const supabase = await createClient()
    
    // Get current session to ensure user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    // Check if the user is the owner of the listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single()
    
    if (fetchError) {
      return { success: false, error: fetchError.message }
    }
    
    if (listing.user_id !== user.id) {
      return { success: false, error: 'Not authorized to update this listing' }
    }
    
    // Update the listing status to 'unavailable'
    const { error: updateError } = await supabase
      .from('listings')
      .update({ 
        status: 'unavailable',
        updated_at: new Date().toISOString() 
      })
      .eq('id', listingId)
    
    if (updateError) {
      return { success: false, error: updateError.message }
    }
    
    // Revalidate the listing page
    revalidatePath(`/listings/${listingId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error disabling listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Activates a listing that was previously sold or unavailable
 * @param listingId - The UUID of the listing to activate
 */
export async function activateListing(listingId: string) {
    try {
      const supabase = await createClient()
      
      // Get current session to ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }
      
      // Check if the user is the owner of the listing
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single()
      
      if (fetchError) {
        return { success: false, error: fetchError.message }
      }
      
      if (listing.user_id !== user.id) {
        return { success: false, error: 'Not authorized to update this listing' }
      }
      
      // Update the listing status to 'active'
      const { error: updateError } = await supabase
        .from('listings')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString() 
        })
        .eq('id', listingId)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
      
      // Revalidate the listing page
      revalidatePath(`/listings/${listingId}`)
      
      return { success: true }
    } catch (error) {
      console.error('Error activating listing:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }