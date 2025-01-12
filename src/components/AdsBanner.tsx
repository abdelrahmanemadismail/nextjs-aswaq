'use client'
import { useState } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import ImageNavigation  from "@/components/ImageNavigation"

export interface AdsBannerProps {
  photos: string[]
  className?: string
  aspectRatio?: "square" | "video" | "portrait"
}

const ASPECT_RATIOS = {
  square: "h-[400px]",
  video: "h-[300px]",
  portrait: "h-[500px]"
}

export default function AdsBanner({
  photos,
  className = "",
  aspectRatio = "square",
}: AdsBannerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length)
  }

  return (
    <Card className={`w-full max-w-full overflow-hidden border-none shadow-none ${className}`}>
      <div className="relative">
        <Image
          src={photos[currentPhotoIndex]}
          alt={`Photo ${currentPhotoIndex + 1}`}
          width={1600}
          height={400}
          className={`object-cover rounded-3xl ${ASPECT_RATIOS[aspectRatio]}`}
        />

        <ImageNavigation
          total={photos.length}
          current={currentPhotoIndex}
          onNext={nextPhoto}
          onPrev={prevPhoto}
          onDotClick={setCurrentPhotoIndex}
          className="z-10"
          arrowVisible={false}
          arrowSize="sm"
        />
      </div>
    </Card>
  )
}