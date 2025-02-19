import * as z from 'zod'

// Regex for slug format validation
const slugRegex = /^[a-z0-9-]+$/

export const locationFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  name_ar: z.string()
    .min(2, 'Arabic name must be at least 2 characters')
    .max(100, 'Arabic name cannot exceed 100 characters'),
  
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(slugRegex, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  
  type: z.enum(['country', 'city']),
  
  parent_id: z.string().uuid().nullable(),
  
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .nullable(),
  
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .nullable(),
  
  is_active: z.boolean().default(true)
})

export const locationUpdateSchema = locationFormSchema.partial().extend({
  id: z.string().uuid()
})