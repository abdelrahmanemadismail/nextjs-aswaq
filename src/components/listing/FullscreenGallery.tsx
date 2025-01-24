"use client"

import { useEffect } from "react"
import Image from "next/image"
import { getListingImageUrl } from "@/lib/storage"
import { ImageNavigation } from "../ImageNavigation"
import { X } from "lucide-react"

interface FullscreenGalleryProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function FullscreenGallery({ 
  images, 
  currentIndex, 
  onClose, 
  onIndexChange 
}: FullscreenGalleryProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 hover:text-gray-300"
        >
          <X size={24} />
          Back to gallery
        </button>
        <span className="text-sm">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Main image */}
      <div className="flex-1 relative">
        <Image
          src={getListingImageUrl(images[currentIndex])}
          alt=""
          fill
          className="object-contain"
          priority
        />
        <ImageNavigation
          total={images.length}
          current={currentIndex}
          onNext={() => onIndexChange((currentIndex + 1) % images.length)}
          onPrev={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
          onDotClick={onIndexChange}
          className="!text-white"
        />
      </div>

      {/* Thumbnail strip */}
      <div className="h-24 bg-black/50 p-4">
        <div className="flex gap-2 overflow-x-auto h-full">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`relative h-full aspect-square flex-shrink-0 
                ${currentIndex === i ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}
            >
              <Image
                src={getListingImageUrl(img)}
                alt=""
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 