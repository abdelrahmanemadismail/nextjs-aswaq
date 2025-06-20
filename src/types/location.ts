// types/location.ts
import { Database } from "./database.types"

type DbLocation = Database['public']['Tables']['locations']['Row']

export interface Location extends Omit<DbLocation, 'created_at' | 'updated_at'> {
  id: string
  parent_id: string | null
  name: string
  name_ar: string
  slug: string
  type: 'country' | 'city'
  latitude: number | null
  longitude: number | null
  is_active: boolean
  parent?: Location
}

export interface City extends Location {
  type: 'city'
  parent_id: string
  country?: Country
}

export interface Country extends Location {
  type: 'country'
  parent_id: null
  cities?: City[]
  code: string // ISO 3166-1 alpha-2 country code
}

export interface CityWithCountry {
  city_id: string
  city_name: string
  city_name_ar: string
  city_slug: string
  country_id: string
  country_name: string
  country_name_ar: string
  country_slug: string
}

export interface NearbyCity {
  id: string
  name: string
  name_ar: string
  distance: number
}

export interface LocationResponse {
  data?: Location | Location[]
  error?: string
}