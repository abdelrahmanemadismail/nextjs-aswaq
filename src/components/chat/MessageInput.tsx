// components/chat/MessageInput.tsx
"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  className?: string
}

export function MessageInput({ onSendMessage, className }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"
      // Set new height based on scrollHeight
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
    }
  }

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="flex-shrink-0"
      >
        <ImageIcon className="h-5 w-5" />
      </Button>

      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[200px] py-3 pr-12 resize-none"
          rows={1}
        />
        <Button
          size="icon"
          className="absolute bottom-1 right-1"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}