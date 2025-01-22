// types/listing.ts

import { type Database } from './database.types'

type DbListing = Database['public']['Tables']['listings']['Row']
type DbVehicleDetails = Database['public']['Tables']['vehicle_details']['Row']
type DbPropertyDetails = Database['public']['Tables']['property_details']['Row']

export type ListingCondition = 'new' | 'used'
export type ListingStatus = 'active' | 'sold' | 'unavailable'
export type PaymentTerms = 'rent' | 'sale'

export type VehicleSubCategory = 'car' | 'motorcycle' | 'boats' | 'heavytrucks'
export type PropertyType = 'apartment' | 'villa' | 'commercial'

export interface Listing extends Omit<DbListing, 'created_at' | 'updated_at'> {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number
  location: string
  condition: ListingCondition
  status: ListingStatus
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
  version: string | null
  year: number
  mileage: number | null
  specs: string | null
  sub_category: VehicleSubCategory
  payment_terms: PaymentTerms
  condition: ListingCondition
}

export interface PropertyDetails extends Omit<DbPropertyDetails, 'created_at' | 'updated_at'> {
  listing_id: string
  property_type: PropertyType
  bedrooms: number | null 
  bathrooms: number | null 
  square_footage: number | null 
  community: string
  furnished: boolean
  payment_terms: PaymentTerms
  condition: ListingCondition
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
    description: string
    price: number
    location: string
    condition: ListingCondition
    is_negotiable: boolean
    contact_method: ('phone' | 'chat' | 'whatsapp')[]
  }
  vehicle_details?: Omit<VehicleDetails, 'listing_id'>
  property_details?: Omit<PropertyDetails, 'listing_id'>
}

export type ListingStep = 'category' | 'images' | 'details' | 'review'

export interface CreateListingInput extends Omit<Listing, 'id' | 'user_id' | 'views_count' | 'is_featured'> {
  vehicle_details?: Omit<VehicleDetails, 'listing_id'>
  property_details?: Omit<PropertyDetails, 'listing_id'>
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string
}