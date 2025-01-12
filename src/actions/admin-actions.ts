'use server'

import { createClient } from '@/utils/supabase/server'
import { AdminStats, AdminUser, DashboardData, TrendData, RecentActivity } from '@/types/admin'
import { unstable_noStore as noStore } from 'next/cache';
import { subDays, format } from 'date-fns';
import { UserRole } from '@/types/profile';

export async function getAdminStats(): Promise<AdminStats> {
  noStore();
  const supabase = await createClient()

  // Get total users count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get active users count (users who logged in in the last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('updated_at', thirtyDaysAgo.toISOString())

  // Get pending verifications count
  const { count: pendingVerifications } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')

  // For listings, we'll add placeholders until we create the listings table
  const totalListings = 0
  const activeListing = 0
  const reportedListings = 0

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    pendingVerifications: pendingVerifications || 0,
    totalListings,
    activeListing,
    reportedListings
  }
}

export async function getAdminUsers(page: number = 1, limit: number = 10): Promise<{
  users: AdminUser[];
  total: number;
}> {
  noStore();
  const supabase = await createClient()
  const start = (page - 1) * limit
  const end = start + limit - 1

  // Get users with their roles
  const { data: users, count } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles!inner (
        role:roles (
          name,
          description,
          listing_limit
        )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end)
  console.log(users?.[0].user_roles.role.name)
  // Get business profiles for business users
  const businessUsers = users?.filter(user => 
    user.user_roles?.role?.name === 'business'
  ) || []

  const businessProfiles = businessUsers.length > 0 
    ? await supabase
        .from('business_profiles')
        .select('*')
        .in('id', businessUsers.map(user => user.id))
    : { data: [] }

  // Map users to AdminUser type
  const mappedUsers: AdminUser[] = users?.map(user => ({
    ...user,
    role: user.user_roles.role,
    businessProfile: businessProfiles.data?.find(bp => bp.id === user.id),
    totalListings: 0, // We'll add this when we create the listings table
    lastActive: user.updated_at
  })) || []

  return {
    users: mappedUsers,
    total: count || 0
  }
}

export async function updateUserStatus(userId: string, isBanned: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: isBanned })
    .eq('id', userId)

  if (error) throw error
  return true
}

export async function updateVerificationStatus(
  userId: string, 
  status: 'unverified' | 'pending' | 'verified'
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status })
    .eq('id', userId)

  if (error) throw error
  return true
}

export async function getDashboardData(): Promise<DashboardData> {
  noStore();
  const supabase = await createClient();
  
  // Get basic stats
  const stats = await getAdminStats();

  // Generate sample trend data (replace with real data when available)
  const trends: TrendData[] = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      users: Math.floor(Math.random() * 100),
      listings: Math.floor(Math.random() * 50),
      verifications: Math.floor(Math.random() * 20)
    };
  });

  // Get recent activities
  const { data: activities } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const recentActivity: RecentActivity[] = activities?.map(user => ({
    id: user.id,
    type: 'USER_JOINED',
    userId: user.id,
    userName: user.full_name,
    userAvatar: user.avatar_url || undefined,
    description: `${user.full_name} joined the platform`,
    timestamp: user.created_at
  })) || [];

  return {
    ...stats,
    trends,
    recentActivity
  };
}

export async function getUserRoles(): Promise<UserRole[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('roles').select('*');
  return data || [];
}