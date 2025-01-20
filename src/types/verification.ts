import { Database } from '@/types/database.types'

export type VerificationDocumentType = 'id' | 'passport' | 'trade_license' | 'other'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationRequest {
  id: string
  user_id: string
  document_type: VerificationDocumentType
  document_urls: string[]
  document_number: string
  document_expiry: string
  verification_status: VerificationStatus | null
  admin_notes: string | null
  rejection_reason: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
  verified_at: string | null
}

export type CreateVerificationRequest = Omit<
  Database['public']['Tables']['verification_requests']['Insert'],
  'id' | 'created_at' | 'updated_at' | 'verified_at' | 'verified_by' | 'verification_status' | 'admin_notes' | 'rejection_reason'
>

export interface UploadVerificationDocuments {
  userId: string
  documentType: VerificationDocumentType
  documentNumber: string
  documentExpiry: string
  files: File[]
}

export interface VerificationResponse {
  data: VerificationRequest | null
  error: string | null
}