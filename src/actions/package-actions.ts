// actions/package-actions.ts
"use server"

import { createClient } from '@/utils/supabase/server'
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