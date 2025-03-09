export type VerificationDocumentType = 'id' | 'passport'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationRequest {
  id: string
  user_id: string
  document_type: VerificationDocumentType
  document_urls: string[]
  document_expiry: string
  verification_status: VerificationStatus
  rejection_reason: string | null
  admin_notes: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export type CreateVerificationRequest = Pick<
  VerificationRequest,
  'user_id' | 'document_type' | 'document_urls' | 'document_expiry'
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