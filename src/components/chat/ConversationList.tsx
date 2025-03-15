"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/stores/use-chat-store"
import { Conversation } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/utils/supabase/client"

interface ConversationListProps {
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { conversations, fetchConversations, isLoadingConversations } = useChatStore()
  const { t } = useTranslation()
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    // Get the current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Fetch unread message counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!currentUserId) return;
      
      try {
        // Get unread messages
        const { data, error } = await supabase
          .from('messages')
          .select('conversation_id, id')
          .neq('sender_id', currentUserId)
          .is('read_at', null)
        
        if (error) throw error;
        
        // Count unread messages by conversation
        const counts: Record<string, number> = {};
        data.forEach(msg => {
          counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
        });
        
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };
    
    fetchUnreadCounts();
    
    // Set up subscription for new messages to update unread counts
    const channel = supabase.channel('public:messages');
    channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new && payload.new.sender_id !== currentUserId) {
            fetchUnreadCounts();
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  const renderConversation = (conversation: Conversation) => {
    // Skip if we can't determine the current user yet
    if (!currentUserId) return null

    // Get the other participant (not the current user)
    const isCurrentUserBuyer = currentUserId === conversation.buyer_id
    const participant = isCurrentUserBuyer ? conversation.seller : conversation.buyer

    const unreadCount = unreadCounts[conversation.id] || 0

    if (!participant) return null

    return (
      <button
        key={conversation.id}
        className={cn(
          "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors",
          selectedConversationId === conversation.id && "bg-muted",
          unreadCount > 0 && "bg-primary/5" // Highlight conversations with unread messages
        )}
        onClick={() => onSelectConversation(conversation.id)}
      >
        <Avatar>
          <AvatarImage src={participant.avatar_url || undefined} alt={participant.full_name} />
          <AvatarFallback>{participant.full_name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-left">
          <div className="flex justify-between items-start">
            <span className={cn(
              "font-medium truncate max-w-[120px] md:max-w-full",
              unreadCount > 0 && "font-bold" // Bold text for unread messages
            )}>
              {participant.full_name}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
            </span>
          </div>
          
          {conversation.listing && (
            <p className="text-xs text-primary truncate">
              {conversation.listing.title}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <span className="text-xs text-primary-foreground">
              {unreadCount}
            </span>
          </div>
        )}
      </button>
    )
  }

  if (isLoadingConversations) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t.common.searchConversations || "Search conversations"}
            className="pl-8"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t.common.noConversations || "No conversations yet"}
          </div>
        ) : (
          conversations.map(renderConversation)
        )}
      </div>
    </div>
  )
}