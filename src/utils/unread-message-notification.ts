// unread-message-notification.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import nodemailer from 'nodemailer'
import { Conversation } from '@/types/chat'

// Type for unread message notification email
interface UnreadMessageEmailData {
  recipientId: string
  recipientEmail: string
  senderName: string
  listingTitle?: string
  messagePreview: string
  conversationId: string
}

// Create email transporter (reusing same logic from contact-actions.ts)
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

// Prepare unread message notification email template
const prepareUnreadMessageEmail = (data: UnreadMessageEmailData, locale: string = 'en'): string => {
  // Simple localization for notification email
  const translations = {
    en: {
      subject: 'New Message on Aswaq Online',
      newMessage: 'New Message',
      from: 'From',
      regarding: 'Regarding',
      messagePreview: 'Message Preview',
      viewConversation: 'View Conversation',
      unreadMessage: 'You have an unread message',
      notReceiveUpdates: 'If you don\'t want to receive email updates, you can change your notification settings in your account preferences.',
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
      notReceiveUpdates: 'إذا كنت لا ترغب في تلقي تحديثات البريد الإلكتروني، يمكنك تغيير إعدادات الإشعارات في تفضيلات حسابك.',
      team: 'فريق أسواق أونلاين',
      automaticMessage: 'هذه رسالة آلية من نظام الإشعارات الآمن الخاص بنا.'
    }
  }

  const t = translations[locale as keyof typeof translations] || translations.en
  const isRtl = locale === 'ar'
  const direction = isRtl ? 'rtl' : 'ltr'
  const textAlign = isRtl ? 'right' : 'left'
  const year = new Date().getFullYear()
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://aswaq.online'

  // Create a safe message preview (limit length and escape HTML)
  const safeMessagePreview = data.messagePreview
    .substring(0, 100)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    + (data.messagePreview.length > 100 ? '...' : '')

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${direction}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.subject}</title>
    <style type="text/css">
      body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #4a5568; background-color: #f7fafc; }
      .email-container { max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin: auto; }
      .header { padding: 25px 0; background-color: #f8fafc; border-top: 4px solid #006eb8; border-radius: 8px 8px 0 0; text-align: center; }
      .content { padding: 40px 30px; text-align: ${textAlign}; }
      .footer { padding: 20px; background-color: #f8fafc; font-size: 12px; color: #718096; border-radius: 0 0 8px 8px; text-align: center; }
      .message-box { margin: 30px 0; padding: 20px; background-color: #f8fafc; border-${isRtl ? 'right' : 'left'}: 4px solid #006eb8; border-radius: 4px; }
      .button { background-color: #006eb8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
      h1 { color: #2d3748; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center; }
      .divider { height: 2px; background-color: #e0e0e0; margin: 0 auto 30px; width: 100px; }
      p { margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <center style="width: 100%; background-color: #f7fafc; padding: 20px 0;">
      <div class="email-container">
        <div class="header">
          <!-- Logo placeholder -->
        </div>

        <div class="content">
          <h1>${t.newMessage}</h1>
          <div class="divider"></div>
          
          <p><strong>${t.from}:</strong> ${data.senderName}</p>
          
          ${data.listingTitle ? `<p><strong>${t.regarding}:</strong> ${data.listingTitle}</p>` : ''}
          
          <div class="message-box">
            <p><strong>${t.messagePreview}:</strong></p>
            <p>${safeMessagePreview}</p>
          </div>
          
          <center>
            <a href="${appUrl}/chat?id=${data.conversationId}" class="button">${t.viewConversation}</a>
          </center>
          
          <p style="color: #718096; font-size: 14px; margin-top: 30px; text-align: center;">
            ${t.notReceiveUpdates}
          </p>
        </div>

        <div class="footer">
          <p style="margin-bottom: 5px;">
            &copy; ${year} Aswaq.online. ${isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
          <p style="margin-top: 0;">
            ${t.automaticMessage}
          </p>
        </div>
      </div>
    </center>
  </body>
</html>`;
}

// Send unread message notification email
const sendUnreadMessageNotification = async (data: UnreadMessageEmailData, locale: string = 'en') => {
  const transporter = await createTransporter()
  if (!transporter) return false

  try {
    const emailHtml = prepareUnreadMessageEmail(data, locale)
    
    const translations = {
      en: { subject: 'New Message on Aswaq Online' },
      ar: { subject: 'رسالة جديدة على أسواق أونلاين' }
    }
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: data.recipientEmail,
      subject: translations[locale as keyof typeof translations]?.subject || translations.en.subject,
      html: emailHtml
    })
    
    return true
  } catch (error) {
    console.error('Failed to send unread message notification email:', error)
    return false
  }
}

// Check for unread messages and send notifications
export async function checkAndSendUnreadMessageNotifications() {
  const supabase = await createClient()
  
  try {
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
          listing:listing_id (
            title
          ),
          buyer:buyer_id (
            id,
            full_name,
            email,
            notification_preferences,
            locale
          ),
          seller:seller_id (
            id,
            full_name,
            email,
            notification_preferences,
            locale
          )
        )
      `)
      .is('read_at', null)
      .is('notification_sent', null) // Add this column to your messages table
      .lt('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching unread messages:', error)
      return false
    }
    
    if (!unreadMessages || unreadMessages.length === 0) {
      console.log('No unread messages to notify about')
      return true
    }
    
    console.log(`Found ${unreadMessages.length} unread messages to send notifications for`)
    
    // Process each message and send notification
    for (const message of unreadMessages) {
      // Determine recipient (the user who should receive the notification)
      const conversation = message.conversations as unknown as Conversation & {
        buyer: { id: string; full_name: string; email: string; notification_preferences?: { chat_email: boolean }; locale?: string };
        seller: { id: string; full_name: string; email: string; notification_preferences?: { chat_email: boolean }; locale?: string };
      }
      
      // Skip if conversation or participants are missing
      if (!conversation || !conversation.buyer || !conversation.seller) {
        console.error(`Missing conversation data for message ${message.id}`)
        continue
      }
      
      // Determine recipient and sender based on sender_id
      const isSenderBuyer = message.sender_id === conversation.buyer.id
      const recipient = isSenderBuyer ? conversation.seller : conversation.buyer
      const sender = isSenderBuyer ? conversation.buyer : conversation.seller
      
      // Skip if recipient has disabled chat email notifications
      if (recipient.notification_preferences?.chat_email === false) {
        console.log(`Recipient ${recipient.id} has disabled chat email notifications`)
        
        // Mark as notification sent anyway to prevent checking again
        await supabase
          .from('messages')
          .update({ notification_sent: new Date().toISOString() })
          .eq('id', message.id)
        
        continue
      }
      
      // Prepare email data
      const emailData: UnreadMessageEmailData = {
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        senderName: sender.full_name,
        messagePreview: message.content,
        conversationId: message.conversation_id,
        listingTitle: conversation.listing?.title
      }
      
      // Get recipient's preferred locale
      const locale = recipient.locale || 'en'
      
      // Send notification email
      const emailSent = await sendUnreadMessageNotification(emailData, locale)
      
      if (emailSent) {
        console.log(`Sent unread message notification to ${recipient.email} for message ${message.id}`)
        
        // Mark message as notification sent
        await supabase
          .from('messages')
          .update({ notification_sent: new Date().toISOString() })
          .eq('id', message.id)
      }
    }
    
    return true
  } catch (error) {
    console.error('Error processing unread message notifications:', error)
    return false
  }
}