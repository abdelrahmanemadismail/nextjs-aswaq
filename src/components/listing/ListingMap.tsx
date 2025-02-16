// components/listing/ListingMap.tsx
"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically import the MapContainer component without SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

// Dynamically import other Leaflet components
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

interface ListingMapProps {
  location: string
  title: string
}

export function ListingMap({ location }: ListingMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)

      // Import Leaflet here to ensure it's only loaded in the client
      import('leaflet').then((L) => {
        // Fix Leaflet marker icon issue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        })
      });
    }
  }, [])

  useEffect(() => {
    // Geocode the location on component mount
    const geocodeLocation = async () => {
      try {
        const params = new URLSearchParams({ q: `${location}, Dubai, UAE` })
        const response = await fetch(`/api/geocode?${params}`)
        const data = await response.json()

        if (data && data[0]) {
          const { lat, lon } = data[0]
          setCoordinates({
            lat: parseFloat(lat),
            lng: parseFloat(lon)
          })
        }
      } catch (error) {
        console.error('Geocoding error:', error)
      }
    }

    geocodeLocation()
  }, [location])

  // Show loading state if coordinates aren't available yet
  if (!coordinates || !isClient) {
    return (
      <Card className="mt-8">
        <div className="h-[300px] w-full rounded-lg bg-muted animate-pulse" />
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <div className="h-[300px] w-full rounded-lg overflow-hidden">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={15}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coordinates.lat, coordinates.lng]} />
        </MapContainer>
      </div>
    </Card>
  )
}