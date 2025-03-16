"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, Check, SlidersHorizontal, Inbox, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/stores/use-chat-store"
import { Conversation, Message } from "@/types/chat"
// import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({})
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
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
        // Use the index for read_at IS NULL
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
    const channel = supabase.channel('unread-counts-updates');
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

  // Use useCallback to create a memoized fetch function for last messages
  const fetchAndUpdateLastMessages = useCallback(async () => {
    if (conversations.length === 0) return;
    
    try {
      const lastMsgs = await useChatStore.getState().fetchLastMessages();
      setLastMessages(lastMsgs);
    } catch (error) {
      console.error('Error fetching last messages:', error);
    }
  }, [conversations.length]);

  // Add this useEffect to fetch last messages with real-time updates
  useEffect(() => {
    fetchAndUpdateLastMessages();
    
    // Set up subscription for real-time updates of last messages
    const channel = supabase.channel('last-messages-updates');
    
    // Handle new messages
    channel.on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        const newMessage = payload.new as Message;
        
        // Update the last message for this conversation
        setLastMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: newMessage
        }));
        
        // Force a re-fetch of conversations to ensure proper order
        await fetchConversations();
      }
    );
    
    // Handle updated messages (e.g., read status changes)
    channel.on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'messages' },
      async (payload) => {
        const updatedMessage = payload.new as Message;
        // Check if this is the last message for its conversation
        const currentLastMessage = lastMessages[updatedMessage.conversation_id];
        
        if (currentLastMessage && currentLastMessage.id === updatedMessage.id) {
          // Update it if it's the last message
          setLastMessages(prev => ({
            ...prev,
            [updatedMessage.conversation_id]: updatedMessage
          }));
        }
      }
    );
    
    // Subscribe to conversation updates
    channel.on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'conversations' },
      async () => {
        // Refresh everything when conversations change
        await fetchConversations();
        await fetchAndUpdateLastMessages();
      }
    );
    
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchAndUpdateLastMessages, lastMessages, fetchConversations]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchConversations();
    await fetchAndUpdateLastMessages();
    setIsRefreshing(false);
  };

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    // First apply search filter
    let filtered = [...conversations]; // Create a copy to avoid modifying the original
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conversation) => {
        // Search in both buyer and seller names
        const buyerName = conversation.buyer?.full_name.toLowerCase() || '';
        const sellerName = conversation.seller?.full_name.toLowerCase() || '';
        // Search in listing title
        const listingTitle = conversation.listing?.title.toLowerCase() || '';
        // Also search in last message content
        const lastMessageContent = lastMessages[conversation.id]?.content?.toLowerCase() || '';
        
        return buyerName.includes(query) || 
               sellerName.includes(query) || 
               listingTitle.includes(query) ||
               lastMessageContent.includes(query);
      });
    }
    
    // Then apply unread filter if needed
    if (filterType === 'unread') {
      filtered = filtered.filter((conversation) => {
        return unreadCounts[conversation.id] && unreadCounts[conversation.id] > 0;
      });
    }
    
    // Always sort conversations by last_message_at timestamp (most recent first)
    // This ensures newer messages move conversations to the top
    return filtered.sort((a, b) => {
      // Convert ISO strings to Date objects for accurate comparison
      const dateA = new Date(a.last_message_at);
      const dateB = new Date(b.last_message_at);
      // Sort descending (newest first)
      return dateB.getTime() - dateA.getTime();
    });
  }, [conversations, searchQuery, filterType, unreadCounts, lastMessages]);

  // Calculate total unread count for badge
  const totalUnread = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  const renderConversation = (conversation: Conversation) => {
    // Skip if we can't determine the current user yet
    if (!currentUserId) return null

    // Get the other participant (not the current user)
    const isCurrentUserBuyer = currentUserId === conversation.buyer_id
    const participant = isCurrentUserBuyer ? conversation.seller : conversation.buyer
    const unreadCount = unreadCounts[conversation.id] || 0

    if (!participant) return null

    // Format relative time with smarter display
    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        // For today, show time like "2:30 PM"
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        // For yesterday
        return 'Yesterday';
      } else {
        // For older messages
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    };

    return (
      <button
        key={conversation.id}
        className={cn(
          "relative w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b",
          selectedConversationId === conversation.id && "bg-muted/80 shadow-sm",
          unreadCount > 0 && "bg-primary/5" // Highlight conversations with unread messages
        )}
        onClick={() => onSelectConversation(conversation.id)}
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={participant.avatar_url || undefined} alt={participant.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary">{participant.full_name[0]}</AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className={cn(
              "font-medium truncate max-w-[150px]",
              unreadCount > 0 && "font-bold" // Bold text for unread messages
            )}>
              {participant.full_name}
            </span>
            <span className={cn(
              "text-xs whitespace-nowrap",
              unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {formatRelativeTime(conversation.last_message_at)}
            </span>
          </div>
          
          {conversation.listing && (
            <div className="flex items-center mb-1">
              <Badge variant="outline" className="text-[10px] py-0 h-4 px-1 truncate max-w-[180px]">
                {conversation.listing.title}
              </Badge>
            </div>
          )}
          
          {/* Display the last message content */}
          <p className={cn(
            "text-sm truncate",
            unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
          )}>
            {lastMessages[conversation.id] ? (
              <>
                {lastMessages[conversation.id].sender_id === currentUserId ? (
                  <span className="text-muted-foreground font-normal">You: </span>
                ) : (
                  ""
                )}
                <span>
                  {lastMessages[conversation.id].content || 
                   (() => {
                     const attachments = lastMessages[conversation.id].attachments || [];
                     return attachments.length > 0 
                       ? `Attachment${attachments.length > 1 ? 's' : ''}` 
                       : "Empty message";
                   })()}
                </span>
              </>
            ) : unreadCount > 0 ? (
              <span>New message{unreadCount > 1 ? 's' : ''}</span>
            ) : (
              <span>No messages yet</span>
            )}
          </p>
        </div>

        {/* Status indicator */}
        {selectedConversationId === conversation.id && (
          <div className="absolute right-0 top-0 h-full w-1 bg-primary" />
        )}
      </button>
    )
  }

  if (isLoadingConversations) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with title and options */}
      <div className="p-3 border-b bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">{t.common.conversations || "Conversations"}</h2>
            {totalUnread > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalUnread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-4 w-4"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort & Filter</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  {filterType === 'all' && <Check className="h-4 w-4 mr-2" />}
                  Show all conversations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('unread')}>
                  {filterType === 'unread' && <Check className="h-4 w-4 mr-2" />}
                  Show unread only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t.common.searchConversations || "Search conversations"}
            className="pl-9 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-1 p-1 bg-background border-b">
          <TabsTrigger value="all" onClick={() => setFilterType('all')}>
            All
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            onClick={() => setFilterType('unread')}
            className="relative"
          >
            Unread
            {totalUnread > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 flex items-center justify-center">
                {totalUnread}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            {searchQuery ? (
              <p className="text-muted-foreground max-w-xs">
                No conversations match your search for <strong>&quot;{searchQuery}&quot;</strong>
              </p>
            ) : filterType === 'unread' ? (
              <p className="text-muted-foreground max-w-xs">
                {t.common.noConversations || "No conversations yet"}
              </p>
            ) : (
              <p className="text-muted-foreground max-w-xs">
                {t.common.noConversations || "No conversations yet"}
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map(renderConversation)}
          </div>
        )}
      </div>
    </div>
  )
}