"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "@/hooks/use-translation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { handleSortFilter } from "@/lib/filter-utils"
import { Languages } from "@/constants/enums"

export function ListingFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale, getLocalizedPath } = useTranslation()
  const isArabic = locale === Languages.ARABIC
  
  const sort = searchParams.get("sort") || "date_desc"
  
  const handleSort = (value: string) => {
    const queryString = handleSortFilter(value, searchParams)
    router.push(getLocalizedPath(`/listings?${queryString}`))
  }
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <Select value={sort} onValueChange={handleSort} dir={isArabic ? "rtl" : "ltr"}>
          <SelectTrigger className="w-[180px]">
            {isArabic ? (
              <>
                <SelectValue placeholder={t.listings.filters.sortBy} />
                <SlidersHorizontal className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t.listings.filters.sortBy} />
              </>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">{t.listings.filters.newestFirst}</SelectItem>
            <SelectItem value="date_asc">{t.listings.filters.oldestFirst}</SelectItem>
            <SelectItem value="price_asc">{t.listings.filters.priceLowToHigh}</SelectItem>
            <SelectItem value="price_desc">{t.listings.filters.priceHighToLow}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}