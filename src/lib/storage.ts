"use server"
import { createClient } from '@/utils/supabase/client'
import { createClient as supabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// New function to upload a single image for a specific listing
export async function uploadSingleListingImage(
  file: File,
  userId: string,
  listingId: string
): Promise<string> {
  const supabase = createClient()
  const supabaseAdmin = supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false }
    }
  )
  
  // Generate a unique file name using UUID
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  // Use a path structure that includes listing ID for better organization
  const filePath = `${userId}/${listingId}/${fileName}`
  
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('listings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }
    
    const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(data.path)
    return publicUrl
  } catch (error) {
    console.error(`Error uploading image ${file.name}:`, error)
    throw error
  }
}

// New function to upload images in batches
export async function uploadListingImagesInBatches(
  files: File[], 
  userId: string, 
  listingId: string
): Promise<string[]> {
  const imagePaths: string[] = []
  const supabase = createClient()
  
  // Process images in batches of 2
  const batchSize = 2
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    const batchPromises = batch.map(file => uploadSingleListingImage(file, userId, listingId))
    
    try {
      const batchResults = await Promise.all(batchPromises)
      imagePaths.push(...batchResults)
      
      // Update the listing with the images we have so far
      if (imagePaths.length > 0) {
        const { error } = await supabase
          .from('listings')
          .update({ images: imagePaths })
          .eq('id', listingId)
        
        if (error) {
          console.error('Error updating listing with image paths:', error)
        }
      }
    } catch (error) {
      console.error(`Error uploading batch starting at index ${i}:`, error)
      // Continue with other batches even if one fails
    }
  }
  
  return imagePaths
}

// Original function (keep for backward compatibility)
export async function uploadListingImages(files: File[], userId: string) {
  const supabase = createClient()
  const supabaseAdmin = supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false }
    }
  )
  const timestamp = Date.now()
  
  try {
    const promises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      // Use a path structure that matches your RLS policy
      const filePath = `${userId}/${timestamp}-${index}.${fileExt}`
      
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('listings')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          throw error;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(data.path)
        return publicUrl;
      } catch (uploadError) {
        throw uploadError;
      }
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    throw error;
  }
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