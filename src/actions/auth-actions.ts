'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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


export async function signUpWithEmailPassword({ email, phoneNumber, password, fullName }: { email: string; phoneNumber:string; password: string, fullName: string }) {
  const supabase = await createClient()
  const res = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
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