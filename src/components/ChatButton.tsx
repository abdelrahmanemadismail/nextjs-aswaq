"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Messages } from "@/components/Icons"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"

interface ChatButtonProps {
  path: string
}

export function ChatButton({ path }: ChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Function to fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      
      // Query for unread messages
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', user.id)
        .is('read_at', null)
        
      if (error) {
        console.error('Error fetching unread count:', error)
        return
      }
      
      // Set the unread count
      setUnreadCount(data?.length || 0)
    } catch (error) {
      console.error('Error in fetchUnreadCount:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase]) // Add supabase as a dependency

  // Use polling instead of realtime subscriptions
  useEffect(() => {
    // Fetch initial count
    fetchUnreadCount()
    
    // Set up polling interval (every 10 seconds)
    const intervalId = setInterval(() => {
      fetchUnreadCount()
    }, 10000)
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [fetchUnreadCount]) // Add fetchUnreadCount to the dependency array

  return (
    <Link href={path} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        aria-label="Messages"
      >
        <Messages className="scale-150" />
        {!isLoading && unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-xs"
            variant="destructive"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}