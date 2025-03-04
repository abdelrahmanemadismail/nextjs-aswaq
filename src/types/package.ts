export interface Package {
    id: string;
    stripe_product_id: string;
    stripe_price_id: string;
    name: string;
    name_ar: string;
    description: string | null;
    price: number;
    package_type: 'free_tier' | 'duration' | 'bulk';
    listing_count: number;
    bonus_listing_count: number;
    duration_days: number;
    bonus_duration_days: number;
    validity_days: number;
    user_limit: number | null;
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserPackage {
    id: string;
    user_id: string;
    package_id: string;
    package?: Package;
    stripe_payment_intent_id: string | null;
    amount: number;
    currency: string;
    payment_status: 'pending' | 'succeeded' | 'failed';
    status: 'pending' | 'active' | 'expired';
    listings_remaining: number;
    bonus_listings_remaining: number;
    is_featured: boolean;
    activated_at: string | null;
    expires_at: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface GroupedPackages {
    free_tier: Package[];
    duration: Package[];
    bulk: Package[];
  }