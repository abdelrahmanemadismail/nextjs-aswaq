"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/utils/supabase/client"

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: string[]) => void
  className?: string
}

export function MessageInput({ onSendMessage, className }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { t } = useTranslation()

  const handleSend = async () => {
    // Allow sending if there are uploads, even if message is empty
    if ((uploadedFiles.length > 0 || message.trim()) && !isUploading) {
      onSendMessage(message, uploadedFiles.length > 0 ? uploadedFiles : undefined)
      setMessage("")
      setSelectedFiles([])
      setUploadedFiles([])
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Only send on Enter if there's actual text content
    if (e.key === "Enter" && !e.shiftKey && !isComposing && message.trim()) {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    setSelectedFiles(prev => [...prev, ...newFiles])
    
    // Upload files to storage
    await uploadFiles(newFiles)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const uploadedUrls: string[] = []
      
      for (const file of files) {
        // Create a unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        // Upload file to Supabase Storage
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, error } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Error uploading file:', error)
          continue
        }
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(filePath)
        
        uploadedUrls.push(publicUrl)
      }
      
      setUploadedFiles(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Error handling file upload:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  // Determine if the file is an image based on extension
  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((file, index) => (
            <div 
              key={index} 
              className="relative bg-muted rounded p-1 pr-6 text-xs flex items-center gap-1"
            >
              {isImageFile(file.name) ? (
                <ImageIcon className="h-3 w-3" />
              ) : (
                <Paperclip className="h-3 w-3" />
              )}
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button 
                onClick={() => removeFile(index)} 
                className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Uploading...
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-1 md:gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
          aria-label={t.common.attachFile || "Attach file"}
          onClick={handleAttachClick}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            disabled={isUploading}
          />
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
            disabled={isUploading}
          />
          <Button
            size="icon"
            className="absolute bottom-1 right-1 h-8 w-8 md:h-10 md:w-10"
            onClick={handleSend}
            disabled={(message.trim() === '' && uploadedFiles.length === 0) || isUploading}
            aria-label={t.common.send || "Send"}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}