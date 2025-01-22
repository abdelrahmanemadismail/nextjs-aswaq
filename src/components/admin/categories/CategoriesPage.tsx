// components/admin/categories/CategoriesPage.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { CategoryTable } from "./CategoryTable"
import { CategoryStatsCard } from "./CategoryStats"
import { CategoryFiltersBar } from "./CategoryFilters"
import { CategoryFormDialog } from "./CategoryFormDialog"
import { DeleteCategoryDialog } from "./DeleteCategoryDialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminCategories,
  getCategoryStats,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category-admin-actions"
import type {
  AdminCategory,
  CategoryAction,
  CategoryFilters,
  CategoryStats,
} from "@/types/category-admin"
import { z } from "zod"
import { categoryFormSchema } from "@/schemas/category-admin"

export function CategoriesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
    status: "all",
    type: "all",
  })
  
  // Dialog states
  const [formDialog, setFormDialog] = useState({
    open: false,
    category: undefined as AdminCategory | undefined,
    isSubmitting: false,
  })
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: null as AdminCategory | null,
    isDeleting: false,
  })

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [categoriesResponse, statsData] = await Promise.all([
        getAdminCategories(filters),
        getCategoryStats(),
      ])

      if (categoriesResponse.error) {
        throw new Error(categoriesResponse.error)
      }

      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [])
      setStats(statsData)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, filters])

  useEffect(() => {
    void loadData()
  }, [filters, loadData])

  // Handle category actions
  const handleAction = (action: CategoryAction, category: AdminCategory) => {
    switch (action) {
      case "edit":
        setFormDialog({ open: true, category, isSubmitting: false })
        break
      case "delete":
        setDeleteDialog({ open: true, category, isDeleting: false })
        break
      case "toggle-status":
        void handleStatusToggle(category)
        break
    }
  }

  // Handle category form submission
  const handleFormSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      setFormDialog(prev => ({ ...prev, isSubmitting: true }))

      const response = formDialog.category
        ? await updateCategory({ id: formDialog.category.id, ...data })
        : await createCategory(data)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: formDialog.category ? "Category Updated" : "Category Created",
        description: `Successfully ${formDialog.category ? "updated" : "created"} the category.`,
      })

      setFormDialog({ open: false, category: undefined, isSubmitting: false })
      void loadData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${formDialog.category ? "update" : "create"} category`,
        variant: "destructive",
      })
    } finally {
      setFormDialog(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Handle category deletion
  const handleDelete = async () => {
    if (!deleteDialog.category) return

    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }))
      const response = await deleteCategory(deleteDialog.category.id)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Category Deleted",
        description: "Successfully deleted the category.",
      })

      setDeleteDialog({ open: false, category: null, isDeleting: false })
      void loadData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }))
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (category: AdminCategory) => {
    try {
      const response = await updateCategory({
        id: category.id,
        is_active: !category.is_active,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Status Updated",
        description: `Category ${category.is_active ? "deactivated" : "activated"} successfully.`,
      })

      void loadData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Manage your marketplace categories and subcategories
          </p>
        </div>
        <Button
          onClick={() => setFormDialog({ open: true, category: undefined, isSubmitting: false })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoryStatsCard stats={stats || defaultStats} isLoading={isLoading} />

      <div className="space-y-4">
        <CategoryFiltersBar
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="rounded-md border">
          <CategoryTable
            categories={categories}
            onAction={handleAction}
          />
        </div>
      </div>

      <CategoryFormDialog
        open={formDialog.open}
        onOpenChange={(open) =>
          setFormDialog(prev => ({ ...prev, open }))
        }
        category={formDialog.category}
        parentCategories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={formDialog.isSubmitting}
      />

      <DeleteCategoryDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog(prev => ({ ...prev, open }))
        }
        category={deleteDialog.category}
        onConfirm={handleDelete}
        isDeleting={deleteDialog.isDeleting}
      />
    </div>
  )
}

const defaultStats: CategoryStats = {
  total: 0,
  active: 0,
  inactive: 0,
  mainCategories: 0,
  subCategories: 0,
}