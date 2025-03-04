// types/listing.ts

import { type Database } from './database.types'

type DbListing = Database['public']['Tables']['listings']['Row']
type DbVehicleDetails = Database['public']['Tables']['vehicle_details']['Row']
type DbPropertyDetails = Database['public']['Tables']['property_details']['Row']

export type ListingCondition = 'new' | 'used'
export type ListingCondition_ar = 'جديد' | 'مستعمل'
export type ListingStatus = 'active' | 'sold' | 'unavailable'
export type PaymentTerms = 'rent' | 'sale'
export type ContactMethod = 'phone' | 'chat' | 'whatsapp'

export type VehicleSubCategory = 'car' | 'motorcycle' | 'boats' | 'heavytrucks'
export type PropertyType = 'apartment' | 'villa' | 'commercial'

export interface Listing extends Omit<DbListing, 'created_at' | 'updated_at'> {
  id: string
  user_id: string
  category_id: string
  title: string
  title_ar?: string
  description: string
  description_ar?: string
  price: number
  address: string
  address_ar?: string
  latitude: number | null
  longitude: number | null
  location_id: string
  condition: ListingCondition
  condition_ar: ListingCondition_ar
  status: ListingStatus
  contact_methods: ContactMethod[]
  is_featured: boolean
  is_active: boolean
  views_count: number
  images: string[]
}

export interface VehicleDetails extends Omit<DbVehicleDetails, 'created_at' | 'updated_at'> {
  listing_id: string
  brand: string
  model: string
  color: string | null
  color_ar?: string | null
  version: string | null
  year: number
  mileage: number | null
  specs: string | null
  specs_ar?: string | null
  sub_category: VehicleSubCategory
  payment_terms: PaymentTerms
}

export interface PropertyDetails extends Omit<DbPropertyDetails, 'created_at' | 'updated_at'> {
  listing_id: string
  property_type: PropertyType
  bedrooms: number | null 
  bathrooms: number | null 
  square_footage: number | null 
  community: string
  community_ar?: string | null
  furnished: boolean
  payment_terms: PaymentTerms
}
export interface PackageDetails {
  user_package_id: string;
  is_bonus_listing?: boolean;
  is_featured?: boolean;
}

// Form types for the multi-step process
export interface ListingFormData {
  category: {
    main_category: string
    sub_category?: string
  }
  images: File[]
  details: {
    title: string
    title_ar?: string
    description: string
    description_ar?: string
    price: number
    address: string
    address_ar?: string
    latitude: number | null
    longitude: number | null
    location_id: string
    condition: ListingCondition
    is_negotiable: boolean
    contact_method: ContactMethod[]
  }
  package_details: PackageDetails;

  vehicle_details?: Omit<VehicleDetails, 'listing_id'> & {
    condition?: ListingCondition // Add condition to vehicle details for form handling
  }
  property_details?: Omit<PropertyDetails, 'listing_id'> & {
    condition?: ListingCondition // Add condition to property details for form handling
  }
}

export type ListingStep = 'category' | 'images' | 'details' | 'package' | 'review';

export interface CreateListingInput extends Omit<Listing, 'id' | 'user_id' | 'views_count' | 'is_featured' | 'condition_ar'> {
  vehicle_details?: Omit<VehicleDetails, 'listing_id'>
  property_details?: Omit<PropertyDetails, 'listing_id'>
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string
}