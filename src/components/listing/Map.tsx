import { useEffect, useState } from 'react'
import { useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const DEFAULT_CENTER = [25.2048, 55.2708] // Dubai coordinates
const DEFAULT_ZOOM = 12
const UAE_BOUNDS: L.LatLngBoundsLiteral = [
  [22.6333, 51.5833], // Southwest coordinates
  [26.0833, 56.3833]  // Northeast coordinates
]

interface MapProps {
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

// Map marker dragging component
function DraggableMarker({ position, onDragEnd }: {
  position: L.LatLng
  onDragEnd: (latlng: L.LatLng) => void
}) {
  const [markerPosition, setMarkerPosition] = useState(position)
  
  const eventHandlers = {
    dragend(e: L.DragEndEvent) {
      const marker = e.target
      const position = marker.getLatLng()
      setMarkerPosition(position)
      onDragEnd(position)
    },
  }

  return (
    <Marker 
      position={markerPosition} 
      draggable={true}
      eventHandlers={eventHandlers}
    />
  )
}

// Map controller component
function MapController({ onLocationSelect }: {
  onLocationSelect: (latlng: L.LatLng) => void
}) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })

  useEffect(() => {
    map.setMaxBounds(UAE_BOUNDS)
    map.on('drag', () => {
      map.panInsideBounds(UAE_BOUNDS, { animate: false })
    })
  }, [map])

  return null
}

export default function Map({ onSelectLocation, initialLocation }: MapProps) {
  // const [searchQuery, setSearchQuery] = useState('')
  // const [isSearching, setIsSearching] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng>(
    initialLocation 
      ? L.latLng(initialLocation.lat, initialLocation.lng)
      : L.latLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
  )

  // Fix for default marker icon
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    })
  }, [])

  // const handleSearch = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!searchQuery.trim() || isSearching) return

  //   try {
  //     setIsSearching(true)
  //     const params = new URLSearchParams({ q: `${searchQuery}, UAE` })
  //     const response = await fetch(`/api/geocode?${params}`)
  //     const data = await response.json()

  //     if (data && data[0]) {
  //       const { lat, lon, display_name } = data[0]
  //       const newPosition = L.latLng(parseFloat(lat), parseFloat(lon))
  //       setSelectedPosition(newPosition)
        
  //       onSelectLocation({
  //         formatted_address: display_name,
  //         coordinates: {
  //           lat: parseFloat(lat),
  //           lng: parseFloat(lon)
  //         }
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Search error:', error)
  //   } finally {
  //     setIsSearching(false)
  //   }
  // }

  const handlePositionSelected = async (latlng: L.LatLng) => {
    setSelectedPosition(latlng)
    
    try {
      // Reverse geocode the coordinates
      const params = new URLSearchParams({
        lat: latlng.lat.toString(),
        lon: latlng.lng.toString()
      })

      const response = await fetch(`/api/geocode?${params}`)
      const data = await response.json()

      if (data) {
        onSelectLocation({
          formatted_address: data.display_name,
          coordinates: {
            lat: latlng.lat,
            lng: latlng.lng
          }
        })
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-20"
        />
        <Button 
          type="submit" 
          size="sm"
          className="absolute right-1 top-1"
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form> */}

      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={selectedPosition}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          minZoom={6}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker 
            position={selectedPosition}
            onDragEnd={handlePositionSelected}
          />
          <MapController onLocationSelect={handlePositionSelected} />
        </MapContainer>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Click on the map or drag the marker to select a location
      </p>
    </div>
  )
}