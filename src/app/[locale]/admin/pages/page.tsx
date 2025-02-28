'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Page } from '@/types/page'
import { getPages, deletePage, publishPage } from '@/actions/page-actions'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const data = await getPages()
      setPages(data)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePage(id)
      await loadPages()
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async (id: string, publish: boolean) => {
    try {
      await publishPage(id, publish)
      await loadPages()
      toast({
        title: 'Success',
        description: `Page ${publish ? 'published' : 'unpublished'} successfully`,
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update page status',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button onClick={() => router.push('/admin/pages/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>
                  <Badge
                    variant={page.is_published ? 'default' : 'secondary'}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(page.updated_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/pages/${page.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/${page.slug}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePublish(page.id, !page.is_published)}
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(page.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}