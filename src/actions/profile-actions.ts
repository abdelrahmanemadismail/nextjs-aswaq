'use server'

import { createClient } from '@/utils/supabase/server'
import { UserProfile } from '@/types/profile'

export async function getUserProfile() {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
  
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (error) throw error
    profile.phone_number = `+${user.phone}`
    profile.email = user.email
    return profile as UserProfile
  }

export async function updateUserProfile(profile: Partial<UserProfile>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

export async function getUserRole() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      role:roles (
        name,
        description
      )
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  
  // If no role is found, try to create a default 'personal' role for the user
  if (!data) {
    try {
      // Get the personal role ID
      const { data: personalRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'user')
        .single()
      
      if (personalRole) {
        // Insert the default role for the user
        const { data: newUserRole, error: insertError } = await supabase
          .from('user_roles')
          .insert({
            id: user.id,
            role_id: personalRole.id
          })
          .select(`
            *,
            role:roles (
              name,
              description
            )
          `)
          .single()
        
        if (insertError) throw insertError
        return newUserRole
      }
    } catch (createError) {
      console.error('Failed to create default role:', createError)
    }
  }
  
  return data
}

export async function uploadProfileImage(file: File) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Upload image
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  return updateUserProfile({ avatar_url: publicUrl })
}

export async function deleteProfileImage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    const path = new URL(profile.avatar_url).pathname.split('avatars/')[1]
    if (path) {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([path])
      
      if (deleteError) throw deleteError
    }
  }

  return updateUserProfile({ avatar_url: null })
}