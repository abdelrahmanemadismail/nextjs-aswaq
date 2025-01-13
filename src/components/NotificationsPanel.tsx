'use client'

import { X, Trash2, Clock } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Notification {
  id: string
  image: string
  status: string
  title: string
  timestamp: string
  isUnread: boolean
}

interface NotificationsPanelProps {
  notifications?: Notification[]
  unreadCount?: number
  onClose?: () => void
  onClearAll?: () => void
}

export default function NotificationsPanel({
  notifications = [],
  unreadCount = 0,
  onClose,
  onClearAll,
}: NotificationsPanelProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <h2 className="text-xl font-semibold text-foreground">Your notifications</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <div className="px-4 pb-2 flex justify-end">
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 px-2 py-1"
          onClick={onClearAll}
        >
          Clear all
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          {notifications?.map((notification, index) => (
            <div key={notification.id}>
              <div className="flex items-start gap-4 relative mb-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image
                    src={notification.image}
                    alt=""
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="font-medium bg-secondary text-secondary-foreground">
                      {notification.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{notification.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-tight pr-6 text-foreground">
                    {notification.title}
                  </p>
                </div>
                {notification.isUnread && (
                  <div className="absolute right-0 -top-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </div>
              {index < notifications.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="w-full mt-4"
          >
            {unreadCount} more unread notifications
          </Button>
        )}
      </CardContent>
    </Card>
  )
}