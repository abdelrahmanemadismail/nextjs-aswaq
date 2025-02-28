// app/admin/pages/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { CreatePageInput } from '@/types/page'
import { getPageById, createPage, updatePage } from '@/actions/page-actions'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, X } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'

interface PageEditorProps {
  params: Promise<{ id: string }>
}

export default function PageEditor({ params }: PageEditorProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const isNew = resolvedParams.id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CreatePageInput>({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    meta_keywords: '',
    is_published: false,
  })

  const loadPage = useCallback(async () => {
    try {
      const page = await getPageById(resolvedParams.id)
      if (page) {
        setFormData({
          title: page.title,
          slug: page.slug,
          content: page.content,
          meta_description: page.meta_description || '',
          meta_keywords: page.meta_keywords || '',
          is_published: page.is_published,
        })
        console.log('Loaded page:', page) // For debugging
      } else {
        toast({
          title: 'Error',
          description: 'Page not found',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading page:', error) // For debugging
      toast({
        title: 'Error',
        description: 'Failed to load page',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    if (!isNew) {
      loadPage()
    } else {
      setLoading(false)
    }
  }, [isNew, loadPage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isNew) {
        await createPage(formData)
      } else {
        await updatePage({
          id: resolvedParams.id,
          ...formData,
        })
      }

      toast({
        title: 'Success',
        description: `Page ${isNew ? 'created' : 'updated'} successfully`,
      })
      router.push('/admin/pages')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isNew ? 'create' : 'update'} page`,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isNew ? 'Create Page' : 'Edit Page'}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/pages')}
            disabled={saving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              required
              pattern="^[a-z0-9-]+$"
              placeholder="url-friendly-slug"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content (MDX)</Label>
            <div data-color-mode="light">
              <MDEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, content: value || '' }))
                }
                height={400}
                preview="edit"
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          {/* Meta Keywords */}
          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Meta Keywords</Label>
            <Input
              id="meta_keywords"
              value={formData.meta_keywords}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_keywords: e.target.value,
                }))
              }
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          {/* Published Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_published: checked }))
              }
            />
            <Label htmlFor="is_published">Published</Label>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}