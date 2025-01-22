// components/admin/categories/CategoryForm.tsx
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { categoryFormSchema } from "@/schemas/category-admin"
import type { AdminCategory } from "@/types/category-admin"
import { slugify } from "@/lib/utils"
import { z } from "zod"
import { uploadCategoryHeroImage } from '@/lib/storage'
import { ImageUpload } from "@/components/ui/image-upload"
import { X } from "lucide-react"
import Image from "next/image"

interface CategoryFormProps {
  category?: AdminCategory
  parentCategories?: AdminCategory[]
  onSubmit: (data: z.infer<typeof categoryFormSchema>) => Promise<void>
  isSubmitting?: boolean
}

export function CategoryForm({
  category,
  parentCategories = [],
  onSubmit,
  isSubmitting = false,
}: CategoryFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      icon: category?.icon || "",
      parent_id: category?.parent_id || null,
      display_order: category?.display_order || 0,
      is_active: category?.is_active ?? true,
      display_in_header: category?.display_in_header ?? false,
      display_in_hero: category?.display_in_hero ?? false,
      display_in_home: category?.display_in_home ?? false,
      hero_image: category?.hero_image || null,
    },
  })

  // Auto-generate slug from name
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        const slug = slugify(value.name)
        form.setValue("slug", slug)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      console.log(file)
      const imageUrl = await uploadCategoryHeroImage(file)
      form.setValue('hero_image', imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      // Handle error
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="category-slug" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly version of the name. Will be auto-generated.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Category description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentCategories.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input placeholder="Icon name" {...field} />
              </FormControl>
              <FormDescription>
                Name of the Lucide icon to use. <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">See all icons here</a>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Active
                </FormLabel>
                <FormDescription>
                  Activate or deactivate this category
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_in_header"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Display in Header
                </FormLabel>
                <FormDescription>
                  Show this category in the site header navigation
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_in_hero"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Display in Hero
                </FormLabel>
                <FormDescription>
                  Feature this category in the homepage hero section
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('display_in_hero') && (
          <FormField
            control={form.control}
            name="hero_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {field.value && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        <Image
                          src={field.value}
                          alt="Hero image"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => form.setValue('hero_image', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <ImageUpload
                      onUpload={handleImageUpload}
                      isUploading={isUploading}
                      accept={{
                        'image/jpeg': [],
                        'image/jpg': [],
                        'image/png': [],
                        'image/webp': []
                      }}
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Upload an image for the hero section (max 5MB, JPG, PNG or WebP)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Form>
  )
}