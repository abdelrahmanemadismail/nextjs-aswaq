// @deno-types="https://deno.land/std@0.177.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @deno-types="npm:@supabase/supabase-js@2.7.1"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import * as nodemailer from "https://esm.sh/nodemailer@6.9.3"

// Define Deno namespace type for TypeScript
declare global {
  namespace Deno {
    interface Env {
      get(key: string): string | undefined
    }
    const env: Env
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current timestamp
    const now = new Date()
    
    // Calculate timestamp for messages that were sent at least 5 minutes ago
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    
    // Get unread messages that are at least 5 minutes old and haven't been notified yet
    const { data: unreadMessages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        conversations:conversation_id (
          buyer_id,
          seller_id,
          listing_id,
          listing:listings(title)
        )
      `)
      .is('read_at', null)
      .is('notification_sent', null)
      .lt('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: true })
      .limit(50) // Process in batches to avoid timeouts
    
    if (error) {
      throw new Error(`Error fetching unread messages: ${error.message}`)
    }
    
    if (!unreadMessages || unreadMessages.length === 0) {
      return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'No unread messages to notify about' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
    
    console.log(`Found ${unreadMessages.length} unread messages to send notifications for`)
    
    // Get all user IDs for batch fetching profiles
    const userIds = new Set<string>()
    for (const message of unreadMessages) {
      const conversation = message.conversations
      if (conversation) {
        // Determine recipient (opposite of sender)
        const recipientId = message.sender_id === conversation.buyer_id
          ? conversation.seller_id
          : conversation.buyer_id
        
        userIds.add(recipientId)
        userIds.add(message.sender_id)
      }
    }
    
    // Fetch all relevant user profiles in a single query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, notification_preferences, locale')
      .in('id', Array.from(userIds))
    
    if (profilesError) {
      throw new Error(`Error fetching user profiles: ${profilesError.message}`)
    }
    
    // Map profiles by ID for easy lookup
    const profilesMap = new Map()
    profiles?.forEach((profile: any) => {
      profilesMap.set(profile.id, profile)
    })
    
    // Process messages and send notifications
    let notificationsSent = 0
    const messageIdsToUpdate = []
    
    for (const message of unreadMessages) {
      const conversation = message.conversations
      if (!conversation) continue
      
      // Determine recipient (opposite of sender)
      const recipientId = message.sender_id === conversation.buyer_id
        ? conversation.seller_id
        : conversation.buyer_id
      
      const recipientProfile = profilesMap.get(recipientId)
      const senderProfile = profilesMap.get(message.sender_id)
      
      if (!recipientProfile || !senderProfile) {
        console.error(`Missing profile data for message ${message.id}`)
        messageIdsToUpdate.push(message.id) // Mark as processed anyway
        continue
      }
      
      // Skip if recipient has disabled chat email notifications
      if (recipientProfile.notification_preferences?.chat_email === false) {
        console.log(`Recipient ${recipientId} has disabled chat email notifications`)
        messageIdsToUpdate.push(message.id) // Mark as processed anyway
        continue
      }
      
      // Get email credentials from environment
      const smtpHost = Deno.env.get('SMTP_HOST')
      const smtpPort = Deno.env.get('SMTP_PORT')
      const smtpUser = Deno.env.get('SMTP_USER')
      const smtpPassword = Deno.env.get('SMTP_PASSWORD')
      const fromEmail = Deno.env.get('SMTP_FROM_EMAIL')
      
      if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !fromEmail) {
        throw new Error('Missing email configuration')
      }
      
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })
      
      // Get listing title if available
      const listingTitle = conversation.listing?.[0]?.title
      
      // Create a safe message preview
      const messagePreview = message.content.length > 100
        ? message.content.substring(0, 100) + '...'
        : message.content
      
      // Get recipient's preferred locale
      const locale = recipientProfile.locale || 'en'
      const isRtl = locale === 'ar'
      
      // Translations for the email
      const translations = {
        en: {
          subject: 'New Message on Aswaq Online',
          newMessage: 'New Message',
          from: 'From',
          regarding: 'Regarding',
          messagePreview: 'Message Preview',
          viewConversation: 'View Conversation',
          unreadMessage: 'You have an unread message',
          team: 'The Aswaq Online Team',
          automaticMessage: 'This is an automated message from our secure notification system.'
        },
        ar: {
          subject: 'رسالة جديدة على أسواق أونلاين',
          newMessage: 'رسالة جديدة',
          from: 'من',
          regarding: 'بخصوص',
          messagePreview: 'معاينة الرسالة',
          viewConversation: 'عرض المحادثة',
          unreadMessage: 'لديك رسالة غير مقروءة',
          team: 'فريق أسواق أونلاين',
          automaticMessage: 'هذه رسالة آلية من نظام الإشعارات الآمن الخاص بنا.'
        }
      }
      
      const t = translations[locale as keyof typeof translations] || translations.en
      
      // Prepare email HTML
      const appUrl = Deno.env.get('NEXT_PUBLIC_URL') || 'https://aswaq.online'
      const year = new Date().getFullYear()
      
      const emailHtml = `<!DOCTYPE html>
<html lang="${locale}" dir="${isRtl ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="utf-8" />
    <title>${t.subject}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 4px solid #006eb8;">
        <!-- Logo could go here -->
      </div>
      
      <div style="padding: 30px; text-align: ${isRtl ? 'right' : 'left'};">
        <h1 style="color: #2d3748; font-size: 24px; margin-top: 0; text-align: center;">${t.newMessage}</h1>
        <div style="height: 2px; background-color: #e0e0e0; margin: 20px auto; width: 100px;"></div>
        
        <p><strong>${t.from}:</strong> ${senderProfile.full_name}</p>
        
        ${listingTitle ? `<p><strong>${t.regarding}:</strong> ${listingTitle}</p>` : ''}
        
        <div style="margin: 25px 0; padding: 15px; background-color: #f8fafc; border-${isRtl ? 'right' : 'left'}: 4px solid #006eb8; border-radius: 4px;">
          <p><strong>${t.messagePreview}:</strong></p>
          <p>${messagePreview}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${appUrl}/chat?id=${message.conversation_id}" 
             style="background-color: #006eb8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            ${t.viewConversation}
          </a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p style="margin-bottom: 5px;">
          &copy; ${year} Aswaq.online. ${isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
        </p>
        <p style="margin-top: 0;">${t.automaticMessage}</p>
      </div>
    </div>
  </body>
</html>`
      
      try {
        // Send the email
        await transporter.sendMail({
          from: fromEmail,
          to: recipientProfile.email,
          subject: t.subject,
          html: emailHtml
        })
        
        console.log(`Sent notification email to ${recipientProfile.email} for message ${message.id}`)
        messageIdsToUpdate.push(message.id)
        notificationsSent++
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError)
        console.error(`Error sending email for message ${message.id}:`, errorMessage)
      }
    }
    
    // Update all processed messages to mark notifications as sent
    if (messageIdsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ notification_sent: new Date().toISOString() })
        .in('id', messageIdsToUpdate)
      
      if (updateError) {
        console.error('Error updating message notification status:', updateError)
      }
    }
    
    return new Response(JSON.stringify({ 
      status: 'success', 
      message: `Processed ${unreadMessages.length} messages and sent ${notificationsSent} notifications` 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error processing unread message notifications:', errorMessage)
    
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: errorMessage 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})