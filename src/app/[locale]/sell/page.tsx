// app/sell/page.tsx

"use client"

import { ListingFormContainer } from '@/components/listing/sell/ListingFormContainer'
import { ListingFormData } from '@/types/listing'
import { createListing } from '@/actions/listing-actions'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'

export default function SellPage() {
  const router = useRouter()
  const { t, getLocalizedPath } = useTranslation()

  const handleSubmit = async (data: ListingFormData) => {
    try {
      console.log('Submitting data:', data) // Debug log
      const listingSlug = await createListing(data)
      toast({
        title: t.listings.success,
        description: t.listings.listingPublished,
      })
      router.push(getLocalizedPath(`/listings/${listingSlug}`))
    } catch (error) {
      console.error('Error creating listing:', error)
      toast({
        title: t.common.error,
        description: t.listings.failedToCreate,
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