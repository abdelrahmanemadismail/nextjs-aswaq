"use client";

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
  // Wallet,
  LayoutList,
  Heart,
  Percent,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/context/ProfileContext";

export function UserMenu() {
  const { profile, refreshProfile } = useProfile();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await signOut();
      await refreshProfile(); // Refresh the user state after signing out
      router.push("/"); // Redirect to home page
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-background p-1 pr-3 shadow-sm">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt="User avatar" />
            <AvatarFallback><User className="h-4 w-4 text-primary" /></AvatarFallback>
          </Avatar>
          <Menu className="h-5 w-5 text-primary" />
        </button>
        {/* <span className="text-sm font-medium">{user?.role}</span> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push('/profile')}>
          <User className="h-5 w-5 text-primary" />
          <span>Profile</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="gap-2 py-3">
          <Wallet className="h-5 w-5 text-primary" />
          <span>Aswaq wallet</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem className="gap-2 py-3">
          <LayoutList className="h-5 w-5 text-primary" />
          <span>Ads Listing</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3">
          <Heart className="h-5 w-5 text-primary" />
          <span>Favourites</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3">
          <Percent className="h-5 w-5 text-primary" />
          <span>Promotion Packages</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push('/help')}>
          <HelpCircle className="h-5 w-5 text-primary" />
          <span>Help</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push('/settings')}>
          <Settings className="h-5 w-5 text-primary" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={handleSignOut}>
          <LogOut className="h-5 w-5 text-primary" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
