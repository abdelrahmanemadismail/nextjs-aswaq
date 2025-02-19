export interface SelectedLocation {
    coordinates: {
      lat: number;
      lng: number;
    };
    formatted_address: string;
  }
  
  export interface LocationPickerProps {
    onSelectLocation: (location: SelectedLocation) => void;
    initialLocation?: {
      lat: number;
      lng: number;
    };
    error?: string;
  }
  
  export interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
    address: {
      city?: string;
      country?: string;
      state?: string;
      suburb?: string;
      road?: string;
    };
  }
  
  export interface ReverseGeocodingResult {
    display_name: string;
    address: {
      city?: string;
      country?: string;
      state?: string;
      suburb?: string;
      road?: string;
    };
    lat: string;
    lon: string;
  }