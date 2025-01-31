import { Metadata } from "next"
import Header from "@/components/Header"
import CategoryBar from "@/components/CategoryBar"
import FullWidthListingCard from "@/components/FullWidthListingCard"
import { getListings } from "@/actions/listing-display-actions"
import BreadcrumbNav from "@/components/BreadcrumbNav"
import { Pagination } from "@/components/Pagination"
import { ListingFilters } from "@/components/listing/ListingFilters"
import { getCategories } from "@/actions/category-actions"
import Link from "next/link"
import { PriceFilter } from '@/components/listing/PriceFilter'
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Listings | Aswaq",
  description: "Browse all listings on Aswaq",
}

interface PageProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const {
    page: pageParam,
    category: categoryParam,
    search: searchParam,
    sort: sortParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam
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
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined
  })

  // Create base params for "All Categories" link
  const params = new URLSearchParams()
  // Create a clean object without undefined values
  const cleanParams = {
    page: pageParam,
    search: searchParam,
    sort: sortParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam
  }
  
  Object.entries(cleanParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const categoryParams = params.toString()
  const allCategoriesHref = `/listings${categoryParams ? `?${categoryParams}` : ''}`

  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryBar />
      
      <main className="container py-6 mx-auto">
        <BreadcrumbNav />
        <div className="flex gap-6 mt-6">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
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
              <select className="w-full p-2 border rounded bg-background">
                <option>Egypt</option>
                {/* Add other locations */}
              </select>
            </div>

            <PriceFilter />
            {/* Only show clear filters if there are active filters */}
            {(categoryParam || searchParam || sortParam || minPriceParam || maxPriceParam) && (
              <Link
                href="/listings"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Clear Filters
              </Link>
            )}
            <div className="bg-card p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Want to Start selling here?</h3>
              <p className="text-sm text-muted-foreground mb-3">Gain more money through posting your stuff here. It&apos;s easy & quick</p>
              <Link href="/sell">
                <Button className="px-4 py-2 w-full" size="lg">Sell</Button>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-foreground">{listings.length} Ads</span>
                <input type="checkbox" />
                <span className="text-sm text-muted-foreground">Show Verified Accounts first</span>
              </div>
              <div className="flex items-center gap-4">
                <ListingFilters />
              </div>
            </div>

            <div className="space-y-4">
              {listings.map((listing) => (
                <FullWidthListingCard
                  key={listing.id}
                  photos={listing.images}
                  title={listing.title}
                  slug={listing.slug}
                  price={listing.price}
                  location={listing.location}
                  timestamp={listing.created_at}
                />
              ))}
            </div>

            <Pagination 
              totalPages={totalPages} 
              currentPage={page}
            />
          </div>
        </div>
      </main>
    </div>
  )
}