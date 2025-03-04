import { MapPin, Clock } from "lucide-react"
import { formatDistance } from "date-fns"
import { Languages } from "@/constants/enums"
import { Locale } from "@/i18n.config"
import { headers } from "next/headers"

export async function ListingDescription({ 
  title, 
  title_ar,
  location,
  location_ar,
  timestamp,
  description,
  description_ar
}: {
  title: string
  title_ar?: string
  location: string
  location_ar?: string
  timestamp: string
  description: string
  description_ar?: string
}) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  // Choose localized content
  const localizedTitle = locale === Languages.ARABIC && title_ar ? title_ar : title
  const localizedLocation = locale === Languages.ARABIC && location_ar ? location_ar : location
  const localizedDescription = locale === Languages.ARABIC && description_ar ? description_ar : description

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{localizedTitle}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {localizedLocation}
          <span>•</span>
          <Clock className="h-4 w-4" />
          {formatDistance(new Date(timestamp), new Date(), { addSuffix: true })}
        </div>
      </div>
      
      <p className="whitespace-pre-wrap">{localizedDescription}</p>
    </div>
  )
}