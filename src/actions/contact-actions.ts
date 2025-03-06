'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'

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
    
    await transporter.sendMail({
      from: `"${fromName}" <${systemFromEmail}>`,
      replyTo: formData.email,
      to: supportEmail,
      subject: `New Contact Form Submission: ${formData.subject}`,
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Form Submission - Aswaq.online</title>
  </head>
  <body
    style="
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #4a5568;
      background-color: #f7fafc;
      margin: 0;
      padding: 20px;
    "
  >
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      bgcolor="#f7fafc"
    >
      <tr>
        <td align="center" valign="top" style="padding: 20px 0;">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="600"
            style="
              max-width: 600px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="padding: 25px 0; background-color: #f8fafc;"
              >
                <!-- Logo placeholder -->
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding: 40px 30px;">
                <h1
                  style="
                    color: #2d3748;
                    font-size: 24px;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-weight: normal;
                  "
                >
                  New Contact Form Submission
                </h1>
                <p style="margin-bottom: 24px; font-size: 16px;">
                  You have received a new message from the aswaq.online contact form.
                </p>
                
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                      <strong style="color: #555555; width: 100px; display: inline-block;">Name:</strong>
                      <span style="color: #333333;">${formData.firstName} ${formData.lastName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                      <strong style="color: #555555; width: 100px; display: inline-block;">Email:</strong>
                      <a href="mailto:${formData.email}" style="color: #006eb8; text-decoration: none;">${formData.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                      <strong style="color: #555555; width: 100px; display: inline-block;">Phone:</strong>
                      <span style="color: #333333;">${formData.phone || 'Not provided'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                      <strong style="color: #555555; width: 100px; display: inline-block;">Subject:</strong>
                      <span style="color: #333333;">${formData.subject}</span>
                    </td>
                  </tr>
                </table>
                
                <div style="margin-top: 25px; text-align: left; width: 100%;">
                  <h2 style="color: #2d3748; font-size: 18px; margin-bottom: 15px; font-weight: normal;">Message:</h2>
                  <div style="padding: 15px; background-color: #f8fafc; border-radius: 4px; white-space: pre-wrap; text-align: left;">
                    ${formData.message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #718096;">
                  This is an automated notification from your website's contact form system.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding: 20px;
                  background-color: #f8fafc;
                  font-size: 12px;
                  color: #718096;
                "
              >
                <p>&copy; 2025 Aswaq</p>
                <p>
                  This is an automated message from our secure notification system.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `,
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
        greeting: `Dear ${formData.firstName},`,
        message: 'Thank you for contacting Aswaq Online. We have received your message and will get back to you as soon as possible.',
        reference: 'For your reference, here is a copy of your message:',
        closing: 'Best regards,',
        team: 'The Aswaq Online Team'
      },
      ar: {
        subject: 'شكراً للتواصل مع أسواق أونلاين',
        greeting: `عزيزي ${formData.firstName}،`,
        message: 'شكراً للتواصل مع أسواق أونلاين. لقد استلمنا رسالتك وسنرد عليك في أقرب وقت ممكن.',
        reference: 'للرجوع إليها، إليك نسخة من رسالتك:',
        closing: 'مع أطيب التحيات،',
        team: 'فريق أسواق أونلاين'
      }
    }
  
    const t = translations[locale as keyof typeof translations] || translations.en
  
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        replyTo: process.env.SUPPORT_EMAIL,
        to: formData.email,
        subject: t.subject,
        html: `
<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.subject}</title>
  </head>
  <body
    dir="${locale === 'ar' ? 'rtl' : 'ltr'}"
    style="
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #4a5568;
      background-color: #f7fafc;
      margin: 0;
      padding: 20px;
    "
  >
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      bgcolor="#f7fafc"
    >
      <tr>
        <td align="center" valign="top" style="padding: 20px 0;">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="600"
            style="
              max-width: 600px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="padding: 25px 0; background-color: #f8fafc; border-top: 4px solid #006eb8; border-radius: 8px 8px 0 0;"
              >
                <!-- Logo placeholder -->
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="${locale === 'ar' ? 'right' : 'left'}" style="padding: 40px 30px;">
                <h1
                  style="
                    color: #2d3748;
                    font-size: 24px;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-weight: normal;
                    text-align: center;
                  "
                >
                  ${t.subject}
                </h1>
                <div style="height: 2px; background-color: #e0e0e0; margin: 0 auto 30px; width: 100px;"></div>
                
                <p style="margin-bottom: 20px; font-size: 16px;">
                  ${t.greeting}
                </p>
                <p style="margin-bottom: 20px; font-size: 16px;">
                  ${t.message}
                </p>
                <p style="margin-bottom: 20px; font-size: 16px;">
                  ${t.reference}
                </p>
                
                <div style="
                  margin: 30px 0;
                  padding: 20px;
                  background-color: #f8fafc;
                  border-${locale === 'ar' ? 'right' : 'left'}: 4px solid #006eb8;
                  border-radius: 4px;
                ">
                  <h3 style="margin-top: 0; color: #006eb8; font-weight: 600;">
                    ${formData.subject}
                  </h3>
                  <div style="white-space: pre-wrap; color: #4a5568;">
                    ${formData.message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <p style="margin-top: 30px; font-size: 16px;">
                  ${t.closing}
                </p>
                <p style="font-weight: 600; color: #006eb8; margin-bottom: 0;">
                  ${t.team}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding: 20px;
                  background-color: #f8fafc;
                  font-size: 12px;
                  color: #718096;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p style="margin-bottom: 5px;">
                  &copy; ${new Date().getFullYear()} Aswaq Online. ${locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
                </p>
                <p style="margin-top: 0;">
                  ${locale === 'ar' ? 'هذه رسالة آلية من نظام الإشعارات الآمن الخاص بنا.' : 'This is an automated message from our secure notification system.'}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
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