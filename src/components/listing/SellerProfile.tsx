// components/listing/SellerProfile.tsx
"use client"

import { useState } from "react"
import { User, Phone, MessageCircle, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface SellerProfileProps {
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    verification_status: 'unverified' | 'pending' | 'verified'
    join_date: string
  }
  averageRating?: number
  totalListings?: number
}

export function SellerProfile({ user, averageRating = 0, totalListings = 0 }: SellerProfileProps) {
  const [showPhone, setShowPhone] = useState(false)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.full_name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{user.full_name}</h3>
              {user.verification_status === 'verified' && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {averageRating.toFixed(1)}
              </div>
              <div>•</div>
              <div>{totalListings} listings</div>
              <div>•</div>
              <div>Member since {format(new Date(user.join_date), 'MMM yyyy')}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Phone Number
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="text-center">
                {showPhone ? (
                  <p className="text-2xl font-bold">+971 XX XXX XXXX</p>
                ) : (
                  <Button onClick={() => setShowPhone(true)}>Show Number</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>

        <div className="mt-6">
          <Button variant="link" className="h-auto p-0">
            <User className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}