// app/(chat)/chat/page.tsx
"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatMessages } from "@/components/chat/ChatMessages"
import { useChatStore } from "@/lib/stores/use-chat-store"
import { useTranslation } from "@/hooks/use-translation"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('id')
  const { setActiveConversation, activeConversationId } = useChatStore()
  const [isMobileView, setIsMobileView] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId)
    }
  }, [conversationId, setActiveConversation])

  useEffect(() => {
    // Function to set mobile view state based on window width
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleSelectConversation = (id: string) => {
    router.push(`/chat?id=${id}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBackToList = () => {
    router.push('/chat')
  }

  // Mobile view with active conversation
  if (isMobileView && activeConversationId) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex-1">
          <ChatMessages conversationId={activeConversationId} />
        </div>
      </Suspense>
    )
  }

  // Mobile view without active conversation (show list)
  if (isMobileView) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full">
          <ConversationList 
            selectedConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </Suspense>
    )
  }

  // Desktop view (show both)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Conversation List - Left Sidebar */}
      <div className="w-80 flex-shrink-0 border-r">
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
            <p className="text-muted-foreground">{t.common.selectConversation || "Select a conversation to start chatting"}</p>
          </div>
        )}
      </div>
    </Suspense>
  )
}