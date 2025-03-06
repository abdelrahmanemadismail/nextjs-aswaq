// components/listing/sell/ImageUpload.tsx

"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'

interface ImageUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: File[] | any[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

export function ImageUpload({ 
  images = [], 
  onChange, 
  maxFiles = 30,
  error 
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [objectUrls, setObjectUrls] = useState<string[]>([])
  
  // Create object URLs for files
  useEffect(() => {
    const urls: string[] = []
    
    images.forEach(file => {
      if (file instanceof File) {
        try {
          const url = URL.createObjectURL(file)
          urls.push(url)
        } catch (err) {
          console.error('Error creating object URL:', err)
          urls.push('')
        }
      } else {
        urls.push('')
      }
    })
    
    setObjectUrls(urls)
    
    // Cleanup function to revoke all object URLs when component unmounts
    return () => {
      urls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [images])
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - images.length
    const newFiles = acceptedFiles.slice(0, remainingSlots)
    onChange([...images, ...newFiles])
  }, [images, maxFiles, onChange])

  const removeImage = (index: number) => {
    // Revoke object URL for this image
    if (objectUrls[index]) {
      URL.revokeObjectURL(objectUrls[index])
    }
    
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/jpg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: images.length >= maxFiles
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
          isDragActive && "border-primary bg-primary/10",
          images.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p>{t.listings.photos.dropHere}</p>
          ) : (
            <>
              <p>{t.listings.photos.dragAndDrop}</p>
              <p className="text-sm text-muted-foreground">
                {t.listings.photos.maxImages.replace('{maxFiles}', maxFiles.toString())}
                {t.listings.photos.supportedFormats}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.listings.photos.uploadedCount
                  .replace('{current}', images.length.toString())
                  .replace('{max}', maxFiles.toString())}
              </p>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((file, index) => {
            // Skip invalid files or empty URLs
            if (!(file instanceof File) || !objectUrls[index]) {
              return null
            }
            
            return (
              <Card key={index} className="relative group">
                <div className="aspect-square relative">
                  <Image
                    src={objectUrls[index]}
                    alt={t.listings.photos.uploadAlt.replace('{index}', (index + 1).toString())}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => {
                      // Handle image loading errors
                      console.error(`Failed to load image at index ${index}`)
                    }}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  aria-label={t.listings.photos.removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}