import { LucideIcon } from 'lucide-react';
import { UserProfile, UserRole, BusinessProfile } from './profile';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  totalListings: number;
  activeListing: number;
  reportedListings: number;
  totalRevenue?: number;
}

// Admin User Management Types
export interface AdminUser extends UserProfile {
  user_roles: UserRole;
  businessProfile?: BusinessProfile;
  totalListings: number;
  lastActive: string;
}

export interface TrendData {
  date: string;
  users: number;
  listings: number;
  verifications: number;
}

export interface RecentActivity {
  id: string;
  type: 'USER_JOINED' | 'LISTING_CREATED' | 'VERIFICATION_REQUESTED' | 'LISTING_REPORTED';
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: string;
  metadata?: {
    listingId?: string;
    listingTitle?: string;
    reportReason?: string;
  };
}

export interface DashboardData extends AdminStats {
  trends: TrendData[];
  recentActivity: RecentActivity[];
}