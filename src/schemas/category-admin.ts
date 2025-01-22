// schemas/category.ts

import * as z from 'zod'

// Validation schema for slug format
const slugRegex = /^[a-z0-9-]+$/

export const categoryFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(slugRegex, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .nullable()
    .optional(),
  
  icon: z.string()
    .max(50, 'Icon name cannot exceed 50 characters')
    .nullable()
    .optional(),
  
  parent_id: z.string()
    .uuid('Invalid parent category ID')
    .nullable()
    .optional(),
  
  display_order: z.number()
    .int('Display order must be an integer')
    .min(0, 'Display order cannot be negative')
    .default(0),
  
  is_active: z.boolean().default(true),
  
  display_in_header: z.boolean().default(false),
  display_in_hero: z.boolean().default(false),
  hero_image: z.string()
    .nullable()
    .optional(),
})

// Validation schema for updating a category
export const categoryUpdateSchema = categoryFormSchema.partial().extend({
  id: z.string().uuid('Invalid category ID')
})

// Validation schema for deleting a category
export const categoryDeleteSchema = z.object({
  id: z.string().uuid('Invalid category ID')
})