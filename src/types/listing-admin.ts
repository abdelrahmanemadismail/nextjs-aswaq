// types/listing-admin.ts
import { ListingStatus, ListingCondition, PaymentTerms, VehicleSubCategory, PropertyType } from './listing'

export interface AdminListing {
    id: string
    user_id: string
    user: {
        full_name: string
        email: string
        avatar_url?: string | null
    }
    category_id: string
    category: {
        name: string
        slug: string
    }
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
    created_at: string
    updated_at: string
    vehicle_details?: {
        brand: string
        model: string
        color: string | null
        version: string | null
        year: number
        mileage: number | null
        specs: string | null
        sub_category: VehicleSubCategory
        payment_terms: PaymentTerms
    }
    property_details?: {
        property_type: PropertyType
        bedrooms: number | null
        bathrooms: number | null
        square_footage: number | null
        community: string
        furnished: boolean
        payment_terms: PaymentTerms
    }
}

export interface ListingStats {
    total: number
    active: number
    inactive: number
    featured: number
    reported: number
    today: number
}

export interface ListingFilters {
    status?: 'all' | 'active' | 'inactive' | 'featured' | 'reported'
    category?: string
    priceRange?: {
        min?: number
        max?: number
    }
    dateRange?: {
        from: Date
        to: Date
    }
    condition?: ListingCondition | 'all'
    search?: string
}

export interface ListingSort {
    field: 'created_at' | 'price' | 'views_count' | 'title'
    direction: 'asc' | 'desc'
}

export type ListingAction = 'edit' | 'delete' | 'feature' | 'toggle-status'

export interface ListingResponse {
    data?: AdminListing | AdminListing[]
    error?: string
    count?: number
}