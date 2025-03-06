// services/temp-image-service.ts
"use server"

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { createClient as supabaseClient } from '@supabase/supabase-js'

interface TempImageMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  createdAt: string;
}

// Upload images to a temporary location with session ID
export async function uploadTempImages(files: File[]): Promise<TempImageMetadata[]> {
  const supabase = await createClient()
  
  // Get user session to associate uploads with this user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Create a session ID for this form submission if it doesn't exist
  const cookieStore = await cookies()
  let formSessionId = cookieStore.get('form_session_id')?.value
  
  if (!formSessionId) {
    formSessionId = uuidv4()
    // Set cookie for 24 hours
    cookieStore.set('form_session_id', formSessionId as string, { 
      maxAge: 60 * 60 * 24,
      path: '/'
    })
  }
  
  // Upload each file to a temp directory with the session ID
  const uploadPromises = files.map(async (file) => {
    const timestamp = Date.now()
    const fileId = uuidv4()
    const fileExt = file.name.split('.').pop()
    const fileName = `${fileId}-${timestamp}.${fileExt}`
    const filePath = `temp/${user.id}/${formSessionId}/${fileName}`
    const supabaseAdmin = supabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { persistSession: false }
        }
      )
    const { data, error } = await supabaseAdmin.storage
      .from('listings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
    
    if (error) {
      console.error('Error uploading temp file:', error)
      throw error
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(data.path)
    
    // Return metadata about the uploaded file
    return {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: publicUrl,
      createdAt: new Date().toISOString()
    }
  })
  
  try {
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Failed to upload temporary images:', error)
    throw error
  }
}

// Get temporary images for the current session
export async function getTempImages(): Promise<TempImageMetadata[]> {
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Get the session ID from cookie
  const cookieStore = await cookies()
  const formSessionId = cookieStore.get('form_session_id')?.value
  
  if (!formSessionId) {
    return [] // No session ID, so no temp images
  }
  
  // List files in the temp directory for this user and session
  const prefix = `temp/${user.id}/${formSessionId}/`
  const { data, error } = await supabase.storage
    .from('listings')
    .list(prefix)
  
  if (error) {
    console.error('Error listing temp files:', error)
    throw error
  }
  
  // Return metadata for each file
  return (data || []).map(file => {
    const fileId = file.name.split('-')[0]
    const fileExt = file.name.split('.').pop()
    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(`${prefix}${file.name}`)
    
    return {
      id: fileId,
      fileName: file.name,
      fileSize: file.metadata?.size || 0,
      fileType: fileExt ? `image/${fileExt}` : 'application/octet-stream',
      url: publicUrl,
      createdAt: file.created_at || new Date().toISOString()
    }
  })
}

// Delete temporary images
export async function deleteTempImages(imageIds: string[]): Promise<void> {
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Get the session ID from cookie
  const cookieStore = await cookies()
  const formSessionId = cookieStore.get('form_session_id')?.value
  
  if (!formSessionId) {
    return // No session ID, so nothing to delete
  }
  
  // List files in the temp directory for this user and session
  const prefix = `temp/${user.id}/${formSessionId}/`
  const { data, error } = await supabase.storage
    .from('listings')
    .list(prefix)
  
  if (error) {
    console.error('Error listing temp files for deletion:', error)
    throw error
  }
  
  // Filter files that match the provided IDs
  const filesToDelete = (data || [])
    .filter(file => imageIds.some(id => file.name.startsWith(id)))
    .map(file => `${prefix}${file.name}`)
  
  if (filesToDelete.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from('listings')
      .remove(filesToDelete)
    
    if (deleteError) {
      console.error('Error deleting temp files:', deleteError)
      throw deleteError
    }
  }
}

// Convert temporary images to final storage location when submitting form
export async function moveTempImagesToFinal(userId: string): Promise<string[]> {
  const supabase = await createClient()
  
  // Get the session ID from cookie
  const cookieStore = await cookies()
  const formSessionId = cookieStore.get('form_session_id')?.value
  
  if (!formSessionId) {
    return [] // No session ID, so no temp images to move
  }
  
  // List all temporary files for this session
  const prefix = `temp/${userId}/${formSessionId}/`
  const { data, error } = await supabase.storage
    .from('listings')
    .list(prefix)
  
  if (error) {
    console.error('Error listing temp files for moving:', error)
    throw error
  }
  
  // No files to move
  if (!data || data.length === 0) {
    return []
  }
  
  // Move each file to the permanent location
  const timestamp = Date.now()
  const movePromises = data.map(async (file, index) => {
    const fileExt = file.name.split('.').pop()
    const destinationPath = `${userId}/${timestamp}-${index}.${fileExt}`
    
    const { error: moveError } = await supabase.storage
      .from('listings')
      .move(`${prefix}${file.name}`, destinationPath)
    
    if (moveError) {
      console.error(`Error moving file ${file.name}:`, moveError)
      throw moveError
    }
    
    // Return the public URL of the moved file
    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(destinationPath)
    
    return publicUrl
  })
  
  try {
    // Get all the public URLs of the moved files
    const publicUrls = await Promise.all(movePromises)
    
    // Clear the session cookie since we've moved all files
    cookieStore.delete('form_session_id')
    
    return publicUrls
  } catch (error) {
    console.error('Failed to move temporary images:', error)
    throw error
  }
}