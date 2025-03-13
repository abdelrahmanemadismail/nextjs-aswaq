"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useTranslation } from "@/hooks/use-translation"

interface StartChatProps {
  listingId: string
  sellerId: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
  iconOnly?: boolean
}

export function StartChat({ 
  listingId, 
  sellerId, 
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
  iconOnly = false
}: StartChatProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const { t } = useTranslation()

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
          content: t.common.initialMessage || "Hi, I'm interested in this topic.",
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
      className={cn(
        className,
        fullWidth && "w-full"
      )}
      variant={variant}
      size={size}
    >
      <MessageCircle className={cn("h-4 w-4", !iconOnly && size !== "icon" && "mr-2")} />
      {!iconOnly && size !== "icon" && (isLoading ? 
        (t.common.startingChat || 'Starting Chat...') : 
        (t.common.chatWithSeller || 'Chat')
      )}
    </Button>
  )
}

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}