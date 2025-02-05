"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { MessageInput } from "./MessageInput"
import { useChatStore } from "@/lib/stores/use-chat-store"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"

interface ChatMessagesProps {
  conversationId: string
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const supabase = createClient()
  const { messages, conversations, isLoadingMessages, sendMessage } = useChatStore()

  // Get current conversation and messages
  const conversation = conversations.find(c => c.id === conversationId)
  const conversationMessages = useMemo(() => 
    messages[conversationId] || [], 
    [messages, conversationId]
  )
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversationMessages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    await sendMessage({
      conversation_id: conversationId,
      content: content.trim()
    })
  }

  if (!conversation) {
    return <div>Conversation not found</div>
  }

  // Get the other participant (not the current user)
  const otherParticipant = currentUserId === conversation.buyer_id 
    ? conversation.seller 
    : conversation.buyer

  if (!otherParticipant) {
    return <div>Participant not found</div>
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar>
            <AvatarImage 
              src={otherParticipant.avatar_url || undefined} 
              alt={otherParticipant.full_name} 
            />
            <AvatarFallback>{otherParticipant.full_name[0]}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold">{otherParticipant.full_name}</h2>
            {conversation.listing && (
              <p className="text-sm text-muted-foreground">
                {conversation.listing.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {conversationMessages.map((message) => {
              const isOwn = message.sender_id === currentUserId

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isOwn && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={isOwn ? conversation.buyer?.avatar_url || undefined : otherParticipant.avatar_url || undefined}
                    />
                    <AvatarFallback>
                      {isOwn ? conversation.buyer?.full_name[0] : otherParticipant.full_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn(
                    "group flex flex-col",
                    isOwn && "items-end"
                  )}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {isOwn ? "You" : otherParticipant.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div className={cn(
                      "mt-1 rounded-2xl px-4 py-2 max-w-[80%]",
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {message.content}
                    </div>

                    {isOwn && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {message.read_at ? "Read" : "Delivered"}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}