// components/admin/listings/ListingTable.tsx
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MoreHorizontal,
  Star,
  StarOff,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { AdminListing, ListingAction } from "@/types/listing-admin"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"

interface ListingTableProps {
  listings: AdminListing[]
  onAction: (action: ListingAction, listing: AdminListing) => void
  isLoading?: boolean
}

export function ListingTable({ 
  listings, 
  onAction,
  isLoading 
}: ListingTableProps) {
  const getStatusBadge = (listing: AdminListing) => {
    if (!listing.is_active) {
      return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" />Inactive</Badge>
    }
    switch (listing.status) {
      case 'sold':
        return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Sold</Badge>
      case 'unavailable':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Unavailable</Badge>
      default:
        return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Active</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Listing</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Listed</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </TableCell>
          </TableRow>
        ) : listings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No listings found
            </TableCell>
          </TableRow>
        ) : (
          listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded overflow-hidden">
                    {listing.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="object-cover h-full w-full"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{listing.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={listing.user.avatar_url || undefined} />
                        <AvatarFallback>
                          {listing.user.full_name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {listing.user.full_name}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {listing.category.name}
              </TableCell>
              <TableCell className="font-medium">
                {formatPrice(listing.price)}
              </TableCell>
              <TableCell>
                {getStatusBadge(listing)}
                {listing.is_featured && (
                  <Badge variant="outline" className="ml-2">
                    <Star className="mr-1 h-3 w-3 fill-primary" />
                    Featured
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  {listing.views_count}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(listing.created_at), 'PPp')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAction("edit", listing)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction("toggle-status", listing)}>
                      {listing.is_active ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction("feature", listing)}>
                      {listing.is_featured ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Remove Feature
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Feature
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onAction("delete", listing)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}