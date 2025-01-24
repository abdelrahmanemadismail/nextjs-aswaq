import { MapPin, Clock } from "lucide-react"
import { formatDistance } from "date-fns"

export function ListingDescription({ 
  title, 
  location,
  timestamp,
  description 
}: {
  title: string
  location: string
  timestamp: string
  description: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {location}
          <span>•</span>
          <Clock className="h-4 w-4" />
          {formatDistance(new Date(timestamp), new Date(), { addSuffix: true })}
        </div>
      </div>
      
      <p className="whitespace-pre-wrap">{description}</p>
    </div>
  )
} 