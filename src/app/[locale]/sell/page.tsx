// app/sell/page.tsx

"use client"

import { ListingFormContainer } from '@/components/listing/ListingFormContainer'
import { ListingFormData } from '@/types/listing'
import { createListing } from '@/actions/listing-actions'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export default function SellPage() {
  const router = useRouter()

  const handleSubmit = async (data: ListingFormData) => {
    try {
      console.log('Submitting data:', data) // Debug log
      const listingSlug = await createListing(data)
      toast({
        title: "Success!",
        description: "Your listing has been published.",
      })
      router.push(`/listings/${listingSlug}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="py-10">
      <ListingFormContainer onSubmit={handleSubmit} />
    </div>
  )
}