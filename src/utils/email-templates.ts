import fs from 'fs/promises'
import path from 'path'
import { ContactFormData } from '@/actions/contact-actions'

// Type for template variables
type TemplateVariables = Record<string, string | number>

// Function to load and render email template
export async function renderEmailTemplate(
  templateName: string,
  variables: TemplateVariables
): Promise<string> {
  try {
    // Read template file
    const templatePath = path.join(process.cwd(), 'src', 'email-templates', templateName)
    const template = await fs.readFile(templatePath, 'utf-8')

    // Replace all variables in the template
    return Object.entries(variables).reduce((html, [key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      return html.replace(regex, String(value))
    }, template)
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error)
    throw error
  }
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

  return renderEmailTemplate('support-notification.html', variables)
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

  return renderEmailTemplate('user-confirmation.html', variables)
} 