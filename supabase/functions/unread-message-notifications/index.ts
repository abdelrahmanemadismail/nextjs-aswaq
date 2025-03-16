// Import the nodemailer package from npm
import nodemailer from "npm:nodemailer@6.9.3";
// Import the Supabase JS client
import { createClient } from "npm:@supabase/supabase-js@2.38.0";

// Define types for our application
interface Profile {
  id: string;
  full_name: string;
  email: string;
  notification_preferences?: {
    chat_email: boolean;
    [key: string]: any;
  };
  locale?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  listing?: {
    title: string;
    [key: string]: any;
  }[];
  messages?: Message[];
}

// Group by conversation data structure
interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
  recipientId: string;
  senderId: string;
}

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define translations for email content
const translations = {
  en: {
    subject: 'New Messages on Aswaq Online',
    newMessages: 'New Messages',
    from: 'From',
    regarding: 'Regarding',
    messagesCount: 'You have {count} unread messages',
    viewConversation: 'View Conversation',
    team: 'The Aswaq Online Team',
    automaticMessage: 'This is an automated message from our secure notification system.'
  },
  ar: {
    subject: 'رسائل جديدة على أسواق أونلاين',
    newMessages: 'رسائل جديدة',
    from: 'من',
    regarding: 'بخصوص',
    messagesCount: 'لديك {count} رسائل غير مقروءة',
    viewConversation: 'عرض المحادثة',
    team: 'فريق أسواق أونلاين',
    automaticMessage: 'هذه رسالة آلية من نظام الإشعارات الآمن الخاص بنا.'
  }
};

