// schemas/listing-admin.ts
import * as z from 'zod'

export const listingFiltersSchema = z.object({
    status: z.enum(['all', 'active', 'inactive', 'featured', 'reported']).optional(),
    category: z.string().optional(),
    priceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
    }).optional(),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),
    condition: z.enum(['new', 'used', 'all']).optional(),
    search: z.string().optional(),
})

export const listingSortSchema = z.object({
    field: z.enum(['created_at', 'price', 'views_count', 'title']),
    direction: z.enum(['asc', 'desc']),
})

export const updateListingSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.number().min(0).optional(),
    location: z.string().optional(),
    condition: z.enum(['new', 'used']).optional(),
    status: z.enum(['active', 'sold', 'unavailable']).optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
})