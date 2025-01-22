import * as React from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Loader2, Upload } from "lucide-react"

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
  accept?: Record<string, string[]>
  maxSize?: number
}

export function ImageUpload({
  onUpload,
  isUploading = false,
  accept,
  maxSize,
}: ImageUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        await onUpload(acceptedFiles[0])
      }
    },
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors",
        isDragActive && "border-primary bg-primary/10",
        isUploading && "pointer-events-none opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        {isDragActive ? (
          <p>Drop the image here ...</p>
        ) : (
          <>
            <p>Drag & drop an image here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: {(maxSize || 0) / (1024 * 1024)}MB
            </p>
          </>
        )}
      </div>
    </div>
  )
} 