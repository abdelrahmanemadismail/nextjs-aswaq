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
import { useTranslation } from "@/hooks/use-translation"

interface ChatMessagesProps {
  conversationId: string
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const supabase = createClient()
  const { messages, conversations, isLoadingMessages, sendMessage } = useChatStore()
  const { t } = useTranslation()

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

  const handleBackToList = () => {
    router.push('/chat')
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">{t.common.conversationNotFound || "Conversation not found"}</p>
        <Button 
          variant="ghost" 
          className="mt-4" 
          onClick={handleBackToList}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t.common.back || "Back"}
        </Button>
      </div>
    )
  }

  // Get the other participant (not the current user)
  const otherParticipant = currentUserId === conversation.buyer_id 
    ? conversation.seller 
    : conversation.buyer

  if (!otherParticipant) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">{t.common.participantNotFound || "Participant not found"}</p>
        <Button 
          variant="ghost" 
          className="mt-4" 
          onClick={handleBackToList}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t.common.back || "Back"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleBackToList}
            aria-label={t.common.back || "Back"}
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

          <div className="overflow-hidden">
            <h2 className="font-semibold truncate">{otherParticipant.full_name}</h2>
            {conversation.listing && (
              <p className="text-sm text-muted-foreground truncate max-w-[230px] md:max-w-full">
                {conversation.listing.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
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
            {conversationMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                {t.common.noMessages || "No messages yet"}
              </div>
            ) : (
              conversationMessages.map((message) => {
                const isOwn = message.sender_id === currentUserId

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 md:gap-3",
                      isOwn && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={isOwn ? conversation.buyer?.avatar_url || undefined : otherParticipant.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {isOwn ? conversation.buyer?.full_name[0] : otherParticipant.full_name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                      "group flex flex-col max-w-[75%] md:max-w-[80%]",
                      isOwn && "items-end"
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-medium truncate max-w-[100px] md:max-w-[150px]">
                          {isOwn ? t.common.you || "You" : otherParticipant.full_name}
                        </span>
                        <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <div className={cn(
                        "mt-1 rounded-2xl px-3 py-2 md:px-4 md:py-2 break-words",
                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {message.content}
                      </div>

                      {isOwn && (
                        <span className="text-[10px] md:text-xs text-muted-foreground mt-1">
                          {message.read_at ? t.common.read || "Read" : t.common.delivered || "Delivered"}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-3 md:p-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}