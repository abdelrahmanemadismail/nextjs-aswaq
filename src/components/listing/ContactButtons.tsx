import { useState } from "react"
import { Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ContactButtons() {
  const [showPhone, setShowPhone] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Phone className="mr-2 h-4 w-4" />
            Phone Number
          </Button>
        </DialogTrigger>
        <DialogContent>
          {showPhone ? (
            <div className="text-2xl font-bold text-center">+971 XX XXX XXXX</div>
          ) : (
            <Button onClick={() => setShowPhone(true)} className="w-full">
              Show Number
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <Button variant="outline" className="w-full">
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat
      </Button>
    </div>
  )
} 