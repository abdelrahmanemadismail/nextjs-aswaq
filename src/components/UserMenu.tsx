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
  // LayoutList,
  // Heart,
  Package,
  Percent,
  HelpCircle,
  Settings,
  LogOut,
  Globe,
} from "lucide-react";
import { signOut } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/context/ProfileContext";
import { useTranslation } from "@/hooks/use-translation";
import { Languages } from "@/constants/enums";

export function UserMenu() {
  const { profile, refreshProfile } = useProfile();
  const router = useRouter();
  const { t, getLocalizedPath, locale, switchLanguage } = useTranslation();
  
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
  
  // Get the opposite language label to display
  const languageToSwitchTo = locale === Languages.ARABIC ? 'English' : 'العربية';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-background p-1 pr-3 shadow-sm">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={t.account.userAvatar} />
            <AvatarFallback><User className="h-4 w-4 text-primary" /></AvatarFallback>
          </Avatar>
          <Menu className="h-5 w-5 text-primary" />
        </button>
        {/* <span className="text-sm font-medium">{user?.role}</span> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/profile"))}>
          <User className="h-5 w-5 text-primary" />
          <span>{t.account.profile}</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="gap-2 py-3">
          <Wallet className="h-5 w-5 text-primary" />
          <span>Aswaq wallet</span>
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem className="gap-2 py-3">
          <LayoutList className="h-5 w-5 text-primary" />
          <span>Ads Listing</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3">
          <Heart className="h-5 w-5 text-primary" />
          <span>Favourites</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/profile/packages"))}>
          <Package className="h-5 w-5 text-primary" />
          <span>{t.account.myPackages}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/packages"))}>
          <Percent className="h-5 w-5 text-primary" />
          <span>{t.account.promotionPackages}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/help"))}>
          <HelpCircle className="h-5 w-5 text-primary" />
          <span>{t.account.help}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={() => router.push(getLocalizedPath("/settings"))}>
          <Settings className="h-5 w-5 text-primary" />
          <span>{t.account.settings}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={switchLanguage}>
          <Globe className="h-5 w-5 text-primary" />
          <span>{languageToSwitchTo}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-3" onClick={handleSignOut}>
          <LogOut className="h-5 w-5 text-primary" />
          <span>{t.account.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}