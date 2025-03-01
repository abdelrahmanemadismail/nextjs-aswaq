"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import { Menu, Bell, Globe } from "lucide-react";
import { useState } from "react";
import { Messages } from "@/components/Icons";
import { UserMenu } from "@/components/UserMenu";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import NotificationsPanel from "@/components/NotificationsPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/hooks/use-translation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useProfile();
  const { t, locale, getLocalizedPath } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const toggleNotifications = () => setShowNotifications(!showNotifications);
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
      isUnread: true,
    },
  ];

  // Helper function to navigate with locale preserved
  const navigateTo = (path: string) => {
    router.push(getLocalizedPath(path));
  };

  return (
    <header className="border-b bg-background">
      <div className="max-w-[1400px] mx-auto">
        <nav className="px-2 lg:px-4 py-3">
          <div className="flex items-center justify-between gap-4 md:gap-6 lg:gap-8">
            {/* Logo */}
            <Link href={getLocalizedPath("/")} className="flex-shrink-0" prefetch={true}>
              <Image
                src="/logo.svg"
                alt="ASWAQ Online"
                width={140}
                height={40}
                className="h-16"
                priority
              />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchInput />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4 justify-end">
              {/* Notifications */}
              {profile && <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={toggleNotifications}
                >
                  <Bell className="scale-125" />
                </Button>
                {showNotifications && (
                <div className="absolute w-max top-full right-0 z-50">
                  <NotificationsPanel
                    notifications={notifications}
                    unreadCount={6}
                    onClose={() => setShowNotifications(false)}
                    onClearAll={() => console.log("clear all")}
                  />
                </div>
              )}
              </div>}

              {/* Language Switcher */}
              <LanguageSwitcher/>

              {/* Messages */}
              {profile && <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-primary hover:text-primary"
                onClick={() => navigateTo("/chat")}
              >
                <Messages className="scale-150" />
              </Button>}

              {/* User Menu if logged in */}
              {profile && <UserMenu />}
              
              {/* Login Button - Hidden on mobile */}
              {!profile && (
                <Button 
                  variant="primary_outline" 
                  size="lg" 
                  className="hidden md:flex"
                  onClick={() => navigateTo("/auth/login")}
                >
                  {t.auth.login}
                </Button>
              )}

              {/* Sell Button - Visible on both mobile and desktop */}
              <Button 
                size="lg" 
                onClick={() => {
                  if (profile) {
                    navigateTo("/sell");
                  } else {
                    navigateTo("/auth/signup");
                  }
                }}
              >
                {t.common.sell}
              </Button>

              {/* Mobile Menu */}
              {!profile && (<Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">{t.common.toggleMenu}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>{t.common.aswaqMenu}</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="px-2">
                      <SearchInput />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button 
                          variant="primary_outline" 
                          onClick={() => {
                            navigateTo("/auth/login");
                            setIsOpen(false);
                          }}
                        >
                          {t.auth.login}
                        </Button>
                        <LanguageSwitcher />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>)}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}