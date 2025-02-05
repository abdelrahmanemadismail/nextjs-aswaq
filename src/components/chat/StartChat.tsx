// components/chat/StartChat.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

interface StartChatProps {
  listingId: string
  sellerId: string
  className?: string
}

export function StartChat({ listingId, sellerId, className }: StartChatProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const startConversation = async () => {
    try {
      setIsLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

          // Don't allow seller to chat with themselves
        if (user.id === sellerId) {
        return
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .single()

      if (existingConversation) {
        router.push(`/chat?id=${existingConversation.id}`)
        return
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Send initial system message
      await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: user.id,
          content: "Hi, I'm interested in this item.",
          is_system_message: false
        })

      // Redirect to chat
      router.push(`/chat?id=${newConversation.id}`)
    } catch (error) {
      console.error('Error starting conversation:', error)
      // You might want to show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={startConversation}
      disabled={isLoading}
      className={className}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {isLoading ? 'Starting Chat...' : 'Chat with Seller'}
    </Button>
  )
}