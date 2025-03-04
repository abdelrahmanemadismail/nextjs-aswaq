// types/listing-display.ts
import { Location } from "./location";
import { ContactMethod, ListingCondition, PaymentTerms, PropertyType, VehicleSubCategory } from "./listing";

export interface DisplayListing {
  id: string;
  slug: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  price: number;
  address: string;
  address_ar?: string;
  latitude: number | null;
  longitude: number | null;
  condition: ListingCondition;
  condition_ar: 'جديد' | 'مستعمل';
  status: 'active' | 'sold' | 'unavailable';
  contact_methods: ContactMethod[];
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
    name_ar?: string;
    slug: string;
  };
  vehicle_details?: {
    brand: string;
    model: string;
    year: number;
    color?: string;
    color_ar?: string;
    mileage?: number;
    specs?: string;
    specs_ar?: string;
    sub_category: VehicleSubCategory;
    payment_terms: PaymentTerms;
  };
  property_details?: {
    property_type: PropertyType;
    bedrooms?: number;
    bathrooms?: number;
    square_footage?: number;
    community: string;
    community_ar?: string;
    furnished: boolean;
    payment_terms: PaymentTerms;
  };
  location: Location;
}