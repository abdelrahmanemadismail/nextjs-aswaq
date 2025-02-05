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
    // Create optimistic message
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id,
      sender_id:  sender_id ?? '',
      content,
      attachments,
      is_system_message: false,
      created_at: new Date().toISOString(),
    }

    // Add optimistic message to state
    get().addOptimisticMessage(optimisticMessage)

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id,
          conversation_id,
          content,
          attachments
        }])
        .select()
        .single()
      if (error) throw error

      // Update optimistic message with real data
      get().updateOptimisticMessage(optimisticMessage.id, data)
    } catch (error) {
      // Handle error - maybe revert optimistic update
      set({ error: 'Failed to send message' })
      console.error('Error sending message:', error)
    }
  },

  markAsRead: async (conversationId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('read_at', null)

      if (error) throw error
    } catch (error) {
      console.error('Error marking messages as read:', error)
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

// Set up realtime subscriptions
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
  
  if (message.sender_id === user?.id) return
  
  state.addOptimisticMessage(message)
  await state.updateConversation(message.conversation_id)
})

// Subscribe to message updates
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