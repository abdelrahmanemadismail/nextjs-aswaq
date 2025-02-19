'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { createCheckoutSession, verifyCheckoutSession } from '@/utils/stripe/stripe-server'
import { packageSelectionSchema } from '@/schemas/package-schema'
import { revalidatePath } from 'next/cache'

// Initiate checkout with Stripe
export async function initiateCheckout({ packageId }: { packageId: string }) {
  try {
    // Validate input
    const validatedData = packageSelectionSchema.parse({ packageId })
    
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to purchase a package' }
    }
    
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', validatedData.packageId)
      .single()
      
    if (packageError || !packageData) {
      return { error: 'Package not found or unavailable' }
    }
    
    // Create checkout session
    const { sessionId, url } = await createCheckoutSession({
      packageId: packageData.id,
      userId: user.id,
      name: packageData.name,
      description: packageData.description || `${packageData.name} Package`,
      amount: packageData.price,
      currency: 'aed'
    })
    
    return { success: true, sessionId, checkoutUrl: url }
  } catch (error) {
    console.error('Payment initiation error:', error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
    }
  }
}

// Verify payment and create user package
export async function verifyPayment(sessionId: string) {
  try {
    const supabase = supabaseAdmin
    
    // Verify the session with Stripe
    const { isComplete, metadata, amountTotal, currency } = await verifyCheckoutSession(sessionId)
    
    if (!isComplete) {
      return { error: 'Payment has not been completed' }
    }
    
    // Check if we have the required metadata
    if (!metadata?.packageId || !metadata?.userId) {
      return { error: 'Missing required payment metadata' }
    }
    
    // Check if payment has already been processed
    const { data: existingPackage } = await supabase
      .from('user_packages')
      .select('id')
      .eq('stripe_payment_intent_id', sessionId)
      .single()
      
    if (existingPackage) {
      return { success: true, packageId: existingPackage.id, alreadyProcessed: true }
    }
    
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', metadata.packageId)
      .single()
      
    if (packageError || !packageData) {
      return { error: 'Package not found' }
    }
    
    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + packageData.validity_days)
    
    // Create user package
    const { data: userPackage, error: insertError } = await supabase
      .from('user_packages')
      .insert({
        user_id: metadata.userId,
        package_id: metadata.packageId,
        stripe_payment_intent_id: sessionId,
        amount: amountTotal,
        currency: currency || 'aed',
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
      return { error: `Failed to create user package: ${insertError.message}` }
    }
    
    // Revalidate paths that might show package information
    revalidatePath('/profile')
    revalidatePath('/packages')
    
    return { success: true, packageId: userPackage.id }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during payment verification' 
    }
  }
}

// Helper function to get active packages for a user
export async function getUserPackages() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'User not authenticated' }
  }
  
  try {
    const { data, error } = await supabase
      .from('user_packages')
      .select(`
        *,
        package:packages (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      
    if (error) {
      throw error
    }
    
    return { packages: data }
  } catch (error) {
    console.error('Error fetching user packages:', error)
    return { error: 'Failed to fetch packages' }
  }
}

// Get all available packages
export async function getAvailablePackages() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
      
    if (error) {
      throw error
    }
    
    // Group packages by type
    const groupedPackages = {
      free_tier: data.filter(pkg => pkg.package_type === 'free_tier'),
      duration: data.filter(pkg => pkg.package_type === 'duration'),
      bulk: data.filter(pkg => pkg.package_type === 'bulk')
    }
    
    return { 
      success: true, 
      packages: groupedPackages 
    }
  } catch (error) {
    console.error('Error fetching packages:', error)
    return { error: 'Failed to fetch packages' }
  }
}