// components/admin/categories/CategoryFormDialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "./CategoryForm"
import type { AdminCategory } from "@/types/category-admin"
import { z } from "zod"
import { categoryFormSchema } from "@/schemas/category-admin"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: AdminCategory
  parentCategories?: AdminCategory[]
  onSubmit: (data: z.infer<typeof categoryFormSchema>) => Promise<void>
  isSubmitting?: boolean
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentCategories,
  onSubmit,
  isSubmitting,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update the details of an existing category"
              : "Create a new category in your hierarchy"}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          parentCategories={parentCategories}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}