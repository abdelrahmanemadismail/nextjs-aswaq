// hooks/use-temp-images.ts
'use client'

import { useState, useEffect } from 'react'
import { getTempImages } from '@/services/temp-image-service'

interface TempImageMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  createdAt: string;
}

export function useTempImages() {
  const [tempImages, setTempImages] = useState<TempImageMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTempImages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const images = await getTempImages()
        setTempImages(images)
      } catch (err) {
        console.error('Error loading temporary images:', err)
        setError('Failed to load previously uploaded images.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTempImages()
  }, [])

  // Convert temp image metadata to File objects for use in the form
  const fetchTempImagesAsFiles = async (): Promise<File[]> => {
    try {
      setIsLoading(true)
      
      const filePromises = tempImages.map(async (image) => {
        try {
          // Fetch the image from the URL
          const response = await fetch(image.url)
          const blob = await response.blob()
          
          // Create a File object from the blob
          return new File([blob], image.fileName, { 
            type: image.fileType,
            lastModified: new Date(image.createdAt).getTime()
          })
        } catch (err) {
          console.error(`Error fetching image ${image.id}:`, err)
          return null
        }
      })
      
      const files = await Promise.all(filePromises)
      // Filter out any null values from failed fetches
      return files.filter((file): file is File => file !== null)
    } catch (err) {
      console.error('Error converting temp images to files:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tempImages,
    isLoading,
    error,
    fetchTempImagesAsFiles
  }
}