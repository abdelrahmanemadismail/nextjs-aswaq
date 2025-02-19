// types/listing-display.ts
import { Location } from "./location";
export interface DisplayListing {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    condition: 'new' | 'used';
    status: 'active' | 'sold' | 'unavailable';
    is_featured: boolean;
    images: string[];
    created_at: string;
    user: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      verification_status: 'unverified' | 'pending' | 'verified';
      join_date: string;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
    vehicle_details?: {
      brand: string;
      model: string;
      year: number;
      color?: string;
      mileage?: number;
      specs?: string;
      sub_category: 'car' | 'motorcycle' | 'boats' | 'heavytrucks';
      payment_terms: 'rent' | 'sale';
    };
    property_details?: {
      property_type: 'apartment' | 'villa' | 'commercial';
      bedrooms?: number;
      bathrooms?: number;
      square_footage?: number;
      community: string;
      furnished: boolean;
      payment_terms: 'rent' | 'sale';
    };
    location: Location;
  }