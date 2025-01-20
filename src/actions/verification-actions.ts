'use server'

import { createClient } from '@/utils/supabase/server'
import { VerificationRequest, CreateVerificationRequest } from '@/types/verification'

export async function submitVerificationRequest(
  documentType: 'id' | 'passport',
  files: File[],
  documentNumber: string,
  documentExpiry: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Upload all documents
  const documentUrls: string[] = []
  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('verification_docs')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // const { data: { publicUrl } } = supabase.storage
    //   .from('verification_docs')
    //   .getPublicUrl(filePath)
    
    documentUrls.push(filePath)
  }

  // Create verification request
  const verificationData: CreateVerificationRequest = {
    user_id: user.id,
    document_type: documentType,
    document_urls: documentUrls,
    document_number: documentNumber,
    document_expiry: documentExpiry,
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .insert(verificationData)
    .select()
    .single()

  if (error) throw error

  // Update user's verification status to pending
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ verification_status: 'pending' })
    .eq('id', user.id)

  if (updateError) throw updateError

  return data as VerificationRequest
}

export async function getVerificationRequest() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('verification_requests')
    .select()
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return data as VerificationRequest | null
}

export async function cancelVerificationRequest() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get verification request to get document URLs
  const { data: request } = await supabase
    .from('verification_requests')
    .select('document_urls')
    .eq('user_id', user.id)
    .single()

  if (request?.document_urls) {
    // Delete documents from storage
    for (const url of request.document_urls) {
      const path = new URL(url).pathname.split('verification_docs/')[1]
      if (path) {
        const { error: deleteError } = await supabase.storage
          .from('verification_docs')
          .remove([path])
        
        if (deleteError) throw deleteError
      }
    }
  }

  // Delete verification request
  const { error: deleteError } = await supabase
    .from('verification_requests')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) throw deleteError

  // Reset verification status
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ verification_status: 'unverified' })
    .eq('id', user.id)

  if (updateError) throw updateError

  return true
}