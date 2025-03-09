'use server'

import { createClient } from '@/utils/supabase/server'
import {
  VerificationFilters,
  VerificationSort,
  AdminVerificationRequest,
  VerificationStats,
} from '@/types/verification-admin'
import { VerificationRequest } from '@/types/verification'
import nodemailer from 'nodemailer'
import { prepareVerificationStatusEmail } from '@/utils/email-templates'

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

// Send verification status update email
const sendVerificationStatusEmail = async (
  request: AdminVerificationRequest,
  userEmail: string,
  locale: string = 'en'
) => {
  const transporter = await createTransporter()
  if (!transporter) return false

  const systemFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@aswaq.online'

  try {
    const html = await prepareVerificationStatusEmail({
      ...request,
      rejection_reason: request.rejection_reason ?? null,
      admin_notes: request.admin_notes ?? null,
      verified_by: request.verified_by ?? null,
      verified_at: request.verified_at ?? null
    } as VerificationRequest, request.user.full_name, locale)
    
    await transporter.sendMail({
      from: systemFromEmail,
      to: userEmail,
      subject: request.verification_status === 'approved' 
        ? 'Your Verification Request has been Approved'
        : 'Your Verification Request has been Rejected',
      html
    })
    return true
  } catch (error) {
    console.error('Failed to send verification status email:', error)
    return false
  }
}

export async function getVerificationRequests(
  page = 1,
  limit = 10,
  filters?: VerificationFilters,
  search?: string,
  sort?: VerificationSort,
) {
  const supabase = await createClient()
  const start = (page - 1) * limit
  const end = start + limit - 1

  let query = supabase.from('verification_requests').select(`
        *,
        user:profiles!user_id (
          full_name,
          avatar_url
        ),
        verifier:profiles!verified_by (
          full_name,
          avatar_url
        )
      `)

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase()
    query = query.ilike('user.full_name', `%${searchTerm}%`)
  }
  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('verification_status', filters.status)
  }
  if (filters?.documentType && filters.documentType !== 'all') {
    query = query.eq('document_type', filters.documentType)
  }
  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.from.toISOString())
      .lte('created_at', filters.dateRange.to.toISOString())
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, {
      ascending: sort.direction === 'asc',
    })
  } else {
    // Default sort by created_at desc
    query = query.order('created_at', { ascending: false })
  }

  // Get total count for pagination
  const { count } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })

  // Get paginated results
  const { data, error } = await query.range(start, end)

  if (error) throw error
    // Filter out any results where user is null
    const filteredData = (data as AdminVerificationRequest[]).filter(
        request => request.user !== null
      )
  // Generate signed URLs for each document
  const requestsWithUrls = await Promise.all(
    (filteredData as AdminVerificationRequest[]).map(async (request) => {
      // Generate signed URLs for each document URL in the request
      const signedDocUrls = await Promise.all(
        request.document_urls.map(async (doc) => {
          try {
            // Use storage API to generate signed URL
            const { data: signedUrl } = await supabase.storage
              .from('verification_docs')
              .createSignedUrl(doc, 3600) // URL valid for 1 hour
            return signedUrl?.signedUrl || doc
          } catch (err) {
            console.error(`Error generating signed URL for ${doc}:`, err)
            return doc // Fall back to original URL if signing fails
          }
        }),
      )

      // Return request with signed URLs
      return {
        ...request,
        document_urls: signedDocUrls,
      }
    }),
  )
//   console.log(requestsWithUrls)
  return {
    requests: requestsWithUrls,
    total: count || 0,
    page,
    limit,
  }
}

export async function approveVerification(
  requestId: string,
  adminNotes?: string,
) {
  const supabase = await createClient()

  // Get admin user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Update verification request
  const { error: requestError } = await supabase
    .from('verification_requests')
    .update({
      verification_status: 'approved',
      admin_notes: adminNotes,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (requestError) throw requestError

  // Get the verification request with user details
  const { data: verificationRequest } = await supabase
    .from('verification_requests')
    .select(`
      *,
      user:profiles!user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('id', requestId)
    .single()

  if (!verificationRequest) throw new Error('Verification request not found')

  // Get user's email
  const { data: userData } = await supabase
    .from('users')
    .select('email, locale')
    .eq('id', verificationRequest.user_id)
    .single()

  if (!userData) throw new Error('User not found')

  // Update user's verification status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', verificationRequest.user_id)

  if (profileError) throw profileError

  // Send email notification
  await sendVerificationStatusEmail(
    verificationRequest as AdminVerificationRequest,
    userData.email,
    userData.locale || 'en'
  )

  return {
    success: true,
    message: 'Verification request approved successfully',
  }
}

export async function rejectVerification(
  requestId: string,
  rejectionReason: string,
  adminNotes?: string,
) {
  const supabase = await createClient()

  // Get admin user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Update verification request
  const { error: requestError } = await supabase
    .from('verification_requests')
    .update({
      verification_status: 'rejected',
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (requestError) throw requestError

  // Get the verification request with user details
  const { data: verificationRequest } = await supabase
    .from('verification_requests')
    .select(`
      *,
      user:profiles!user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('id', requestId)
    .single()

  if (!verificationRequest) throw new Error('Verification request not found')

  // Get user's email
  const { data: userData } = await supabase
    .from('users')
    .select('email, locale')
    .eq('id', verificationRequest.user_id)
    .single()

  if (!userData) throw new Error('User not found')

  // Update user's verification status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'unverified' })
    .eq('id', verificationRequest.user_id)

  if (profileError) throw profileError

  // Send email notification
  await sendVerificationStatusEmail(
    verificationRequest as AdminVerificationRequest,
    userData.email,
    userData.locale || 'en'
  )

  return {
    success: true,
    message: 'Verification request rejected successfully',
  }
}

export async function addAdminNotes(requestId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('verification_requests')
    .update({ admin_notes: notes })
    .eq('id', requestId)

  if (error) throw error

  return { success: true, message: 'Admin notes updated successfully' }
}

export async function getVerificationStats(): Promise<VerificationStats> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get total counts
  const { count: total } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })

  const { count: pending } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')

  const { count: approved } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'approved')

  const { count: rejected } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'rejected')

  // Get today's submissions
  const { count: todaySubmissions } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  return {
    total: total || 0,
    pending: pending || 0,
    approved: approved || 0,
    rejected: rejected || 0,
    todaySubmissions: todaySubmissions || 0,
  }
}
