export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | null;
    verification_status: 'unverified' | 'pending' | 'verified';
    is_banned: boolean;
    join_date: string;
    created_at: string;
    updated_at: string;
  }
  export interface EditableUserProfile {
    full_name: string;
    avatar_url?: string | null;
    date_of_birth?: string | null;
  }
  export interface UserRole {
    id: string;
    role_id: string;
    created_at: string;
    updated_at: string;
    role?: {
      name: 'admin' | 'personal' | 'business';
      description?: string;
      listing_limit: number;
    };
  }
  
  export interface BusinessProfile {
    id: string;
    business_name: string;
    company_logo?: string;
    trade_license_number: string;
    trade_license_expiry: string;
    trade_license_verified: boolean;
    company_address: string;
    company_phone: string;
    company_email: string;
    tax_registration_number?: string;
    business_category: string;
    created_at: string;
    updated_at: string;
  }

export interface EditableBusinessProfile {
    business_name: string;
    company_logo?: string | null;
    trade_license_number: string;
    trade_license_expiry: string | null;  // Make this nullable
    company_address: string;
    company_phone: string;
    company_email: string;
    tax_registration_number?: string | null;  // Make this nullable
    business_category: string;
  }