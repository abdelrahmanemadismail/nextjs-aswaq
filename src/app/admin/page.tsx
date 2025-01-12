"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/admin';
import { getDashboardData } from '@/actions/admin-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  ListTodo,
  CheckSquare,
  Flag
} from 'lucide-react';
import { TrendChart, ActivityFeed } from '@/components/admin/DashboardComponents';


export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon 
  }: { 
    title: string; 
    value: number | string;
    icon: React.ElementType;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={dashboardData?.totalUsers ?? 0}
          icon={Users}
        />
        
        <StatCard
          title="Active Users"
          value={dashboardData?.activeUsers ?? 0}
          icon={UserCheck}
        />
        
        <StatCard
          title="Pending Verifications"
          value={dashboardData?.pendingVerifications ?? 0}
          icon={ShieldCheck}
        />
        
        <StatCard
          title="Total Listings"
          value={dashboardData?.totalListings ?? 0}
          icon={ListTodo}
        />
        
        <StatCard
          title="Active Listings"
          value={dashboardData?.activeListing ?? 0}
          icon={CheckSquare}
        />
        
        <StatCard
          title="Reported Listings"
          value={dashboardData?.reportedListings ?? 0}
          icon={Flag}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TrendChart 
          data={dashboardData?.trends || []} 
          isLoading={loading} 
        />
        <ActivityFeed 
          activities={dashboardData?.recentActivity || []} 
          isLoading={loading}
        />
      </div>
    </div>
  );
}