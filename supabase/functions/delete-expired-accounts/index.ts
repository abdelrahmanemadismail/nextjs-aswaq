/**
 * This file should be deployed as a Supabase Edge Function that runs on a schedule.
 * It calls the permanently_delete_inactive_accounts() function to delete accounts
 * that have been marked for deletion for more than 30 days.
 * 
 * Setup steps:
 * 1. Create a new Edge Function in your Supabase project
 * 2. Add this code to the function
 * 3. Deploy the function
 * 4. Set up a CRON job to run the function daily
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey: string = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

export const deleteExpiredAccounts = async (): Promise<Response> => {
  try {
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Call the SQL function we created to handle the account deletion
    const { error } = await supabase.rpc('permanently_delete_inactive_accounts')
    
    if (error) throw error
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Expired accounts deletion process completed successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error: any) {
    console.error('Error deleting expired accounts:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

// For Supabase Edge Functions
Deno.serve(deleteExpiredAccounts) 