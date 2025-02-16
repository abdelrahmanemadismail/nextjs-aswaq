// Default map settings
export const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708] // Dubai coordinates
export const DEFAULT_ZOOM = 12

// Using a different tile provider
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

// Search settings
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'
export const SEARCH_OPTIONS = {
  country: 'AE', // Limit to UAE
  format: 'json',
  limit: 5
}

// Bounds for UAE to limit the map view
export const UAE_BOUNDS: [[number, number], [number, number]] = [
  [22.6333, 51.5833], // Southwest coordinates
  [26.0833, 56.3833]  // Northeast coordinates
]