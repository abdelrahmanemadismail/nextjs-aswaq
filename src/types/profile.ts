import { Database } from "./database.types"

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"]
type DbBusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DbRole = Database["public"]["Tables"]["roles"]["Row"]
type DbUserRole = Database["public"]["Tables"]["user_roles"]["Row"]

/**
 * Represents a user's profile with authentication and profile data
 */
export interface UserProfile extends Omit<DbProfile, "verification_status"> {
    email: string;
    phone_number?: string | null;
    verification_status: 'unverified' | 'pending' | 'verified';
}

/**
 * Represents the editable fields of a user's profile
 */
export interface EditableUserProfile {
    full_name: string;
    avatar_url?: string | null;
    date_of_birth?: string | null;
}

/**
 * Represents a user's role with associated role details
 */
export interface UserRole extends DbUserRole {
    role?: {
        name: 'admin' | 'personal' | 'business';
        description?: string;
        listing_limit: number;
    };
}

/**
 * Represents a business profile with all fields from database
 */
export type BusinessProfile = DbBusinessProfile

/**
 * Represents the editable fields of a business profile
 */
export interface EditableBusinessProfile {
    business_name: string;
    company_logo?: string | null;
    trade_license_number: string;
    trade_license_expiry: string | null;
    company_address: string;
    company_phone: string;
    company_email: string;
    tax_registration_number?: string | null;
    business_category: string;
}

/**
 * Verification request interface based on database schema
 */
export interface VerificationRequest {
    id: string;
    user_id: string;
    document_type: 'id' | 'passport' | 'trade_license' | 'other';
    document_url: string;
    document_number: string;
    document_expiry: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string | null;
    rejection_reason?: string | null;
    verified_by?: string | null;
    verified_at?: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Type guard to check if a profile has a business profile
 */
export function isBusinessProfile(profile: UserProfile): profile is UserProfile & { businessProfile: BusinessProfile } {
    return 'businessProfile' in profile;
}

/**
 * Type guard to check if a user has admin role
 */
export function isAdminRole(role: UserRole): boolean {
    return role.role?.name === 'admin';
}