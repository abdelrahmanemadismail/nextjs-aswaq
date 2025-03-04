// schemas/listing-admin.ts
import { z } from 'zod'


// Schema for updating a listing in the admin panel
export const updateListingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  title_ar: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  description_ar: z.string().min(10).max(5000).optional(),
  price: z.number().min(0).optional(),
  address: z.string().min(1).optional(),
  address_ar: z.string().min(1).optional(),
  condition: z.enum(['new', 'used']).optional(),
  status: z.enum(['active', 'sold', 'unavailable']).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  contact_methods: z.array(z.enum(['phone', 'chat', 'whatsapp'])).min(1).optional(),
  category_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional()
})

// Schema for vehicle details updates
export const updateVehicleDetailsSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  color: z.string().optional(),
  color_ar: z.string().optional(),
  version: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  mileage: z.number().optional(),
  specs: z.string().optional(),
  specs_ar: z.string().optional(),
  sub_category: z.enum(['car', 'motorcycle', 'boats', 'heavytrucks']).optional(),
  payment_terms: z.enum(['rent', 'sale']).optional()
})

// Schema for property details updates
export const updatePropertyDetailsSchema = z.object({
  property_type: z.enum(['apartment', 'villa', 'commercial']).optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  square_footage: z.number().optional(),
  community: z.string().min(1).optional(),
  community_ar: z.string().optional(),
  furnished: z.boolean().optional(),
  payment_terms: z.enum(['rent', 'sale']).optional()
})

// Combined schema for full listing update with details
export const fullUpdateListingSchema = updateListingSchema.extend({
  vehicle_details: updateVehicleDetailsSchema.optional(),
  property_details: updatePropertyDetailsSchema.optional()
})