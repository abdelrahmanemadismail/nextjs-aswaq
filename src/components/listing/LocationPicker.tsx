'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Map, CheckCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the Map component to avoid SSR issues
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg border bg-muted animate-pulse" />
  ),
})

interface LocationPickerProps {
  onSelectLocation: (location: {
    formatted_address: string
    coordinates: {
      lat: number
      lng: number
    }
  }) => void
  initialLocation?: {
    lat: number
    lng: number
  }
}

export default function LocationPicker({ onSelectLocation, initialLocation }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    formatted_address: string
    coordinates: {
      lat: number
      lng: number
    }
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleLocationSelect = (location: {
    formatted_address: string
    coordinates: {
      lat: number
      lng: number
    }
  }) => {
    setSelectedLocation(location)
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Map className="mr-2 h-4 w-4" />
          Choose on Map
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose Location</DialogTitle>
          <DialogDescription>
            Search for a location or click on the map to select
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <MapComponent
            onSelectLocation={handleLocationSelect}
            initialLocation={initialLocation}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}