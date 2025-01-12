import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendData, RecentActivity } from '@/types/admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: TrendData[];
  isLoading: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, isLoading }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="font-medium">{format(parseISO(label), 'MMM d, yyyy')}</div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((item: any) => (
            <div
              key={item.dataKey}
              className="flex items-center text-sm text-muted-foreground"
            >
              <span
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}: {item.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Growth Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#2563eb"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="listings"
                  name="Listings"
                  stroke="#16a34a"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="verifications"
                  name="Verifications"
                  stroke="#9333ea"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityFeedProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'USER_JOINED':
        return 'text-blue-500';
      case 'LISTING_CREATED':
        return 'text-green-500';
      case 'VERIFICATION_REQUESTED':
        return 'text-purple-500';
      case 'LISTING_REPORTED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src={activity.userAvatar} />
                  <AvatarFallback>
                    {activity.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(activity.timestamp), 'PPp')}
                  </p>
                  {activity.metadata?.listingTitle && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.metadata.listingTitle}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "ml-auto text-xs",
                    getActivityIcon(activity.type)
                  )}
                >
                  {activity.type.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};