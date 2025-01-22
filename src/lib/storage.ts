// lib/storage.ts

import { createClient } from '@/utils/supabase/client'

export async function uploadListingImages(files: File[], userId: string) {
  const supabase = createClient()
  const timestamp = Date.now()
  const promises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${timestamp}-${index}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('listings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    return data.path
  })

  return Promise.all(promises)
}

export function getListingImageUrl(path: string) {
  const supabase = createClient()
  return supabase.storage.from('listings').getPublicUrl(path).data.publicUrl
}

export async function uploadCategoryHeroImage(file: File): Promise<string> {
  const supabase = createClient()
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const filePath = `categories/hero/${timestamp}.${fileExt}`
  console.log(filePath)
  console.log(file)
  const { data, error } = await supabase.storage
    .from('categories')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error(error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('categories')
    .getPublicUrl(data.path)

  return publicUrl
}