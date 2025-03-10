import { ContactFormData } from '@/actions/contact-actions'
import { VerificationRequest } from '@/types/verification'
import { 
  supportNotificationTemplate,
  userConfirmationTemplate,
  verificationRequestTemplate,
  verificationStatusTemplate
} from './email-template-strings'

// Type for template variables
type TemplateVariables = Record<string, string | number>

// Types for verification email translations
type VerificationTranslation = {
  approved: {
    title: string
    greeting: string
    message: string
    actionLabel: string
    closing: string
    team: string
  }
  rejected: {
    title: string
    greeting: string
    message: string
    rejectionReasonLabel: string
    adminNotesLabel: string
    actionLabel: string
    closing: string
    team: string
  }
}

type VerificationTranslations = {
  en: VerificationTranslation
  ar: VerificationTranslation
}

// Function to render email template
function renderEmailTemplate(
  template: string,
  variables: TemplateVariables
): string {
  // Replace all variables in the template
  return Object.entries(variables).reduce((html, [key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    return html.replace(regex, String(value))
  }, template)
}

// Function to prepare support notification email
export async function prepareSupportNotificationEmail(formData: ContactFormData): Promise<string> {
  const variables = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone || 'Not provided',
    subject: formData.subject,
    message: formData.message.replace(/\n/g, '<br>')
  }

  return renderEmailTemplate(supportNotificationTemplate, variables)
}

// Function to prepare user confirmation email
export async function prepareUserConfirmationEmail(
  formData: ContactFormData,
  locale: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translations: Record<string, any>
): Promise<string> {
  const t = translations[locale as keyof typeof translations]
  const isRtl = locale === 'ar'
  
  const variables = {
    locale,
    direction: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
    borderSide: isRtl ? 'right' : 'left',
    subject: t.subject,
    greeting: t.greeting.replace('{{firstName}}', formData.firstName),
    message: t.message,
    reference: t.reference,
    formSubject: formData.subject,
    formMessage: formData.message.replace(/\n/g, '<br>'),
    closing: t.closing,
    team: t.team,
    year: new Date().getFullYear(),
    copyright: isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved',
    automatedMessage: isRtl 
      ? 'هذه رسالة آلية من نظام الإشعارات الآمن الخاص بنا.'
      : 'This is an automated message from our secure notification system.'
  }

  return renderEmailTemplate(userConfirmationTemplate, variables)
}

// Function to prepare verification request notification email
export async function prepareVerificationRequestEmail(
  request: VerificationRequest,
  userName: string,
  adminUrl: string
): Promise<string> {
  const variables = {
    userName,
    documentType: request.document_type,
    documentExpiry: new Date(request.document_expiry).toLocaleDateString(),
    adminUrl,
    year: new Date().getFullYear()
  }

  return renderEmailTemplate(verificationRequestTemplate, variables)
}

// Function to prepare verification status update email
export async function prepareVerificationStatusEmail(
  request: VerificationRequest,
  userName: string,
  locale: string = 'en'
): Promise<string> {
  const isRtl = locale === 'ar'
  const translations: VerificationTranslations = {
    en: {
      approved: {
        title: 'Verification Request Approved',
        greeting: `Dear ${userName},`,
        message: 'Your verification request has been approved. You can now access all verified user features.',
        actionLabel: 'Go to Dashboard',
        closing: 'Best regards,',
        team: 'The Aswaq Online Team'
      },
      rejected: {
        title: 'Verification Request Rejected',
        greeting: `Dear ${userName},`,
        message: 'Unfortunately, your verification request has been rejected.',
        rejectionReasonLabel: 'Reason for Rejection',
        adminNotesLabel: 'Additional Notes',
        actionLabel: 'Submit New Request',
        closing: 'Best regards,',
        team: 'The Aswaq Online Team'
      }
    },
    ar: {
      approved: {
        title: 'تم قبول طلب التحقق',
        greeting: `عزيزي ${userName}،`,
        message: 'تم قبول طلب التحقق الخاص بك. يمكنك الآن الوصول إلى جميع ميزات المستخدم المتحقق منه.',
        actionLabel: 'الذهاب إلى لوحة التحكم',
        closing: 'مع أطيب التحيات،',
        team: 'فريق أسواق أونلاين'
      },
      rejected: {
        title: 'تم رفض طلب التحقق',
        greeting: `عزيزي ${userName}،`,
        message: 'للأسف، تم رفض طلب التحقق الخاص بك.',
        rejectionReasonLabel: 'سبب الرفض',
        adminNotesLabel: 'ملاحظات إضافية',
        actionLabel: 'تقديم طلب جديد',
        closing: 'مع أطيب التحيات،',
        team: 'فريق أسواق أونلاين'
      }
    }
  }

  const status = request.verification_status === 'approved' ? 'approved' : 'rejected'
  const t = translations[locale as keyof typeof translations][status]

  const variables = {
    locale,
    direction: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
    borderSide: isRtl ? 'right' : 'left',
    title: t.title,
    greeting: t.greeting,
    message: t.message,
    rejectionReason: request.rejection_reason || '',
    rejectionReasonLabel: status === 'rejected' ? (t as typeof translations.en.rejected).rejectionReasonLabel : '',
    adminNotes: request.admin_notes || '',
    adminNotesLabel: status === 'rejected' ? (t as typeof translations.en.rejected).adminNotesLabel : '',
    actionUrl: `/dashboard/verifications`,
    actionLabel: t.actionLabel,
    closing: t.closing,
    team: t.team,
    year: new Date().getFullYear(),
    copyright: isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved',
    automatedMessage: isRtl 
      ? 'هذه رسالة آلية من نظام الإشعارات الآمن الخاص بنا.'
      : 'This is an automated message from our secure notification system.'
  }

  return renderEmailTemplate(verificationStatusTemplate, variables)
} 