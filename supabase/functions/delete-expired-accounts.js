// functions/delete-expired-accounts.ts

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

import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

export const deleteExpiredAccounts = async () => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
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
  } catch (error) {
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

/**
 * Scheduling the function:
 * 
 * Using the Supabase Dashboard:
 * 1. Go to your Supabase project
 * 2. Navigate to Edge Functions
 * 3. Find your function and click "Scheduling"
 * 4. Set up a CRON expression like '0 0 * * *' for daily at midnight
 * 
 * Alternative: If you're not using Supabase Edge Functions,
 * you can set up a serverless function with AWS Lambda or similar,
 * and schedule it with CloudWatch Events or a similar scheduler.
 */