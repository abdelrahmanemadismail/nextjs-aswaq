"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react"
import { MessageInput } from "./MessageInput"
import { useChatStore } from "@/lib/stores/use-chat-store"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"
import { useTranslation } from "@/hooks/use-translation"
import Image from "next/image"

interface ChatMessagesProps {
  conversationId: string
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
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

  // Reset zoom and rotation when a new image is selected
  useEffect(() => {
    setImageZoom(1)
    setImageRotation(0)
  }, [selectedImage])

  // Handle ESC key to close the image viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage])

  const handleSendMessage = async (content: string, attachments?: string[]) => {
    // Allow empty content if attachments are present
    if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
      return
    }

    try {
      await sendMessage({
        conversation_id: conversationId,
        content: content || "", // Use empty string for null/undefined content
        attachments
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleBackToList = () => {
    router.push('/chat')
  }

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360)
  }

  // Helper function to determine if a URL is an image
  const isImageAttachment = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext))
  }

  // Helper function to get file name from URL
  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const segments = pathname.split('/')
      return segments[segments.length - 1]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // If URL parsing fails, just return the last part
      const segments = url.split('/')
      return segments[segments.length - 1]
    }
  }

  // Helper function to get file extension
  const getFileExtension = (url: string) => {
    const fileName = getFileNameFromUrl(url)
    return fileName.split('.').pop()?.toUpperCase() || '?'
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
          <div className="space-y-6">
            {conversationMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                {t.common.noMessages || "No messages yet"}
              </div>
            ) : (
              conversationMessages.map((message) => {
                const isOwn = message.sender_id === currentUserId
                const hasAttachments = message.attachments && message.attachments.length > 0
                const hasContent = message.content && message.content.trim() !== ''

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col gap-2",
                      isOwn && "items-end"
                    )}
                  >
                    {/* Message header with user info and timestamp */}
                    <div className={cn(
                      "flex items-center gap-2",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}>
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage 
                          src={isOwn ? conversation.buyer?.avatar_url || undefined : otherParticipant.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {isOwn ? conversation.buyer?.full_name[0] : otherParticipant.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs md:text-sm font-medium truncate max-w-[100px] md:max-w-[150px]">
                        {isOwn ? t.common.you || "You" : otherParticipant.full_name}
                      </span>
                      <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Message content */}
                    <div className={cn(
                      "flex flex-col max-w-[75%] md:max-w-[80%] gap-1 w-fit",
                      isOwn && "items-end"
                    )}>
                      {/* Text bubble */}
                      {hasContent && (
                        <div className={cn(
                          "rounded-2xl px-3 py-2 md:px-4 md:py-2 break-words",
                          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {message.content}
                        </div>
                      )}
                      
                      {/* Attachments outside the bubble */}
                      {hasAttachments && (
                        <div className="flex flex-col gap-2 mt-1">
                          {message.attachments?.map((attachment, index) => (
                            isImageAttachment(attachment) ? (
                              // Image attachment with preview
                              <div key={index} className="relative overflow-hidden rounded-lg border border-border bg-background/50 max-w-[240px]">
                                <div 
                                  className="aspect-square w-full max-h-[240px] overflow-hidden cursor-pointer"
                                  onClick={() => setSelectedImage(attachment)}
                                >
                                  <Image
                                  height={50}
                                  width={50} 
                                    src={attachment} 
                                    alt="Attachment" 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="p-2 flex items-center justify-between bg-background/80 text-xs">
                                  <span className="truncate flex-1">{getFileNameFromUrl(attachment)}</span>
                                  <div className="flex gap-1">
                                    <a 
                                      href={attachment} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-1 hover:bg-muted rounded-full"
                                      title="Open in new tab"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Document attachment
                              <div 
                                key={index}
                                className="flex items-center gap-2 border border-border rounded-lg p-2 bg-background/50 hover:bg-background transition-colors max-w-[240px] cursor-pointer"
                                onClick={() => window.open(attachment, '_blank')}
                              >
                                <div className="bg-muted h-10 w-10 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium">{getFileExtension(attachment)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{getFileNameFromUrl(attachment)}</div>
                                  <div className="text-[10px] text-muted-foreground">Click to open</div>
                                </div>
                                <div className="p-1 rounded-full">
                                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Delivery status */}
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

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-full max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
            height={50}
            width={50}
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-[85vh] object-contain transition-transform"
              style={{ 
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/20 hover:bg-background/40 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background/30 backdrop-blur-sm p-2 rounded-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleRotate}
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
              <Link
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full flex items-center justify-center text-foreground bg-background/10 hover:bg-background/30 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}