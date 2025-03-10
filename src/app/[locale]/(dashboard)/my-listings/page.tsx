import { Metadata } from "next"
import ListingCard from "@/components/ListingCard"
import { getMyListings } from "@/actions/listing-display-actions"
import BreadcrumbNav from "@/components/BreadcrumbNav"
import { Pagination } from "@/components/Pagination"
import { ListingFilters } from "@/components/listing/ListingFilters"
import { getCategories } from "@/actions/category-actions"
import Link from "next/link"
import { PriceFilter } from '@/components/listing/PriceFilter'
import { Button } from "@/components/ui/button"
import { LocationSelector } from "@/components/listing/LocationSelector"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Filter, Plus, X } from "lucide-react"
import { Languages } from "@/constants/enums"
import SearchInput from "@/components/SearchInput"

export const metadata: Metadata = {
  title: "My Listings | Aswaq",
  description: "Manage your listings on Aswaq",
}

interface SearchParams {
  page?: string
  category?: string
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
  country?: string
  city?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
  params: Promise<{ locale: string }>
}

export default async function MyListingsPage({ searchParams, params }: PageProps) {
  const locale = (await params).locale
  const isArabic = locale === Languages.ARABIC
  const side = isArabic ? "right" : "left";

  const {
    page: pageParam,
    category: categoryParam,
    search: searchParam,
    sort: sortParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    country: countryParam,
    city: cityParam
  } = await searchParams

  // Get translations
  const dict = await import(`@/dictionaries/${locale}.json`).then(module => module.default)
  const t = dict

  // Convert page to number and validate
  const page = Number(pageParam) || 1

  // Get the listings with price filters - using getMyListings instead of getListings
  const { listings, totalPages } = await getMyListings({
    page,
    category: categoryParam,
    search: searchParam,
    sort: sortParam as 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    country: countryParam,
    city: cityParam
  })

  // Create base params for "All Categories" link
  const urlParams = new URLSearchParams()
  // Create a clean object without undefined values
  const cleanParams = {
    page: pageParam,
    search: searchParam,
    sort: sortParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    country: countryParam,
    city: cityParam
  }

  Object.entries(cleanParams).forEach(([key, value]) => {
    if (value) {
      urlParams.set(key, value)
    }
  })

  const categoryParams = urlParams.toString()
  const allCategoriesHref = `/${locale}/my-listings${categoryParams ? `?${categoryParams}` : ''}`

  const categories = await getCategories()

  const hasActiveFilters = categoryParam || searchParam || sortParam || minPriceParam || maxPriceParam || countryParam || cityParam

  // Transform listing data to match the ListingCard interface
  const formattedListings = listings.map(listing => ({
    photos: listing.images || [],
    title: listing.title,
    title_ar: listing.title_ar,
    slug: listing.slug,
    price: listing.price,
    location: typeof listing.location === 'string' ? listing.location :
      (typeof listing.address === 'string' ? listing.address :
        (listing.location?.name || listing.location?.display || '')),
    location_ar: typeof listing.address_ar === 'string' ? listing.address_ar :
      (listing.location_ar?.name || ''),
    timestamp: listing.created_at || listing.timestamp || new Date().toISOString(),
  }));

  // Sidebar content to be used in both desktop and mobile views
  const FiltersContent = () => (
    <>
      <div className="mb-6">
        <SearchInput/>
        <h3 className="font-semibold mb-3">{t.listings.filters.categories}</h3>
        <div className="space-y-2">
          <Link
            href={allCategoriesHref}
            className={`text-sm block hover:text-primary transition-colors ${!categoryParam ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
          >
            {t.listings.filters.allCategories}
          </Link>
          {categories.map((category) => (
            <div key={category.id} className="space-y-1">
              <Link
                href={`/${locale}/my-listings?category=${category.slug}`}
                className={`text-sm block hover:text-primary transition-colors font-medium ${categoryParam === category.slug ? 'text-primary' : 'text-foreground'
                  }`}
              >
                {isArabic && category.name_ar ? category.name_ar : category.name}
              </Link>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className={`${isArabic ? 'pr-4' : 'pl-4'} border-${isArabic ? 'r' : 'l'} space-y-1 mt-1`}>
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={`/${locale}/my-listings?category=${subcategory.slug}`}
                      className={`text-sm block hover:text-primary transition-colors ${categoryParam === subcategory.slug ? 'text-primary font-medium' : 'text-muted-foreground'
                        }`}
                    >
                      {isArabic && subcategory.name_ar ? subcategory.name_ar : subcategory.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">{t.listings.filters.location}</h3>
        <LocationSelector />
      </div>

      <PriceFilter title={t.listings.filters.price} />

      {hasActiveFilters && (
        <div className="mb-6">
          <Link
            href={`/${locale}/my-listings`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <X className="h-4 w-4" /> {t.listings.filters.clearAllFilters}
          </Link>
        </div>
      )}
    </>
  )

  return (
    <main className="container py-6 mx-auto px-4 md:px-6">
      <div className="flex justify-between items-center">
        <BreadcrumbNav />
        <Link href={`/${locale}/sell`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t.common.createListing || "Add Listing"}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FiltersContent />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t.listings.filters.sortBy}
                {hasActiveFilters && <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side={side} className="w-[85vw] sm:w-[380px] overflow-y-auto" dir={isArabic ? "rtl" : "ltr"}>
              <SheetHeader>
                <SheetTitle>{t.listings.filters.sortBy}</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground font-medium">
              {t.listings.filters.myListingsCount?.replace('{count}', listings.length.toString()) || `My Listings (${listings.length})`}
            </span>
            <ListingFilters />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">
                {t.listings.filters.myListingsCount?.replace('{count}', listings.length.toString()) || `My Listings (${listings.length})`}
              </span>
            </div>
            <ListingFilters />
          </div>

          {formattedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedListings.map((listing) => (
                <ListingCard
                  key={listing.slug}
                  photos={listing.photos}
                  title={listing.title}
                  title_ar={listing.title_ar}
                  slug={listing.slug}
                  price={listing.price}
                  location={listing.location}
                  location_ar={listing.location_ar}
                  timestamp={listing.timestamp}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium mb-2">{t.listings.filters.noListingsFound || "You don't have any listings yet"}</p>
              <p className="text-muted-foreground mb-6">{t.listings.filters.createListingPrompt || "Create your first listing to start selling"}</p>
              <Link href={`/${locale}/sell`}>
                <Button>{t.common.createListing || "Create Listing"}</Button>
              </Link>
            </div>
          )}

          <Pagination
            totalPages={totalPages}
            currentPage={page}
          />
        </div>
      </div>
    </main>
  )
}