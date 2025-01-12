'use client'
import { useState } from "react"
import { Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface LikeButtonProps {
  initialLiked?: boolean
  onLike?: (isLiked: boolean) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

const BUTTON_SIZES = {
  sm: { button: "h-8 w-8", icon: "w-4 h-4" },
  md: { button: "h-10 w-10", icon: "w-5 h-5" },
  lg: { button: "h-12 w-12", icon: "w-6 h-6" }
}

export default function LikeButton({ 
  initialLiked = false, 
  onLike, 
  className = "",
  size = "md"
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)

  const handleLike = () => {
    const newLikedState = !liked
    setLiked(newLikedState)
    onLike?.(newLikedState)
  }

  const sizeClasses = BUTTON_SIZES[size]

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`bg-background rounded-full hover:bg-accent/90 ${sizeClasses.button} ${className}`}
      onClick={handleLike}
    >
      <Heart 
        className={`${sizeClasses.icon} transition-colors ${
          liked ? 'fill-red-500 stroke-red-500' : 'stroke-primary'
        }`} 
      />
    </Button>
  )
}