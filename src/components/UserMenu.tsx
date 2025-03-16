"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  User,
  Package,
  Percent,
  HelpCircle,
  Settings,
  LogOut,
  LayoutList,
} from "lucide-react";
import { signOut } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/context/ProfileContext";
import { useTranslation } from "@/hooks/use-translation";
import { Messages } from "./Icons";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

export function UserMenu() {
  const { profile, refreshProfile } = useProfile();
  const router = useRouter();
  const { t, getLocalizedPath } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  
  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Query for unread messages
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', user.id)
        .is('read_at', null);
        
      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }
      
      // Set the unread count
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error in fetchUnreadCount:', error);
    }
  };

  // Use polling to update unread count
  useEffect(() => {
    // Fetch initial count
    fetchUnreadCount();
    
    // Set up polling interval (every 10 seconds)
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 10000);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      await refreshProfile(); // Refresh the user state after signing out
      router.push(getLocalizedPath("/")); // Redirect to home page with locale
      toast({
        title: t.account.signOutSuccess,
        description: t.account.signOutSuccessDescription,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t.account.signOutError,
        description: t.account.signOutErrorDescription,
        variant: "destructive",
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-background p-1 pr-3 shadow-sm relative">
          {/* Avatar with notification badge if there are unread messages */}
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt={t.account.userAvatar} />
              <AvatarFallback><User className="h-4 w-4 text-primary" /></AvatarFallback>
            </Avatar>
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 md:hidden flex items-center justify-center bg-red-500 text-white text-xs"
                variant="destructive"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <Menu className="h-5 w-5 text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/profile"))}>
          <User className="h-5 w-5 text-primary" />
          <span>{t.account.profile}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/my-listings"))}>
          <LayoutList className="h-5 w-5 text-primary" />
          <span>{t.account.myListings}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/profile/packages"))}>
          <Package className="h-5 w-5 text-primary" />
          <span>{t.account.myPackages}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/packages"))}>
          <Percent className="h-5 w-5 text-primary" />
          <span>{t.account.promotionPackages}</span>
        </DropdownMenuItem>
        {/* Messages menu item with unread count */}
        <DropdownMenuItem className="gap-2 py-3 relative" onClick={() => router.push(getLocalizedPath("/chat"))}>
          <div className="relative">
            <Messages className="h-5 w-5 text-primary" />
          </div>
          <span>{t.account.messages}</span>
          {unreadCount > 0 && (
            <Badge 
              className="ml-auto min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/help"))}>
          <HelpCircle className="h-5 w-5 text-primary" />
          <span>{t.account.help}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/settings"))}>
          <Settings className="h-5 w-5 text-primary" />
          <span>{t.account.settings}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={handleSignOut}>
          <LogOut className="h-5 w-5 text-primary" />
          <span>{t.account.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}