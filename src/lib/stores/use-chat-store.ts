import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { ChatState, Conversation, Message } from '@/types/chat'

const supabase = createClient()

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId })
    if (conversationId) {
      get().fetchMessages(conversationId)
      get().markAsRead(conversationId)
    }
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true, error: null })
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, images),
          buyer:profiles!buyer_id(id, full_name, avatar_url),
          seller:profiles!seller_id(id, full_name, avatar_url)
        `)
        .order('last_message_at', { ascending: false })
  
      if (error) throw error
  
      set({ conversations: data })
    } catch (error) {
      set({ error: 'Failed to load conversations' })
      console.error('Error fetching conversations:', error)
    } finally {
      set({ isLoadingConversations: false })
    }
  },

  updateConversation: async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
  
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, images),
          buyer:profiles!buyer_id(id, full_name, avatar_url),
          seller:profiles!seller_id(id, full_name, avatar_url)
        `)
        .eq('id', conversationId)
        .single()
  
      if (error) throw error
  
      set((state) => ({
        conversations: state.conversations
          .map(conv => conv.id === conversationId ? data : conv)
          .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      }))
    } catch (error) {
      console.error('Error updating conversation:', error)
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true, error: null })
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: data
        }
      }))
    } catch (error) {
      set({ error: 'Failed to load messages' })
      console.error('Error fetching messages:', error)
    } finally {
      set({ isLoadingMessages: false })
    }
  },

  sendMessage: async ({ conversation_id, content, attachments = [] }) => {
    const sender_id = (await supabase.auth.getUser()).data.user?.id 
    if (!sender_id) return;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id,
      sender_id: sender_id,
      content,
      attachments,
      is_system_message: false,
      created_at: new Date().toISOString(),
    }
  
    // Add optimistic message to state
    get().addOptimisticMessage(optimisticMessage)
  
    try {
      // Insert the message into the database
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          sender_id,
          conversation_id,
          content,
          attachments
        }])
  
      if (messageError) throw messageError
  
      // Update the conversation's last_message_at timestamp
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation_id)
  
      if (conversationError) throw conversationError
      
      // Update conversation in the local state
      await get().updateConversation(conversation_id)
    } catch (error) {
      // Handle error - maybe revert optimistic update
      set({ error: 'Failed to send message' })
      console.error('Error sending message:', error)
    }
  },

  markAsRead: async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // First get the messages that need to be marked as read
      const { data: messagesToUpdate } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id) // Only update messages not sent by current user
        .is('read_at', null)
      
      if (!messagesToUpdate || messagesToUpdate.length === 0) return
      
      // Update messages in the database
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messagesToUpdate.map(msg => msg.id))
      
      if (error) throw error
      
      // Update messages in the local state
      set(state => {
        const conversationMessages = state.messages[conversationId]
        if (!conversationMessages) return state
        
        const updatedMessages = conversationMessages.map(message => {
          if (message.sender_id !== user.id && message.read_at === null) {
            return { ...message, read_at: new Date().toISOString() }
          }
          return message
        })
        
        return {
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages
          }
        }
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  },
  fetchUnreadCounts: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return {}
  
      // Use a simpler query approach that's type-safe
      const { data, error } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('read_at', null)
        .neq('sender_id', user.id)
  
      if (error) throw error
  
      // Count the messages by conversation_id manually
      const unreadCounts: Record<string, number> = {}
      
      data.forEach(message => {
        const conversationId = message.conversation_id
        unreadCounts[conversationId] = (unreadCounts[conversationId] || 0) + 1
      })
  
      return unreadCounts
    } catch (error) {
      console.error('Error fetching unread counts:', error)
      return {}
    }
  },
  addOptimisticMessage: (message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversation_id]: [
          ...(state.messages[message.conversation_id] || []),
          message
        ]
      }
    }))
  },

  updateOptimisticMessage: (messageId, updates) => {
    set((state) => {
      const conversationId = Object.keys(state.messages).find(key => 
        state.messages[key].some(m => m.id === messageId)
      )

      if (!conversationId) return state

      return {
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map(message =>
            message.id === messageId ? { ...message, ...updates } : message
          )
        }
      }
    })
  }
}))

const setupRealtimeSubscriptions = () => {
  const channel = supabase.channel('chat-updates')

  // Subscribe to new messages
  channel.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, async (payload) => {
    const message = payload.new as Message
    const state = useChatStore.getState()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Don't add your own messages here as they're handled by optimistic updates
    if (message.sender_id === user?.id) return
    
    // Add the new message to the state
    state.addOptimisticMessage(message)
    
    // Update conversation in list to reflect new message
    await state.updateConversation(message.conversation_id)
    
    // If this conversation is active, mark as read
    if (state.activeConversationId === message.conversation_id) {
      await state.markAsRead(message.conversation_id)
    }
  })

  // Subscribe to message updates (e.g., read status)
  channel.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    const message = payload.new as Message
    const state = useChatStore.getState()
    state.updateOptimisticMessage(message.id, message)
  })

  // Subscribe to conversation updates
  channel.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'conversations'
  }, async (payload) => {
    const conversation = payload.new as Conversation
    const state = useChatStore.getState()
    await state.updateConversation(conversation.id)
  })

  // Subscribe to new conversations
  channel.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'conversations'
  }, async (payload) => {
    const conversation = payload.new as Conversation
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && (conversation.buyer_id === user.id || conversation.seller_id === user.id)) {
      const state = useChatStore.getState()
      await state.fetchConversations()
    }
  })

  channel.subscribe()
  return channel
}

// Initialize the channel
const channel = setupRealtimeSubscriptions()

// Clean up function (can be exported if needed)
export const cleanupChatSubscriptions = () => {
  if (channel) {
    supabase.removeChannel(channel)
  }
}