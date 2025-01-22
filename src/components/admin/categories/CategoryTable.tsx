// components/admin/categories/CategoryTable.tsx
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash,
  Ban,
} from "lucide-react"
import { type AdminCategory, type CategoryAction } from "@/types/category-admin"
import { getIcon } from '@/lib/utils'

interface CategoryTableProps {
  categories: AdminCategory[]
  onAction: (action: CategoryAction, category: AdminCategory) => void
}

export function CategoryTable({ categories, onAction }: CategoryTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  const toggleRow = (categoryId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(categoryId)) {
      newExpandedRows.delete(categoryId)
    } else {
      newExpandedRows.add(categoryId)
    }
    setExpandedRows(newExpandedRows)
  }

  const renderCategoryRow = (category: AdminCategory, level = 0) => {
    const hasSubcategories = category.subCategories && category.subCategories.length > 0
    const isExpanded = expandedRows.has(category.id)
    const Icon = getIcon(category.icon)

    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell className="w-4">
            <div className="flex items-center">
              <div style={{ marginLeft: `${level * 24}px` }} />
              {hasSubcategories ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleRow(category.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : (
                <div className="w-8" />
              )}
            </div>
          </TableCell>
          <TableCell className="flex items-center gap-2"> {Icon && <Icon className="h-4 w-4 text-primary" />} {category.name}</TableCell>
          <TableCell className="font-mono">{category.slug}</TableCell>
          <TableCell>
            <Badge variant={category.is_active ? "default" : "secondary"}>
              {category.is_active ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          <TableCell>{category.display_order}</TableCell>
          <TableCell>
            <Badge variant={category.display_in_header ? "default" : "secondary"}>
              {category.display_in_header ? "Yes" : "No"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant={category.display_in_hero ? "default" : "secondary"}>
              {category.display_in_hero ? "Yes" : "No"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant={category.display_in_home ? "default" : "secondary"}>
              {category.display_in_home ? "Yes" : "No"}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction("edit", category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("toggle-status", category)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {category.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("delete", category)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {hasSubcategories && isExpanded &&
          category.subCategories!.map(subcategory =>
            renderCategoryRow(subcategory, level + 1)
          )}
      </React.Fragment>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-4">
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Header</TableHead>
          <TableHead>Hero</TableHead>
          <TableHead>Home</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map(category => renderCategoryRow(category))}
      </TableBody>
    </Table>
  )
}