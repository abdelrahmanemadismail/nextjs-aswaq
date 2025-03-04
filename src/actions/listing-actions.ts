// actions/listing-actions.ts

"use server"

import { ListingFormData } from '@/types/listing'
import { createClient } from '@/utils/supabase/server'
import { createClient as supabaseClient} from '@supabase/supabase-js'
import { uploadListingImages } from '@/lib/storage'
import { checkPackageAvailability } from './package-actions'

export async function createListing(data: ListingFormData): Promise<string> {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    try {
      // First, validate the package exists and has available listings
      const isBonus = data.package_details.is_bonus_listing || false
      const { available, error: availabilityError } = await checkPackageAvailability(
        data.package_details.user_package_id,
        isBonus
      )

      if (availabilityError) {
        throw new Error(availabilityError)
      }
      
      if (!available) {
        throw new Error(`No available ${isBonus ? 'bonus' : 'regular'} listings in the selected package`)
      }
      
      // Get package details for duration calculation
      const { data: packageData, error: packageError } = await supabase
        .from('user_packages')
        .select(`
          id,
          package_id,
          status
        `)
        .eq('id', data.package_details.user_package_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

        if (packageError || !packageData) {
        throw new Error('Selected package not found or inactive')
      }

      // Get the category ID using the slug
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
  
      // Create the listing with i18n support
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          category_id: categoryData.id,
          title: data.details.title,
          title_ar: data.details.title_ar, // Arabic title
          description: data.details.description,
          description_ar: data.details.description_ar, // Arabic description
          price: data.details.price,
          address: data.details.address,
          address_ar: data.details.address_ar, // Arabic address
          latitude: data.details.latitude,
          longitude: data.details.longitude,
          location_id: data.details.location_id,
          condition: data.details.condition,
          contact_methods: data.details.contact_method, // Array of contact methods
          images: imagePaths,
          is_featured: data.package_details.is_featured || false,
          status: 'active',
          is_active: true,
        })
        .select()
        .single()
  
      if (listingError) {
        throw listingError
      }
      
      // Get package duration details
      const { data: packageDetails, error: packageDetailsError } = await supabase
        .from('packages')
        .select('duration_days, bonus_duration_days')
        .eq('id', packageData.package_id)
        .single()
      
      if (packageDetailsError) {
        throw packageDetailsError
      }
      
      // Calculate duration and expiration date for this listing
      const durationDays = isBonus 
        ? packageDetails.duration_days + packageDetails.bonus_duration_days 
        : packageDetails.duration_days
      
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + durationDays)
      
      const supabaseAdmin = supabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
      // Create package_listing entry to track the listing usage
      const { error: packageListingError } = await supabaseAdmin
        .from('package_listings')
        .insert({
          user_package_id: data.package_details.user_package_id,
          listing_id: listingData.id,
          is_bonus_listing: isBonus,
          is_featured: data.package_details.is_featured || false,
          total_days: durationDays,
          used_days: 0,
          remaining_days: durationDays,
          activated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
      
      if (packageListingError) {
        // If package listing creation fails, delete the listing to maintain consistency
        await supabase.from('listings').delete().eq('id', listingData.id)
        throw packageListingError
      }
      
      // Insert category-specific details if any
      if (data.category.main_category === 'vehicles' && data.vehicle_details) {
        const { error: vehicleError } = await supabase
          .from('vehicle_details')
          .insert({
            listing_id: listingData.id,
            brand: data.vehicle_details.brand,
            model: data.vehicle_details.model,
            color: data.vehicle_details.color,
            color_ar: data.vehicle_details.color_ar, // Arabic color
            version: data.vehicle_details.version,
            year: data.vehicle_details.year,
            mileage: data.vehicle_details.mileage,
            specs: data.vehicle_details.specs,
            specs_ar: data.vehicle_details.specs_ar, // Arabic specs
            sub_category: data.vehicle_details.sub_category || 'car', // Default to car if not specified
            payment_terms: data.vehicle_details.payment_terms || 'sale' // Default to sale if not specified
          })
  
        if (vehicleError) {
          // Rollback all previous operations if vehicle details insertion fails
          await supabase.from('package_listings').delete().eq('listing_id', listingData.id)
          await supabase.from('listings').delete().eq('id', listingData.id)
          throw vehicleError
        }
      }
  
      if (data.category.main_category === 'properties' && data.property_details) {
        const { error: propertyError } = await supabase
          .from('property_details')
          .insert({
            listing_id: listingData.id,
            property_type: data.property_details.property_type,
            bedrooms: data.property_details.bedrooms,
            bathrooms: data.property_details.bathrooms,
            square_footage: data.property_details.square_footage,
            community: data.property_details.community,
            community_ar: data.property_details.community_ar, // Arabic community
            furnished: data.property_details.furnished,
            payment_terms: data.property_details.payment_terms || 'sale' // Default to sale if not specified
          })
  
        if (propertyError) {
          // Rollback all previous operations if property details insertion fails
          await supabase.from('package_listings').delete().eq('listing_id', listingData.id)
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