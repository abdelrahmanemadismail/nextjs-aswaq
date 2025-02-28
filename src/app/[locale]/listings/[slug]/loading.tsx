// app/listings/[slug]/loading.tsx
import { Loader2 } from "lucide-react"

export default function ListingLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}