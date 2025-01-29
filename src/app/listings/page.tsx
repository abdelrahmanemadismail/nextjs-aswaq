import { Metadata } from "next"
import Header from "@/components/Header"
import CategoryBar from "@/components/CategoryBar"
import ListingCard from "@/components/ListingCard"
import { getListings } from "@/actions/listing-display-actions"
import BreadcrumbNav from "@/components/BreadcrumbNav"
import { Pagination } from "@/components/Pagination"
import { ListingFilters } from "@/components/listing/ListingFilters"

export const metadata: Metadata = {
  title: "Listings | Aswaq",
  description: "Browse all listings on Aswaq",
}

interface ListingsPageProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
    sort?: string
  }
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const page = parseInt(searchParams.page || "1")
  const { listings, totalPages } = await getListings({
    page,
    category: searchParams.category,
    search: searchParams.search,
    sort: searchParams.sort as 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | undefined,
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryBar />
      
      <main className="container py-6 mx-auto">
        <BreadcrumbNav />
        <ListingFilters />

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
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
      </main>
    </div>
  )
}