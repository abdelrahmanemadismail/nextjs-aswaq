// components/admin/categories/CategoryStats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryStats } from "@/types/category-admin"
import { Layers, CheckCircle2, FolderTree } from "lucide-react"

interface CategoryStatsCardProps {
  stats: CategoryStats
  isLoading?: boolean
}

export function CategoryStatsCard({ stats, isLoading = false }: CategoryStatsCardProps) {
  const items = [
    {
      title: "Total Categories",
      value: stats.total,
      icon: Layers,
    },
    {
      title: "Active Categories",
      value: stats.active,
      icon: CheckCircle2,
    },
    {
      title: "Main Categories",
      value: stats.mainCategories,
      icon: FolderTree,
    },
    {
      title: "Sub Categories",
      value: stats.subCategories,
      icon: Layers,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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