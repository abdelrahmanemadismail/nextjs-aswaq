'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LanguageType } from '@/i18n.config'

export async function googleLogin() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  })

  if (error) {
    console.error('Auth error:', error.message)
    return { error: error.message }
  }

  if (data?.url) {
    redirect(data.url)
  }

  return { error: 'No URL returned from authentication' }
}

export async function updatePreferredLanguage({ preferredLanguage }: { preferredLanguage: LanguageType }) {
  try {
    const supabase = await createClient()
    
    // Get current session to ensure user is logged in
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }
    
    // Update user metadata with new preferred language
    const { data, error } = await supabase.auth.updateUser({
      data: {
        preferred_language: preferredLanguage
      }
    })
    
    if (error) {
      throw error
    }
    
    // Also update the profiles table to keep it in sync
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ preferred_language: preferredLanguage })
      .eq('id', session.user.id)
    
    if (profileError) {
      throw profileError
    }
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error updating preferred language:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function signUpWithEmailPassword({ email, phoneNumber, password, fullName, preferredLanguage }: { email: string; phoneNumber:string; password: string, fullName: string, preferredLanguage:LanguageType }) {
  const supabase = await createClient()
  const res = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        preferred_language: preferredLanguage
      },
    },
  })
  return JSON.stringify(res)
}

export async function resendEmailConfirmation({ email, type }: { email: string, type: 'signup' | 'email_change' }) {
  const supabase = await createClient()
  const res = await supabase.auth.resend({
    type: type,
    email: email,
  })
  return JSON.stringify(res)
}

export async function changeEmail({email}: {email: string}) {
  const supabase = await createClient()
  const res = await supabase.auth.updateUser({
    email: email,
  })
  return JSON.stringify(res)
}

export async function addPhoneToUser({ phone }: { phone: string }) {
  const supabase = await createClient()
  const res = await supabase.auth.updateUser({
    phone: phone,
  })  
  return JSON.stringify(res)
}

export async function phoneLogin({phone}: {phone: string}) {
  const supabase = await createClient()

  const res = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'whatsapp',
      shouldCreateUser: false,
    }
  })

  console.log(res)
  return JSON.stringify(res)
}

export async function verifyPhone({phone, token}: {phone: string, token: string}) {
  const supabase = await createClient()
  const res = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })
  return JSON.stringify(res)
}

export async function signInWithPassword({ email, password }: { email: string; password: string }) {
  const supabase = await createClient()
  const res = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return JSON.stringify(res)
}

export async function resetPasswordForEmail({ email }: { email: string }) {
  const supabase = await createClient()
  const res = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/auth/reset-password',
  })
  return JSON.stringify(res)
}

export async function updatePassword({ password }: { password: string }) {
  const supabase = await createClient()
  const res = await supabase.auth.updateUser({
    password: password,
  })
  return JSON.stringify(res)
}

export async function getUser() {
  const supabase = await createClient()
  const res = await supabase.auth.getUser()
  return res
}

export const signOut = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return true
}