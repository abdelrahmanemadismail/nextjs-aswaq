// app/admin/listings/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { ListingStatsCard } from "@/components/admin/listings/ListingStats"
import { ListingFiltersBar } from "@/components/admin/listings/ListingFilters"
import { ListingTable } from "@/components/admin/listings/ListingTable"
import { ListingFormDialog } from "@/components/admin/listings/ListingFormDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  getAdminListings,
  getListingStats,
  updateListing,
  deleteListing,
  toggleListingFeature,
  toggleListingActive
} from "@/actions/listing-admin-actions"
import type { 
  AdminListing, 
  ListingAction, 
  ListingFilters,
  ListingStats
} from "@/types/listing-admin"
import { getCategories } from "@/actions/category-actions"

export default function ListingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<AdminListing[]>([])
  const [stats, setStats] = useState<ListingStats | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters] = useState<ListingFilters>({
    status: "all",
    search: "",
    category: undefined,
    dateRange: undefined
  })

  // Dialog states
  const [formDialog, setFormDialog] = useState({
    open: false,
    listing: undefined as AdminListing | undefined,
    isSubmitting: false,
  })
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    listing: null as AdminListing | null,
    isDeleting: false,
  })

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [listingsResponse, statsData, categoriesData] = await Promise.all([
        getAdminListings(1, 10, filters),
        getListingStats(),
        getCategories()
      ])

      if (listingsResponse.error) {
        throw new Error(listingsResponse.error)
      }

      setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : [])
      setStats(statsData)
      setCategories(categoriesData)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load listings data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, toast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Handle listing actions
  const handleAction = (action: ListingAction, listing: AdminListing) => {
    switch (action) {
      case "edit":
        setFormDialog({ open: true, listing, isSubmitting: false })
        break
      case "delete":
        setDeleteDialog({ open: true, listing, isDeleting: false })
        break
      case "feature":
        void handleFeatureToggle(listing)
        break
      case "toggle-status":
        void handleStatusToggle(listing)
        console.log("toggle status")
        break
      default:
        console.error("Unknown action:", action)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (data: Partial<AdminListing>) => {
    if (!formDialog.listing) return

    try {
      setFormDialog(prev => ({ ...prev, isSubmitting: true }))
      console.log("update listing")
      const response = await updateListing(formDialog.listing.id, data)
      console.log(response)
      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: "Listing updated successfully",
      })

      setFormDialog({ open: false, listing: undefined, isSubmitting: false })
      void loadData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      })
    } finally {
      setFormDialog(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Handle deletion
  const handleDelete = async () => {
    if (!deleteDialog.listing) return

    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }))
      const response = await deleteListing(deleteDialog.listing.id)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      })

      setDeleteDialog({ open: false, listing: null, isDeleting: false })
      void loadData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      })
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }))
    }
  }

  // Handle feature toggle
  const handleFeatureToggle = async (listing: AdminListing) => {
    try {
      const response = await toggleListingFeature(listing.id)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: `Listing ${listing.is_featured ? 'unfeatured' : 'featured'} successfully`,
      })

      void loadData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing feature status",
        variant: "destructive",
      })
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (listing: AdminListing) => {
    try {
      const response = await toggleListingActive(listing.id)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: `Listing ${listing.is_active ? 'deactivated' : 'activated'} successfully`,
      })

      void loadData()
    } catch (error) {
      console.error('Error toggling listing status:', error)
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Listings</h2>
          <p className="text-muted-foreground">
            Manage and monitor all listings across your marketplace
          </p>
        </div>
      </div>

      <ListingStatsCard stats={stats || defaultStats} isLoading={isLoading} />

      <div className="space-y-4">
        <ListingFiltersBar
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
        />

        <div className="rounded-md border">
          <ListingTable
            listings={listings}
            onAction={handleAction}
            isLoading={isLoading}
          />
        </div>
      </div>

      <ListingFormDialog
        open={formDialog.open}
        onOpenChange={(open) =>
          setFormDialog(prev => ({ ...prev, open }))
        }
        listing={formDialog.listing}
        onSubmit={handleFormSubmit}
        isSubmitting={formDialog.isSubmitting}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog(prev => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDialog.isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDialog.isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDialog.isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const defaultStats: ListingStats = {
  total: 0,
  active: 0,
  inactive: 0,
  featured: 0,
  reported: 0,
  today: 0,
}