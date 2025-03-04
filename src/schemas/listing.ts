// schemas/listing.ts

import * as z from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const categorySchema = z.object({
  main_category: z.string().min(1, 'Please select a category'),
  sub_category: z.string().optional()
})

export const imageSchema = z.object({
  images: z.array(z.custom<File>((file) => file instanceof File, {
    message: 'Must be a valid file'
  }))
    .min(1, 'At least one image is required')
    .max(30, 'Maximum 30 images allowed')
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      'Each file must be under 5MB'
    )
    .refine(
      (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
})

export const detailsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
  title_ar: z.string().optional(), // Arabic title (optional)
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must not exceed 5000 characters'),
  description_ar: z.string().optional(), // Arabic description (optional)
  price: z.number().min(0, 'Price must be a positive number'),
  address: z.string().min(1, 'Address is required'),
  address_ar: z.string().optional(), // Arabic address (optional)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location_id: z.string().uuid('Please select an address'),
  condition: z.enum(['new', 'used']),
  is_negotiable: z.boolean(),
  contact_method: z.array(z.enum(['phone', 'chat', 'whatsapp'])).min(1, 'Select at least one contact method')
})

export const vehicleDetailsSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  color: z.string().optional(),
  color_ar: z.string().optional(), // Arabic color (optional)
  version: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().optional(),
  specs: z.string().optional(),
  specs_ar: z.string().optional(), // Arabic specs (optional)
  sub_category: z.enum(['car', 'motorcycle', 'boats', 'heavytrucks']),
  payment_terms: z.enum(['rent', 'sale'])
})

export const propertyDetailsSchema = z.object({
  property_type: z.enum(['apartment', 'villa', 'commercial']),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  square_footage: z.number().optional(),
  community: z.string().min(1, 'Community/area is required'),
  community_ar: z.string().optional(), // Arabic community (optional)
  furnished: z.boolean(),
  payment_terms: z.enum(['rent', 'sale'])
})

export const packageSelectionSchema = z.object({
  user_package_id: z.string().uuid('Please select a package'),
  is_bonus_listing: z.boolean().optional().default(false),
  is_featured: z.boolean().optional().default(false)
})

export const listingFormSchema = z.object({
  category: z.object({
    main_category: z.string().min(1, 'Please select a category'),
    sub_category: z.string().optional()
  }),
  // Direct array of files
  images: z.array(
    z.any()
    .refine((file) => file instanceof File, 'Expected a file')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
  )
  .min(1, 'At least one image is required')
  .max(30, 'Maximum 30 images allowed'),
  details: z.object({
    title: z.string().min(3).max(200),
    title_ar: z.string().optional(), 
    description: z.string().min(10).max(5000),
    description_ar: z.string().optional(),
    price: z.number().min(0),
    address: z.string().min(1),
    address_ar: z.string().optional(),
    condition: z.enum(['new', 'used']),
    is_negotiable: z.boolean(),
    contact_method: z.array(z.enum(['phone', 'chat', 'whatsapp'])).min(1),
    location_id: z.string().uuid('Please select an address'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  package_details: packageSelectionSchema
})

export type ListingFormSchema = z.infer<typeof listingFormSchema>