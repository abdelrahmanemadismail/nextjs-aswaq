'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Mark an account for deletion
 * The account will be permanently deleted after 30 days unless the user logs back in
 */
export async function markAccountForDeletion() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Mark the profile for deletion
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw error

  // Sign the user out after marking for deletion
  await supabase.auth.signOut()
  
  return { success: true, message: 'Account marked for deletion. You have 30 days to reactivate your account by logging back in.' }
}

/**
 * Cancel a pending account deletion
 */
export async function cancelAccountDeletion() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Clear the deletion mark
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: null })
    .eq('id', user.id)

  if (error) throw error
  
  return { success: true, message: 'Account deletion cancelled.' }
}

/**
 * Check if the current user's account is marked for deletion
 * Returns the deletion date and days remaining if applicable
 */
export async function checkAccountDeletionStatus() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get the user's profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('deleted_at')
    .eq('id', user.id)
    .single()

  if (error) throw error
  
  if (profile.deleted_at) {
    const deletionDate = new Date(profile.deleted_at)
    const permanentDeletionDate = new Date(deletionDate)
    permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 30)
    
    const now = new Date()
    const daysRemaining = Math.ceil((permanentDeletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      markedForDeletion: true,
      deletionDate: profile.deleted_at,
      permanentDeletionDate: permanentDeletionDate.toISOString(),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    }
  }
  
  return { markedForDeletion: false }
}