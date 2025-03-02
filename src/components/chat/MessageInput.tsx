"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  className?: string
}

export function MessageInput({ onSendMessage, className }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useTranslation()

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
      // Set new height based on scrollHeight, cap at 100px on mobile, 200px on desktop
      const maxHeight = window.innerWidth < 768 ? 100 : 200
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px"
    }
  }

  return (
    <div className={cn("flex items-end gap-1 md:gap-2", className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
        aria-label={t.common.attachImage || "Attach image"}
      >
        <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
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
          placeholder={t.common.typeMessage || "Type a message..."}
          className="min-h-[40px] max-h-[100px] md:max-h-[200px] py-2 pr-10 md:py-3 md:pr-12 resize-none text-sm md:text-base"
          rows={1}
        />
        <Button
          size="icon"
          className="absolute bottom-1 right-1 h-8 w-8 md:h-10 md:w-10"
          onClick={handleSend}
          disabled={!message.trim()}
          aria-label={t.common.send || "Send"}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}