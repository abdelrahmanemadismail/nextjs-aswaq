// components/admin/listings/ListingFilters.tsx
"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { ListingFilters } from "@/types/listing-admin"
import { Search, X } from "lucide-react"
import { DateRange } from "react-day-picker"

interface ListingFiltersBarProps {
  filters: ListingFilters
  onFilterChange: (filters: ListingFilters) => void
  categories: { id: string; name: string }[]
}

export function ListingFiltersBar({ 
  filters, 
  onFilterChange,
  categories 
}: ListingFiltersBarProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, search: searchValue })
  }

  const clearFilters = () => {
    setSearchValue("")
    onFilterChange({
      status: "all",
      category: undefined,
      condition: "all",
      priceRange: undefined,
      dateRange: undefined,
      search: "",
    })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as ListingFilters['status']
    })
  }

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    if (dateRange?.from && dateRange?.to) {
      onFilterChange({
        ...filters,
        dateRange: {
          from: dateRange.from,
          to: dateRange.to
        }
      })
    } else {
      onFilterChange({
        ...filters,
        dateRange: undefined
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Select
          value={filters.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category ?? 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filters, category: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          value={filters.dateRange}
          onChange={handleDateRangeChange}
        />

        {(filters.search || filters.status !== "all" || filters.category || filters.dateRange) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}