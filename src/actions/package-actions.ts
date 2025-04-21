// actions/package-actions.ts
"use server"

import { createClient } from '@/utils/supabase/server'
import { createClient as supabaseClient} from '@supabase/supabase-js'
import { UserPackage } from '@/types/package'

// Get a specific user package by ID
export async function getUserPackageById(packageId: string): Promise<{ package?: UserPackage, error?: string }> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Fetch package details with package information
    const { data, error } = await supabase
      .from('user_packages')
      .select(`
        *,
        package:packages (*)
      `)
      .eq('id', packageId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { error: 'Package not found' }
    }

    return { package: data as UserPackage }
  } catch (error) {
    console.error('Error fetching package details:', error)
    return { error: 'An error occurred while fetching package details' }
  }
}

// Function to check if a package has available listings
export async function checkPackageAvailability(packageId: string, isBonus: boolean = false): Promise<{
  available: boolean,
  count?: number,
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { available: false, error: 'Unauthorized' }
    }

    // Fetch package details
    const { data, error } = await supabase
      .from('user_packages')
      .select(`
        id, 
        listings_remaining,
        bonus_listings_remaining,
        package_id,
        expires_at,
        status
      `)
      .eq('id', packageId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return { available: false, error: 'Package not found or inactive' }
    }

    // Check if package has expired
    if (new Date(data.expires_at) < new Date()) {
      return { available: false, error: 'Package has expired' }
    }

    // Check available listings
    const count = isBonus ? data.bonus_listings_remaining : data.listings_remaining

    return {
      available: count > 0,
      count: count
    }
  } catch (error) {
    console.error('Error checking package availability:', error)
    return { available: false, error: 'An error occurred while checking package availability' }
  }
}

export async function getRamadanPackage(): Promise<{ success: boolean; message: string }> {
  const supabaseAdmin = supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const supabase = await createClient()
  // Define the Ramadan package ID (this is the one we stored in the database)
  const packageId = 'e1e0c909-3771-4e11-b892-8270f62c4128'

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }
    // Check if package exists
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError || !packageData) {
      throw new Error('Ramadan package not found')
    }

    // Check if user already has this package
    const { data: existingPackage } = await supabase
      .from('user_packages')
      .select('id')
      .eq('user_id', user.id)
      .eq('package_id', packageId)
      .single()

    if (existingPackage) {
      return {
        success: false,
        message: 'User already has the Ramadan package'
      }
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create user package record
    const { error: insertError } = await supabaseAdmin
      .from('user_packages')
      .insert({
        user_id: user.id,
        package_id: packageId,
        stripe_payment_intent_id: 'ramadan-promo-' + Date.now(),
        amount: 0,
        currency: 'aed',
        payment_status: 'succeeded',
        status: 'active',
        listings_remaining: packageData.listing_count,
        bonus_listings_remaining: packageData.bonus_listing_count,
        is_featured: packageData.is_featured,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error assigning Ramadan package:', insertError)
      throw new Error('Failed to assign Ramadan package')
    }

    return {
      success: true,
      message: 'Ramadan package assigned successfully'
    }

  } catch (error) {
    console.error('Error in giveRamadanPackage:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}