'use client'

import { Trash2, Clock, Bell } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/hooks/use-translation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export interface Notification {
  id: string
  image: string
  status: string
  title: string
  timestamp: string
  isUnread: boolean
}

interface NotificationsPanelProps {
  unreadCount?: number
  onClearAll?: () => void
}

export default function NotificationsPanel({
  unreadCount: propUnreadCount,
  onClearAll,
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  
  // Sample notifications (in a real implementation, these would be fetched from a database)
  const notifications = [
    {
      id: '1',
      image: '/400.svg',
      status: 'UNSOLD',
      title: 'Canon EOS 7D 18.0MP Digital SLR Camera Black w/ Charger',
      timestamp: '31 minutes ago',
      isUnread: true,
    },
    {
      id: '2',
      image: '/400.svg',
      status: 'UNSOLD',
      title: 'Canon EOS 7D 18.0MP Digital SLR Camera Black w/ Charger',
      timestamp: '31 minutes ago',
      isUnread: true,
    },
    {
      id: '3',
      image: '/400.svg',
      status: 'UNSOLD',
      title: 'Canon EOS 7D 18.0MP Digital SLR Camera Black w/ Charger',
      timestamp: '31 minutes ago',
      isUnread: false,
    },
  ];

  // Calculate unread count if not provided
  const unreadCount = propUnreadCount ?? notifications.filter(n => n.isUnread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="scale-125" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="text-base font-semibold">{t.common.notifications}</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2 gap-1"
              onClick={onClearAll}
            >
              {t.common.delete}
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup className="max-h-[calc(80vh-100px)] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer px-4 py-3 focus:bg-accent h-auto" asChild>
                <div>
                  <div className="flex items-start gap-3 relative w-full">
                    <div className="relative h-14 w-14 flex-shrink-0">
                      <Image
                        src={notification.image}
                        alt=""
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <Badge variant="secondary" className="font-medium bg-secondary text-secondary-foreground text-xs whitespace-nowrap">
                          {notification.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{notification.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-tight text-foreground truncate">
                        {notification.title}
                      </p>
                    </div>
                    {notification.isUnread && (
                      <div className="absolute right-0 top-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 text-center text-muted-foreground px-4">
              <p>{t.common.noMessages || "No notifications yet"}</p>
            </div>
          )}
        </DropdownMenuGroup>
        
        {unreadCount > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="outline"
              className="w-full text-sm h-8"
              size="sm"
            >
              {t.common.loadMore} ({unreadCount})
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}