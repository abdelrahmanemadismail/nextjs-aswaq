// actions/contact-actions.ts
'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

    // Validate form data
    const validatedData = contactFormSchema.parse(data)

    // Get Supabase client
    const supabase = await createClient()

    // Create a contact_submissions table if needed
    // This would be done in a migration script in a real app

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
        status: 'new'
      })

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error
        console.error('Contact submissions table does not exist')
        // In a real app, you might want to create the table here
        // or use a fallback method like sending an email
        return { success: false, error: 'Contact form submission is temporarily unavailable' }
      }
      throw error
    }

    // In a real app, you might also want to:
    // 1. Send an email notification to support staff
    // 2. Send a confirmation email to the user
    
    // Redirect to a thank-you page
    redirect('/contact/thank-you')
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