"use client"

// components/listing/ImageGallery.tsx
import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { getListingImageUrl } from "@/lib/storage"
import { ImageNavigation } from "../ImageNavigation"
import { FullscreenGallery } from "./FullscreenGallery"

export function ImageGallery({ images }: { images: string[] }) {
    const [mainIndex, setMainIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const displayedThumbnails = images.slice(0, 6)
    const remainingCount = images.length - 6
    
    return (
      <>
        <div className="flex gap-2">
          {/* Vertical thumbnail gallery */}
          <div className="hidden md:flex flex-col gap-2 w-20">
            {displayedThumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainIndex(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md transition-all",
                  mainIndex === i && "ring-2 ring-primary",
                  mainIndex !== i && "opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={getListingImageUrl(img)}
                  alt=""
                  fill
                  className="object-cover"
                />
                {i === 5 && remainingCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFullscreen(true)
                    }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <span className="text-white font-medium">+{remainingCount}</span>
                  </button>
                )}
              </button>
            ))}
          </div>

          {/* Main image container */}
          <div className="flex-1">
            <div className="relative aspect-[16/10] md:aspect-[16/11]">
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute inset-0 z-10"
              >
                <Image
                  src={getListingImageUrl(images[mainIndex])}
                  alt=""
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </button>
            <ImageNavigation
              total={images.length}
              current={mainIndex}
              onNext={() => setMainIndex(i => (i + 1) % images.length)} 
              onPrev={() => setMainIndex(i => (i - 1 + images.length) % images.length)}
              onDotClick={setMainIndex}
            />
            </div>

            {/* Mobile thumbnail gallery */}
            <div className="md:hidden grid grid-cols-6 gap-2 mt-2">
              {displayedThumbnails.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainIndex(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md",
                    mainIndex === i && "ring-2 ring-primary"
                  )}
                >
                  <Image
                    src={getListingImageUrl(img)}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  {i === 5 && remainingCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsFullscreen(true)
                      }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <span className="text-white font-medium">+{remainingCount}</span>
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fullscreen gallery modal */}
        {isFullscreen && (
          <FullscreenGallery
            images={images}
            currentIndex={mainIndex}
            onClose={() => setIsFullscreen(false)}
            onIndexChange={setMainIndex}
          />
        )}
      </>
    )
}