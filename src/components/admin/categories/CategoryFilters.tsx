// components/admin/categories/CategoryFilters.tsx
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
import { CategoryFilters } from "@/types/category-admin"
import { Search, X } from "lucide-react"

interface CategoryFiltersProps {
  filters: CategoryFilters
  onFilterChange: (filters: CategoryFilters) => void
}

export function CategoryFiltersBar({ filters, onFilterChange }: CategoryFiltersProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, search: searchValue })
  }

  const clearFilters = () => {
    setSearchValue("")
    onFilterChange({
      search: "",
      status: "all",
      type: "all",
    })
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <form
        onSubmit={handleSearch}
        className="flex flex-1 items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFilterChange({ ...filters, status: value as CategoryFilters["status"] })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>


        {(filters.search || filters.status !== "all" || filters.type !== "all") && (
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