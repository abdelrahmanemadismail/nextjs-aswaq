import { Metadata } from "next"
import FullWidthListingCard from "@/components/FullWidthListingCard"
import { getListings } from "@/actions/listing-display-actions"
import BreadcrumbNav from "@/components/BreadcrumbNav"
import { Pagination } from "@/components/Pagination"
import { ListingFilters } from "@/components/listing/ListingFilters"
import { getCategories } from "@/actions/category-actions"
import Link from "next/link"
import { PriceFilter } from '@/components/listing/PriceFilter'
import { Button } from "@/components/ui/button"
import { LocationSelector } from "@/components/listing/LocationSelector"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Filter, X } from "lucide-react"

export const metadata: Metadata = {
  title: "Listings | Aswaq",
  description: "Browse all listings on Aswaq",
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
}

export default async function ListingsPage({ searchParams }: PageProps) {
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

  // Convert page to number and validate
  const page = Number(pageParam) || 1
  
  // Get the listings with price filters
  const { listings, totalPages } = await getListings({
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
  const params = new URLSearchParams()
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
      params.set(key, value)
    }
  })

  const categoryParams = params.toString()
  const allCategoriesHref = `/listings${categoryParams ? `?${categoryParams}` : ''}`

  const categories = await getCategories()

  const hasActiveFilters = categoryParam || searchParam || sortParam || minPriceParam || maxPriceParam || countryParam || cityParam

  // Transform listing data to match the Listing interface expected by FullWidthListingCard
  const formattedListings = listings.map(listing => ({
    id: listing.id,
    user_id: listing.seller_id || listing.user_id, // Handle both property names
    title: listing.title,
    price: listing.price,
    slug: listing.slug,
    images: listing.images || [],
    address: listing.location || listing.address || '',
    created_at: listing.created_at || listing.timestamp || new Date().toISOString(),
    condition: listing.condition,
    contact_methods: listing.contact_methods || ['phone', 'chat', 'whatsapp'],
    phone_number: listing.phone_number || listing.seller_phone_number || '+971501234567', // Add phone number with fallback
    vehicle_details: {
      mileage: typeof listing.mileage === 'string' 
        ? parseInt(listing.mileage.replace(/[^\d]/g, '')) 
        : listing.mileage,
      year: typeof listing.year === 'string'
        ? parseInt(listing.year)
        : listing.year
    }
  }));

  // Sidebar content to be used in both desktop and mobile views
  const FiltersContent = () => (
    <>
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <Link 
            href={allCategoriesHref}
            className={`text-sm block hover:text-primary transition-colors ${
              !categoryParam ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            All Categories
          </Link>
          {categories.map((category) => (
            <div key={category.id} className="space-y-1">
              <Link
                href={`/listings?category=${category.slug}`}
                className={`text-sm block hover:text-primary transition-colors font-medium ${
                  categoryParam === category.slug ? 'text-primary' : 'text-foreground'
                }`}
              >
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Location</h3>
        <LocationSelector />
      </div>

      <PriceFilter />
      
      {hasActiveFilters && (
        <div className="mb-6">
          <Link
            href="/listings"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Clear All Filters
          </Link>
        </div>
      )}
      
      <div className="bg-card p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Want to Start selling here?</h3>
        <p className="text-sm text-muted-foreground mb-3">Gain more money through posting your stuff here. It&apos;s easy & quick</p>
        <Link href="/sell">
          <Button className="px-4 py-2 w-full" size="lg">Sell</Button>
        </Link>
      </div>
    </>
  )

  return (      
    <main className="container py-6 mx-auto px-4 md:px-6">
      <BreadcrumbNav />
      
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
                Filters
                {hasActiveFilters && <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground font-medium">{listings.length} Ads</span>
            <ListingFilters />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-foreground">{listings.length} Ads</span>
            </div>
            <ListingFilters />
          </div>

          {/* Mobile Verification Checkbox */}


          <div className="space-y-4">
            {formattedListings.length > 0 ? (
              formattedListings.map((listing) => (
                <FullWidthListingCard
                  key={listing.id}
                  listing={listing}
                  className="max-w-full"
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium mb-2">No listings found</p>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria</p>
                <Link href="/listings">
                  <Button>View All Listings</Button>
                </Link>
              </div>
            )}
          </div>

          <Pagination 
            totalPages={totalPages} 
            currentPage={page}
          />
        </div>
      </div>
    </main>
  )
}