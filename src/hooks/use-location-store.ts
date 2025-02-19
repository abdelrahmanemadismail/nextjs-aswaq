// hooks/use-location-store.ts
import { create } from 'zustand'
import { Country, City, NearbyCity } from '@/types/location'
import { 
  getLocations, 
  getCitiesInCountry, 
  getNearbyCities 
} from '@/actions/location-actions'

interface LocationState {
  // Data
  countries: Country[]
  cities: Record<string, City[]> // Keyed by country ID
  nearbyCities: NearbyCity[]
  
  // Loading states
  isLoadingCountries: boolean
  isLoadingCities: boolean
  isLoadingNearby: boolean
  
  // Error states
  error: string | null
  
  // Selected location
  selectedCountry: string | null
  selectedCity: string | null
  
  // Actions
  setSelectedCountry: (countryId: string | null) => void
  setSelectedCity: (cityId: string | null) => void
  fetchLocations: () => Promise<void>
  fetchCitiesForCountry: (countryId: string) => Promise<void>
  fetchNearbyCities: (lat: number, lng: number, radius?: number) => Promise<void>
  reset: () => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  // Initial state
  countries: [],
  cities: {},
  nearbyCities: [],
  isLoadingCountries: false,
  isLoadingCities: false,
  isLoadingNearby: false,
  error: null,
  selectedCountry: null,
  selectedCity: null,

  // Actions
  setSelectedCountry: (countryId) => {
    set({ selectedCountry: countryId, selectedCity: null })
    if (countryId && !get().cities[countryId]) {
      get().fetchCitiesForCountry(countryId)
    }
  },

  setSelectedCity: (cityId) => {
    set({ selectedCity: cityId })
  },

  fetchLocations: async () => {
    set({ isLoadingCountries: true, error: null })
    try {
      const response = await getLocations()
      if (response.error) throw new Error(response.error)
      if (response.data) {
        set({ 
          countries: response.data as Country[],
          // Initialize cities from countries that have them
          cities: (response.data as Country[]).reduce((acc, country) => ({
            ...acc,
            [country.id]: country.cities || []
          }), {})
        })
      }
    } catch (error) {
      set({ error: 'Failed to fetch locations' })
      console.error('Error fetching locations:', error)
    } finally {
      set({ isLoadingCountries: false })
    }
  },

  fetchCitiesForCountry: async (countryId: string) => {
    set({ isLoadingCities: true, error: null })
    try {
      const citiesData = await getCitiesInCountry(countryId)
      set(state => ({
        cities: {
          ...state.cities,
          [countryId]: citiesData
        }
      }))
    } catch (error) {
      set({ error: 'Failed to fetch cities' })
      console.error('Error fetching cities:', error)
    } finally {
      set({ isLoadingCities: false })
    }
  },

  fetchNearbyCities: async (lat: number, lng: number, radius?: number) => {
    set({ isLoadingNearby: true, error: null })
    try {
      const cities = await getNearbyCities(lat, lng, radius)
      set({ nearbyCities: cities })
    } catch (error) {
      set({ error: 'Failed to fetch nearby cities' })
      console.error('Error fetching nearby cities:', error)
    } finally {
      set({ isLoadingNearby: false })
    }
  },

  reset: () => {
    set({
      selectedCountry: null,
      selectedCity: null,
      nearbyCities: [],
      error: null
    })
  }
}))

// Subscribe to changes
useLocationStore.subscribe((state) => {
  console.log('Location state updated:', {
    selectedCountry: state.selectedCountry,
    selectedCity: state.selectedCity
  })
})