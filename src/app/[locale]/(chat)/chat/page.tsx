// app/(chat)/chat/page.tsx
"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatMessages } from "@/components/chat/ChatMessages"
import { useChatStore } from "@/lib/stores/use-chat-store"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('id')
  const { setActiveConversation, activeConversationId } = useChatStore()

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId)
    }
  }, [conversationId, setActiveConversation])

  const handleSelectConversation = (id: string) => {
    router.push(`/chat?id=${id}`)
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>

      {/* Conversation List - Left Sidebar */}
      <div className="w-80 flex-shrink-0 border-r md:block">
        <ConversationList 
          selectedConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Area - Main Content */}
      <div className="flex-1">
        {activeConversationId ? (
          <ChatMessages conversationId={activeConversationId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
      </Suspense>

  )
}