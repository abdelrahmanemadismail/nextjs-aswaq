import { Waypoints } from "lucide-react"

export function ListingHighlights() {
  return (
    <div className="grid grid-cols-6 gap-4 py-4">
      <div className="flex flex-col items-center">
        <Waypoints className="h-6 w-6 text-muted-foreground" />
        <span className="mt-2 text-sm font-medium">20000</span>
      </div>
      {/* Repeat for other highlights */}
    </div>
  )
} 