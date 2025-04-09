"use server"

import { ListingFormData } from '@/types/listing'
import { createClient } from '@/utils/supabase/server'
import { createClient as supabaseClient} from '@supabase/supabase-js'
import { checkPackageAvailability } from './package-actions'

// Create a minimized version of the form data without the image files
export interface MinimalListingFormData {
  category: ListingFormData['category'];
  details: ListingFormData['details'];
  package_details: ListingFormData['package_details'];
  vehicle_details?: ListingFormData['vehicle_details'];
  property_details?: ListingFormData['property_details'];
  image_count: number; // Just send the count instead of the actual files
}

// Function to create a listing without images
export async function createListingWithoutImages(data: MinimalListingFormData): Promise<{ 
  slug: string; 
  id: string;
  userId: string;
}> {
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
      
      // Create the listing with empty images array
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          category_id: categoryData.id,
          title: data.details.title,
          title_ar: data.details.title_ar,
          description: data.details.description,
          description_ar: data.details.description_ar,
          price: data.details.price,
          address: data.details.address,
          address_ar: data.details.address_ar,
          latitude: data.details.latitude,
          longitude: data.details.longitude,
          location_id: data.details.location_id,
          condition: data.details.condition,
          contact_methods: data.details.contact_method,
          images: [], // Start with empty images array
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
            color_ar: data.vehicle_details.color_ar,
            version: data.vehicle_details.version,
            year: data.vehicle_details.year,
            mileage: data.vehicle_details.mileage,
            specs: data.vehicle_details.specs,
            specs_ar: data.vehicle_details.specs_ar,
            sub_category: data.vehicle_details.sub_category || 'car',
            payment_terms: data.vehicle_details.payment_terms || 'sale'
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
            community_ar: data.property_details.community_ar,
            furnished: data.property_details.furnished,
            payment_terms: data.property_details.payment_terms || 'sale'
          })
  
        if (propertyError) {
          // Rollback all previous operations if property details insertion fails
          await supabase.from('package_listings').delete().eq('listing_id', listingData.id)
          await supabase.from('listings').delete().eq('id', listingData.id)
          throw propertyError
        }
      }
  
      return {
        slug: listingData.slug,
        id: listingData.id,
        userId: user.id
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      throw error
    }
  }

// Keep the original function signature for backward compatibility
export async function createListing(data: ListingFormData): Promise<string> {
  // Remove the images from the data sent to the server
  const minimalData: MinimalListingFormData = {
    category: data.category,
    details: data.details,
    package_details: data.package_details,
    vehicle_details: data.vehicle_details,
    property_details: data.property_details,
    image_count: data.images?.length || 0
  };

  // Create listing without images
  const { slug } = await createListingWithoutImages(minimalData);
  return slug;
}

/**
 * Get the count of listings created in the last 24 hours
 * @returns The count of listings created in the last 24 hours
 */
export async function getRecentListingsCount(): Promise<number> {
  try {
    const supabase = await createClient();
    
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Format the date for Supabase query
    const formattedDate = twentyFourHoursAgo.toISOString();
    
    // Query for listings created in the last 24 hours
    const { count, error } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', formattedDate);
    
    if (error) {
      console.error('Error fetching recent listings count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getRecentListingsCount:', error);
    return 0;
  }
}