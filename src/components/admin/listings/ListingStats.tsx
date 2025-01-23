// components/admin/listings/ListingStats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListingStats } from "@/types/listing-admin"
import { Package, CheckCircle, XCircle, Star, Flag, Calendar } from "lucide-react"

interface ListingStatsCardProps {
  stats: ListingStats
  isLoading?: boolean
}

export function ListingStatsCard({ stats, isLoading = false }: ListingStatsCardProps) {
  const items = [
    {
      title: "Total Listings",
      value: stats.total,
      icon: Package,
    },
    {
      title: "Active Listings",
      value: stats.active,
      icon: CheckCircle,
    },
    {
      title: "Inactive Listings",
      value: stats.inactive,
      icon: XCircle,
    },
    {
      title: "Featured Listings",
      value: stats.featured,
      icon: Star,
    },
    {
      title: "Reported Listings",
      value: stats.reported,
      icon: Flag,
    },
    {
      title: "New Today",
      value: stats.today,
      icon: Calendar,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              ) : (
                item.value
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}