console.info('Unread message notification service started');

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key (pre-populated in Supabase environment)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current timestamp
    const now = new Date();
    
    // Calculate timestamp for messages that were sent at least 5 minutes ago
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    
    // Get unread messages that are at least 5 minutes old and haven't been notified yet
    const { data: unreadMessages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at
      `)
      .is('read_at', null)
      .is('notification_sent', null)
      .lt('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Error fetching unread messages: ${error.message}`);
    }
    
    if (!unreadMessages || unreadMessages.length === 0) {
      return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'No unread messages to notify about' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    console.log(`Found ${unreadMessages.length} unread messages to process`);
    
    // Group messages by conversation_id
    const conversationMap = new Map<string, Message[]>();
    
    unreadMessages.forEach((message: Message) => {
      const conversationId = message.conversation_id;
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, []);
      }
      conversationMap.get(conversationId)!.push(message);
    });
    
    console.log(`Grouped into ${conversationMap.size} unique conversations`);
    
    // Fetch conversation details for all affected conversations
    const conversationIds = Array.from(conversationMap.keys());
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        buyer_id,
        seller_id,
        listing_id,
        listing:listings(title)
      `)
      .in('id', conversationIds);
    
    if (conversationsError) {
      throw new Error(`Error fetching conversations: ${conversationsError.message}`);
    }
    
    // Create a map for easy lookup
    const conversationsById = new Map<string, Conversation>();
    conversations?.forEach((conversation: Conversation) => {
      conversationsById.set(conversation.id, conversation);
    });
    
    // Collect all user IDs we need to fetch
    const userIds = new Set<string>();
    
    // Organize data by conversation and determine recipients
    const conversationsWithMessages: ConversationWithMessages[] = [];
    
    for (const [conversationId, messages] of conversationMap.entries()) {
      const conversation = conversationsById.get(conversationId);
      if (!conversation) continue;
      
      // Determine recipient and sender based on the most recent message
      const latestMessage = messages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // For consistency, we'll send notification to the opposite person of the sender
      // of the latest message in the conversation
      const recipientId = latestMessage.sender_id === conversation.buyer_id
        ? conversation.seller_id
        : conversation.buyer_id;
      
      userIds.add(recipientId);
      
      // Keep track of all senders to show in the email
      messages.forEach(message => userIds.add(message.sender_id));
      
      // Add to our consolidated list
      conversationsWithMessages.push({
        conversation,
        messages,
        recipientId,
        senderId: latestMessage.sender_id
      });
    }
    
    // Fetch all user profiles at once
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, notification_preferences, locale')
      .in('id', Array.from(userIds));
    
    if (profilesError) {
      throw new Error(`Error fetching user profiles: ${profilesError.message}`);
    }
    
    // Map profiles by ID for easy lookup
    const profilesMap = new Map<string, Profile>();
    profiles?.forEach((profile: Profile) => {
      profilesMap.set(profile.id, profile);
    });
    
    // Process each conversation and send notifications
    const processConversationsTask = async () => {
      let emailsSent = 0;
      const messageIdsToUpdate = [];
      
      for (const { conversation, messages, recipientId, senderId } of conversationsWithMessages) {
        const recipientProfile = profilesMap.get(recipientId);
        const senderProfile = profilesMap.get(senderId);
        
        if (!recipientProfile || !senderProfile) {
          console.error(`Missing profile data for conversation ${conversation.id}`);
          // Mark all messages as processed anyway
          messages.forEach(msg => messageIdsToUpdate.push(msg.id));
          continue;
        }
        
        // Skip if recipient has disabled chat email notifications
        if (recipientProfile.notification_preferences?.chat_email === false) {
          console.log(`Recipient ${recipientId} has disabled chat email notifications`);
          // Mark all messages as processed anyway
          messages.forEach(msg => messageIdsToUpdate.push(msg.id));
          continue;
        }
        
        // Get email credentials from environment
        const smtpHost = Deno.env.get('SMTP_HOST');
        const smtpPort = Deno.env.get('SMTP_PORT');
        const smtpUser = Deno.env.get('SMTP_USER');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const fromEmail = Deno.env.get('SMTP_FROM_EMAIL');
        
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !fromEmail) {
          console.error('Missing email configuration');
          // Mark all messages as processed anyway
          messages.forEach(msg => messageIdsToUpdate.push(msg.id));
          continue;
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
        });
        
        // Get listing title if available
        const listingTitle = conversation.listing?.[0]?.title;
        
        // Format message previews - limit to last 3 messages
        const messagePreviews = messages
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
          .map(message => {
            const senderName = profilesMap.get(message.sender_id)?.full_name || 'Unknown';
            const preview = message.content.length > 100
              ? message.content.substring(0, 100) + '...'
              : message.content;
            
            return { sender: senderName, content: preview, time: message.created_at };
          });
        
        // Get recipient's preferred locale
        const locale = recipientProfile.locale || 'en';
        const isRtl = locale === 'ar';
        
        const t = translations[locale as keyof typeof translations] || translations.en;
        
        // Prepare email HTML
        const appUrl = Deno.env.get('NEXT_PUBLIC_URL') || 'https://aswaq.online';
        const year = new Date().getFullYear();
        
        // Format message count text
        const messageCountText = t.messagesCount.replace('{count}', messages.length.toString());
        
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
        <h1 style="color: #2d3748; font-size: 24px; margin-top: 0; text-align: center;">${t.newMessages}</h1>
        <div style="height: 2px; background-color: #e0e0e0; margin: 20px auto; width: 100px;"></div>
        
        <p><strong>${t.from}:</strong> ${senderProfile.full_name}</p>
        
        ${listingTitle ? `<p><strong>${t.regarding}:</strong> ${listingTitle}</p>` : ''}
        
        <p style="color: #2d3748; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">
          ${messageCountText}
        </p>
        
        <div style="margin: 25px 0;">
          ${messagePreviews.map((preview, index) => `
            <div style="padding: 15px; background-color: #f8fafc; border-${isRtl ? 'right' : 'left'}: 4px solid #006eb8; border-radius: 4px; margin-bottom: 10px;">
              <p style="margin-top: 0; color: #4a5568; font-size: 14px;">
                <strong>${preview.sender}:</strong> 
                <span style="color: #718096; font-size: 12px;">
                  ${new Date(preview.time).toLocaleString(locale)}
                </span>
              </p>
              <p style="margin-bottom: 0;">${preview.content}</p>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${appUrl}/chat?id=${conversation.id}" 
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
</html>`;
        
        try {
          // Send the email
          await transporter.sendMail({
            from: fromEmail,
            to: recipientProfile.email,
            subject: t.subject,
            html: emailHtml
          });
          
          console.log(`Sent notification email to ${recipientProfile.email} for conversation ${conversation.id} with ${messages.length} messages`);
          
          // Mark all messages in this conversation as processed
          messages.forEach(msg => messageIdsToUpdate.push(msg.id));
          emailsSent++;
        } catch (emailError: unknown) {
          const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
          console.error(`Error sending email for conversation ${conversation.id}:`, errorMessage);
        }
      }
      
      // Update all processed messages to mark notifications as sent
      if (messageIdsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ notification_sent: new Date().toISOString() })
          .in('id', messageIdsToUpdate);
        
        if (updateError) {
          console.error('Error updating message notification status:', updateError);
        }
      }
      
      console.log(`Processed ${unreadMessages.length} messages across ${conversationsWithMessages.length} conversations and sent ${emailsSent} notification emails`);
    };

    // Begin processing messages in the background without blocking the response
    EdgeRuntime.waitUntil(processConversationsTask());
    
    return new Response(JSON.stringify({ 
      status: 'success', 
      message: `Processing ${conversationMap.size} conversations with unread messages in the background`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error processing unread message notifications:', errorMessage);
    
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: errorMessage 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});