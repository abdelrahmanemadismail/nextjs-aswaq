'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'
import { prepareSupportNotificationEmail, prepareUserConfirmationEmail } from '@/utils/email-templates'

// Define the schema for contact form validation
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

export type ContactFormData = z.infer<typeof contactFormSchema>

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
const sendSupportNotification = async (formData: ContactFormData) => {
  const transporter = await createTransporter()
  if (!transporter) return false

  const supportEmail = process.env.SUPPORT_EMAIL || 'support@aswaq.online'
  const systemFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@aswaq.online'

  try {
    // Use format "User Name <noreply@aswaq.online>" to make it appear from the user
    // while actually sending from your system email
    const fromName = `${formData.firstName} ${formData.lastName}`
    
    const html = await prepareSupportNotificationEmail(formData)
    
    await transporter.sendMail({
      from: `"${fromName}" <${systemFromEmail}>`,
      replyTo: formData.email,
      to: supportEmail,
      subject: `New Contact Form Submission: ${formData.subject}`,
      html
    })
    return true
  } catch (error) {
    console.error('Failed to send support notification email:', error)
    return false
  }
}

// Send confirmation email to the user
const sendUserConfirmation = async (formData: ContactFormData, locale: string = 'en') => {
  const transporter = await createTransporter()
  if (!transporter) return false

  // Simple localization for confirmation email
  const translations = {
    en: {
      subject: 'Thank you for contacting Aswaq Online',
      greeting: `Dear {{firstName}},`,
      message: 'Thank you for contacting Aswaq Online. We have received your message and will get back to you as soon as possible.',
      reference: 'For your reference, here is a copy of your message:',
      closing: 'Best regards,',
      team: 'The Aswaq Online Team'
    },
    ar: {
      subject: 'شكراً للتواصل مع أسواق أونلاين',
      greeting: `عزيزي {{firstName}}،`,
      message: 'شكراً للتواصل مع أسواق أونلاين. لقد استلمنا رسالتك وسنرد عليك في أقرب وقت ممكن.',
      reference: 'للرجوع إليها، إليك نسخة من رسالتك:',
      closing: 'مع أطيب التحيات،',
      team: 'فريق أسواق أونلاين'
    }
  }

  try {
    const html = await prepareUserConfirmationEmail(formData, locale, translations)

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      replyTo: process.env.SUPPORT_EMAIL,
      to: formData.email,
      subject: translations[locale as keyof typeof translations].subject,
      html
    })
    return true
  } catch (error) {
    console.error('Failed to send user confirmation email:', error)
    return false
  }
}

export async function submitContactForm(formData: FormData) {
  try {
    // Extract form data
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string
    }

    // Get locale from form data or default to 'en'
    const locale = (formData.get('locale') as string) || 'en'

    // Validate form data
    const validatedData = contactFormSchema.parse(data)

    // Get Supabase client
    const supabase = await createClient()

    // Store submission in database
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        status: 'new',
        locale: locale
      })

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error
        console.error('Contact submissions table does not exist')
        // In a real app, you might want to create the table here
        // or use a fallback method like sending an email

        // Even if table doesn't exist, try to send emails
        await Promise.all([
          sendSupportNotification(validatedData),
          sendUserConfirmation(validatedData, locale)
        ])
        
        // Redirect to the thank you page even if DB storage failed
        redirect(`/${locale}/contact/thank-you`)
      }
      throw error
    }

    // Send email notifications
    const [supportEmailSent, userEmailSent] = await Promise.all([
      sendSupportNotification(validatedData),
      sendUserConfirmation(validatedData, locale)
    ])

    // Log email sending results but don't fail if emails weren't sent
    if (!supportEmailSent) {
      console.warn('Failed to send support notification email')
    }
    
    if (!userEmailSent) {
      console.warn('Failed to send user confirmation email')
    }
    
    // Redirect to the thank you page
    // redirect(`/${locale}/contact/thank-you`)
    return {success: true}
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { 
      success: false, 
      error: error instanceof z.ZodError 
        ? error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        : 'Failed to submit contact form'
    }
  }
}