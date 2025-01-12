'use server'

import { createClient } from '@/utils/supabase/server'
import { EditableBusinessProfile } from '@/types/profile'

export async function uploadBusinessLogo(file: File) {
  const supabase = await createClient()
  
  // Upload to 'logos' bucket with company name as folder
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file)

  if (uploadError) {
    throw new Error('Failed to upload logo')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  return { company_logo: publicUrl }
}

export async function updateBusinessProfile(profile: EditableBusinessProfile) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('business_profiles')
    .update({
      business_name: profile.business_name,
      company_logo: profile.company_logo,
      trade_license_number: profile.trade_license_number,
      trade_license_expiry: profile.trade_license_expiry,
      company_address: profile.company_address,
      company_phone: profile.company_phone,
      company_email: profile.company_email,
      tax_registration_number: profile.tax_registration_number,
      business_category: profile.business_category
    })
    .eq('id', (await supabase.auth.getUser()).data.user?.id)

  if (error) {
    throw new Error('Failed to update business profile')
  }

  return true
}

export async function deleteBusinessLogo() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user found')

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('company_logo')
    .eq('id', user.id)
    .single()

  if (profile?.company_logo) {
    // Extract filename from URL
    const fileName = profile.company_logo.split('/').pop()
    if (fileName) {
      const { error } = await supabase.storage
        .from('logos')
        .remove([fileName])

      if (error) {
        throw new Error('Failed to delete logo')
      }
    }
  }

  return true
}