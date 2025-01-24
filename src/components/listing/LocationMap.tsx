import { MapPin } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ListingMap } from "@/components/listing/ListingMap"

export function LocationMap({ location }: { location: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </CardTitle>
        <CardDescription>{location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] rounded-lg overflow-hidden">
          <ListingMap location={location} />
        </div>
      </CardContent>
    </Card>
  )
} 