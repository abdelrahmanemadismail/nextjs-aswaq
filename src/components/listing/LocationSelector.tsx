'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocationStore } from '@/hooks/use-location-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/use-translation'
import { Languages } from '@/constants/enums'

export function LocationSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()
  
  const {
    countries,
    cities,
    selectedCountry,
    selectedCity,
    fetchLocations,
    setSelectedCountry,
    setSelectedCity,
    isLoadingCountries,
    isLoadingCities
  } = useLocationStore()

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Initialize selection from URL params
  useEffect(() => {
    const countryParam = searchParams.get('country') 
    const cityParam = searchParams.get('city')
    
    // Set initial country to UAE if not already selected
    if (!selectedCountry) {
      setSelectedCountry('a8c73ef2-9db4-460e-8999-79a386632bf7')
    }

    if (countryParam && countryParam !== selectedCountry) {
      setSelectedCountry(countryParam)
    }
    if (cityParam && cityParam !== selectedCity) {
      setSelectedCity(cityParam)
    }
  }, [searchParams, selectedCountry, selectedCity, setSelectedCountry, setSelectedCity])

  const handleCountryChange = (value: string) => {
    // Update store
    setSelectedCountry(value)
    
    // Update URL
    const params = new URLSearchParams(searchParams)
    params.set('country', value)
    params.delete('city') // Reset city when country changes
    params.set('page', '1')
    router.push(`/listings?${params.toString()}`)
  }

  const handleCityChange = (value: string) => {
    // Update store
    setSelectedCity(value)
    
    // Update URL
    const params = new URLSearchParams(searchParams)
    params.set('city', value)
    params.set('page', '1')
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">{t.listings.location.country}</Label>
        <Select
          value={selectedCountry || ''}
          onValueChange={handleCountryChange}
          disabled={isLoadingCountries}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder={t.listings.location.selectCountry} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {locale === Languages.ARABIC && country.name_ar ? country.name_ar : country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCountry && (
        <div className="space-y-2">
          <Label htmlFor="city">{t.listings.location.city}</Label>
          <Select
            value={selectedCity || ''}
            onValueChange={handleCityChange}
            disabled={isLoadingCities}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder={t.listings.location.selectCity} />
            </SelectTrigger>
            <SelectContent>
              {cities[selectedCountry]?.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {locale === Languages.ARABIC && city.name_ar ? city.name_ar : city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}