export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    attachments?: string[]
    is_system_message: boolean
    read_at?: string | null
    created_at: string
  }
  
  export interface Conversation {
    id: string
    listing_id: string
    buyer_id: string
    seller_id: string
    last_message_at: string
    created_at: string
    // Additional fields from joins
    listing?: {
      title: string
      images: string[]
    }
    buyer?: {
      id: string
      full_name: string
      avatar_url: string | null
    }
    seller?: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
  
  export interface NewMessage {
    conversation_id: string
    content: string
    attachments?: string[]
  }
  
  export interface ChatState {
    conversations: Conversation[]
    messages: Record<string, Message[]>
    activeConversationId: string | null
    isLoadingConversations: boolean
    isLoadingMessages: boolean
    error: string | null
    
    // Actions
    setActiveConversation: (conversationId: string | null) => void
    fetchConversations: () => Promise<void>
    updateConversation: (conversationId: string) => Promise<void>
    fetchMessages: (conversationId: string) => Promise<void>
    sendMessage: (message: NewMessage) => Promise<void>
    markAsRead: (conversationId: string) => Promise<void>
    fetchUnreadCounts: () => Promise<Record<string, number>>
    
    // Optimistic updates
    addOptimisticMessage: (message: Message) => void
    updateOptimisticMessage: (messageId: string, updates: Partial<Message>) => void
  }