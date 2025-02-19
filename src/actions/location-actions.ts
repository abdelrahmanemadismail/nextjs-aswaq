'use server'

import { createClient } from '@/utils/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'
import { 
  Location, 
  City,
  CityWithCountry,
  NearbyCity,
  LocationResponse 
} from '@/types/location'
import { locationFormSchema, locationUpdateSchema } from '@/schemas/location'

// Get all locations with hierarchical structure
export async function getLocations(): Promise<LocationResponse> {
  noStore()
  const supabase = await createClient()
  
  try {
    // First get all countries
    const { data: countries, error: countriesError } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'country')
      .eq('is_active', true)
      .order('name')

    if (countriesError) throw countriesError

    // Then get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'city')
      .eq('is_active', true)
      .order('name')

    if (citiesError) throw citiesError

    // Organize cities under their countries
    const locationsWithStructure = countries.map(country => ({
      ...country,
      cities: cities.filter(city => city.parent_id === country.id)
    }))

    return { data: locationsWithStructure }
  } catch (error) {
    console.error('Error fetching locations:', error)
    return { error: 'Failed to fetch locations' }
  }
}

// Get a specific city with its country
export async function getCityWithCountry(cityId: string): Promise<CityWithCountry | null> {
  noStore()
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_city_with_country', { city_id: cityId })
      .single()

    if (error) throw error
    return data as CityWithCountry | null
  } catch (error) {
    console.error('Error fetching city with country:', error)
    return null
  }
}

// Get all cities in a country
export async function getCitiesInCountry(countryId: string): Promise<City[]> {
  noStore()
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_cities_in_country', { country_id: countryId })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching cities in country:', error)
    return []
  }
}

// Get nearby cities
export async function getNearbyCities(
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<NearbyCity[]> {
  noStore()
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_nearby_cities', { 
        lat: latitude,
        lng: longitude,
        radius_km: radius
      })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching nearby cities:', error)
    return []
  }
}

// Create new location
export async function createLocation(
  input: Omit<Location, 'id'>
): Promise<LocationResponse> {
  const supabase = await createClient()
  
  try {
    // Validate input
    const validated = locationFormSchema.parse(input)

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('locations')
      .select('slug')
      .eq('slug', validated.slug)
      .single()

    if (existing) {
      return { error: 'A location with this slug already exists' }
    }

    // Insert location
    const { data, error } = await supabase
      .from('locations')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    return { data }
  } catch (error) {
    console.error('Error creating location:', error)
    return { error: 'Failed to create location' }
  }
}

// Update existing location
export async function updateLocation(
  input: Partial<Location> & { id: string }
): Promise<LocationResponse> {
  const supabase = await createClient()
  
  try {
    // Validate input
    const validated = locationUpdateSchema.parse(input)

    // Check for duplicate slug if slug is being updated
    if (validated.slug) {
      const { data: existing } = await supabase
        .from('locations')
        .select('slug')
        .eq('slug', validated.slug)
        .neq('id', validated.id)
        .single()

      if (existing) {
        return { error: 'A location with this slug already exists' }
      }
    }

    // Update location
    const { data, error } = await supabase
      .from('locations')
      .update(validated)
      .eq('id', validated.id)
      .select()
      .single()

    if (error) throw error

    return { data }
  } catch (error) {
    console.error('Error updating location:', error)
    return { error: 'Failed to update location' }
  }
}

// Delete location
export async function deleteLocation(id: string): Promise<LocationResponse> {
  const supabase = await createClient()
  
  try {
    // Check if location has child locations
    const { data: children } = await supabase
      .from('locations')
      .select('id')
      .eq('parent_id', id)

    if (children && children.length > 0) {
      return { error: 'Cannot delete location with child locations' }
    }

    // Delete location
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: undefined }
  } catch (error) {
    console.error('Error deleting location:', error)
    return { error: 'Failed to delete location' }
  }
}