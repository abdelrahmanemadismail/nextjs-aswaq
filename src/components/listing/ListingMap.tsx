// components/listing/ListingMap.tsx
"use client"

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

declare global {
  interface Window {
    google: typeof google
  }
}

interface ListingMapProps {
  location: string
  title: string
}

export function ListingMap({ location, title }: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMap = async () => {
      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary
      const { Geocoder } = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary
      
      const geocoder = new Geocoder()
      
      geocoder.geocode({ address: `${location}, Dubai, UAE` }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const map = new Map(mapRef.current!, {
            center: results[0].geometry.location,
            zoom: 15,
          })

          new google.maps.Marker({
            map,
            position: results[0].geometry.location,
            title
          })
        }
      })
    }

    loadMap()
  }, [location, title])

  return (
    <Card className="mt-8">
      <div ref={mapRef} className="h-[300px] w-full rounded-lg" />
    </Card>
  )
}