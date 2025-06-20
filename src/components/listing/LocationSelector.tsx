'use client'

import { useEffect, useState } from 'react'
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
import Cookies from 'js-cookie'

export function LocationSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
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

  // Initialize selection from cookie or URL params
  useEffect(() => {
    if (countries.length > 0 && isInitialLoad) {
      const countryParam = searchParams.get('country') 
      const cityParam = searchParams.get('city')
      const preferredCountrySlug = Cookies.get('preferred-country')

      let countryToSet = null
      
      // Priority: URL param > Cookie > Default (first in list)
      if (countryParam) {
        countryToSet = countries.find(c => c.slug === countryParam)
      } else if (preferredCountrySlug) {
        countryToSet = countries.find(c => c.slug === preferredCountrySlug)
      } else if (countries.length > 0) {
        countryToSet = countries[0];
      }
      
      if (countryToSet) {
        setSelectedCountry(countryToSet.id)
        
        // If we're setting from cookie and there's no country in URL, update the URL
        if (!countryParam && preferredCountrySlug) {
          const params = new URLSearchParams(searchParams)
          params.set('country', countryToSet.slug)
          params.set('page', '1')
          router.push(`/listings?${params.toString()}`)
        }
        
        if (cityParam) {
          const cityToSet = cities[countryToSet.id]?.find(ci => ci.slug === cityParam)
          if (cityToSet) {
            setSelectedCity(cityToSet.id)
          }
        }
      }
      setIsInitialLoad(false)
    }
  }, [countries, cities, searchParams, isInitialLoad, setSelectedCountry, setSelectedCity, router])

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId)
    const country = countries.find(c => c.id === countryId)
    
    if (country) {
      const params = new URLSearchParams(searchParams)
      params.set('country', country.slug)
      params.delete('city') 
      params.set('page', '1')
      router.push(`/listings?${params.toString()}`)
    }
  }

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId)
    const city = cities[selectedCountry!]?.find(c => c.id === cityId)

    if (city) {
      const params = new URLSearchParams(searchParams)
      params.set('city', city.slug)
      params.set('page', '1')
      router.push(`/listings?${params.toString()}`)
    }
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
            disabled={isLoadingCities || !cities[selectedCountry]}
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