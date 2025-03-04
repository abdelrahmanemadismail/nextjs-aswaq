// lib/storage.ts
"use server"
import { createClient } from '@/utils/supabase/client'
import { createClient as supabaseClient } from '@supabase/supabase-js'

export async function uploadListingImages(files: File[], userId: string) {
  // console.log("Starting image upload for user:", userId);
  // console.log("Number of files to upload:", files.length);
  
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
      // console.log(`Uploading file ${index + 1}/${files.length}: ${file.name}`);
      
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
          // console.error(`Error uploading file ${index + 1}:`, error);
          throw error;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(data.path)
        // console.log(`File ${index + 1} uploaded successfully:`, publicUrl);
        return publicUrl;
      } catch (uploadError) {
        // console.error(`Upload error for file ${index + 1}:`, uploadError);
        throw uploadError;
      }
    });

    const results = await Promise.all(promises);
    // console.log("All files uploaded successfully, paths:", results);
    return results;
  } catch (error) {
    // console.error("Failed to upload images:", error);
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