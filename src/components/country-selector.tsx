'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Country } from '@/types/location'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CountrySelector() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('type', 'country')
          .eq('is_active', true)
          .order('name')

        if (!error && data) {
          setCountries(data as Country[])
          
          // First check for the preferred-country cookie
          const cookies = document.cookie.split(';')
          const countryCookie = cookies.find(c => c.trim().startsWith('preferred-country='))
          const countrySlug = countryCookie ? countryCookie.split('=')[1].trim() : null

          // If no cookie, check URL params
          const url = new URL(window.location.href)
          const urlCountrySlug = url.searchParams.get('setCountry')
          
          // Use cookie value first, then URL param as fallback
          const finalSlug = countrySlug || urlCountrySlug
          
          if (finalSlug) {
            const country = data.find(c => c.slug === finalSlug)
            if (country) setSelectedCountry(country)
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const handleCountryChange = (slug: string) => {
    try {
      const country = countries.find(c => c.slug === slug)
      if (country) {
        setSelectedCountry(country)
        const url = new URL(window.location.href)
        url.searchParams.set('setCountry', slug)
        router.push(url.toString())
      }
    } catch (error) {
      console.error('Error updating country:', error)
    }
  }

  if (loading) {
    return (
      <div className="h-10 bg-muted/50 animate-pulse rounded-md flex items-center justify-center px-3">
        <div className="h-4 w-6 bg-muted-foreground/20 rounded-full" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Select onValueChange={handleCountryChange} value={selectedCountry?.slug}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {selectedCountry ? (
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-border">
                  <Image
                    src={`https://flag.vercel.app/m/${selectedCountry.code || 'AE'}.svg`}
                    alt={selectedCountry.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/flags/default.svg"
                    }}
                  />
                </div>
                <span className="truncate">{selectedCountry.name}</span>
              </div>
            ) : (
              'Select Country'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem 
              key={country.id} 
              value={country.slug}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-border">
                  <Image
                    src={`https://flag.vercel.app/m/${country.code || 'AE'}.svg`}
                    alt={country.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/flags/default.svg"
                    }}
                  />
                </div>
                <span className="truncate">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 