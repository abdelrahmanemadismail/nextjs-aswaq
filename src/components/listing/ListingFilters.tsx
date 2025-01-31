"use client"

import { useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { handleSortFilter } from "@/lib/filter-utils"

export function ListingFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sort = searchParams.get("sort") || "date_desc"

  const handleSort = (value: string) => {
    const queryString = handleSortFilter(value, searchParams)
    router.push(`/listings?${queryString}`)
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">        
        <Select value={sort} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}