'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Country } from '@/types/location'
import { MapPin } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

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
          // Set initial selected country from URL if available
          const url = new URL(window.location.href)
          const countrySlug = url.searchParams.get('setCountry')
          if (countrySlug) {
            const country = data.find(c => c.slug === countrySlug)
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
        <MapPin className="h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Select onValueChange={handleCountryChange} value={selectedCountry?.slug}>
        <SelectTrigger className={cn(
          "h-10 w-10 md:w-full px-3",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors duration-200",
          "flex items-center justify-between gap-2",
          "border-none bg-background",
          "[&>svg]:hidden"
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="text-primary h-4 w-4 shrink-0" />
            <SelectValue>
              <span className="truncate hidden md:flex">
                {selectedCountry ? selectedCountry.name : 'Select Country'}
              </span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent 
          className="w-[200px] sm:w-[250px] max-h-[300px] overflow-y-auto"
          position="popper"
          sideOffset={8}
        >
          <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
            Select Country
          </div>
          {countries.map((country) => (
            <SelectItem 
              key={country.id} 
              value={country.slug}
              className="cursor-pointer hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 