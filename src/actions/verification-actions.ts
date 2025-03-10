'use server'

import { createClient } from '@/utils/supabase/server'
import { VerificationRequest, CreateVerificationRequest } from '@/types/verification'
import nodemailer from 'nodemailer'
import { prepareVerificationRequestEmail } from '@/utils/email-templates'

// Create email transporter
const createTransporter = async () => {
  // Get SMTP credentials from environment variables
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL
  } = process.env

  // Validate SMTP configuration
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM_EMAIL) {
    console.error('Missing SMTP configuration')
    return null
  }

  // Create transporter
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  })
}

// Send notification email to support staff
const sendVerificationRequestNotification = async (request: VerificationRequest, userName: string) => {
  const transporter = await createTransporter()
  if (!transporter) return false

  const supportEmail = process.env.SUPPORT_EMAIL || 'support@aswaq.online'
  const systemFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@aswaq.online'
  const adminUrl = process.env.NEXT_PUBLIC_URL ? 
    `${process.env.NEXT_PUBLIC_URL}/admin/verifications` : 
    'http://localhost:3000/admin/verifications'

  try {
    const html = await prepareVerificationRequestEmail(request, userName, adminUrl)
    
    await transporter.sendMail({
      from: systemFromEmail,
      to: supportEmail,
      subject: `New Verification Request - ${userName}`,
      html
    })
    return true
  } catch (error) {
    console.error('Failed to send verification request notification:', error)
    return false
  }
}

export async function submitVerificationRequest(
  documentType: 'id' | 'passport',
  files: File[],
  documentExpiry: string,
  existingRequestId?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's profile to get their name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email || 'User'

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
    
    documentUrls.push(filePath)
  }

  // If we have an existingRequestId, update the existing request
  if (existingRequestId) {
    // First get the existing verification request to access its document URLs
    const { data: existingRequests, error: fetchError } = await supabase
      .from('verification_requests')
      .select('document_urls')
      .eq('id', existingRequestId)
    
    if (fetchError) throw fetchError
    
    // Check if we found the request
    const existingRequest = existingRequests?.[0]
    if (!existingRequest) {
      throw new Error('Verification request not found')
    }

    // Delete old documents if they exist
    if (existingRequest?.document_urls && existingRequest.document_urls.length > 0) {
      for (const url of existingRequest.document_urls) {
        // Only attempt to delete if it's a valid path
        if (url && url.includes('/')) {
          try {
            await supabase.storage
              .from('verification_docs')
              .remove([url])
          } catch (error) {
            console.error('Error deleting old document:', error)
            // Continue with other operations even if deletion fails
          }
        }
      }
    }

    // Update the verification request
    const { data, error } = await supabase
      .from('verification_requests')
      .update({
        document_type: documentType,
        document_urls: documentUrls,
        document_expiry: documentExpiry,
        verification_status: 'pending',
        rejection_reason: null,
        admin_notes: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRequestId)
      .select()
    
    if (error) throw error
    
    // Handle response data
    const updatedRequest = data?.[0]
    if (!updatedRequest) {
      throw new Error('Failed to update verification request')
    }

    // Update user's verification status to pending
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Send notification email
    await sendVerificationRequestNotification(updatedRequest, userName)

    return updatedRequest as VerificationRequest
  } else {
    // Create a new verification request
    const verificationData: CreateVerificationRequest = {
      user_id: user.id,
      document_type: documentType,
      document_urls: documentUrls,
      document_expiry: documentExpiry,
    }

    const { data, error } = await supabase
      .from('verification_requests')
      .insert(verificationData)
      .select()
    
    if (error) throw error
    
    // Handle response data
    const newRequest = data?.[0]
    if (!newRequest) {
      throw new Error('Failed to create verification request')
    }

    // Update user's verification status to pending
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Send notification email
    await sendVerificationRequestNotification(newRequest, userName)

    return newRequest as VerificationRequest
  }
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
  
  if (error) throw error
  
  // Return the first request or null if none found
  return (data && data.length > 0) ? data[0] as VerificationRequest : null
}

export async function cancelVerificationRequest() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get verification request to get document URLs
  const { data, error: fetchError } = await supabase
    .from('verification_requests')
    .select('document_urls')
    .eq('user_id', user.id)
    .limit(1)
  
  if (fetchError) throw fetchError
  
  const request = data?.[0]
  if (request?.document_urls) {
    // Delete documents from storage
    for (const url of request.document_urls) {
      if (url && url.includes('/')) {
        try {
          await supabase.storage
            .from('verification_docs')
            .remove([url])
        } catch (error) {
          console.error('Error deleting document:', error)
          // Continue with other operations even if deletion fails
        }
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