"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import { Menu, Bell, Globe, User } from "lucide-react";
import { useState } from "react";
import { Messages } from "@/components/Icons";
import { UserMenu } from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import NotificationsPanel from "@/components/NotificationsPanel";

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useProfile();
  const [showNotifications, setShowNotifications] = useState(false)
  const toggleNotifications = () => setShowNotifications(!showNotifications)
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
  ]


  return (
    <header className="border-b bg-background">
      <div className="max-w-[1400px] mx-auto">
        <nav className="px-2 lg:px-4 py-3">
          <div className="flex items-center justify-between gap-4 md:gap-6 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0" prefetch={true}>
              <Image
                src="/logo.svg"
                alt="ASWAQ Online"
                width={140}
                height={40}
                className="h-16"
                priority
              />
            </Link>

            {/* Location Selector */}
            {/* <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2 text-primary"
              size="sm"
            >
              <MapPin className="h-4 w-4" />
              Location
            </Button> */}

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
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2"
                size="sm"
              >
                <Globe className="scale-110" />
                العربية
              </Button>

              {/* Messages */}
              {profile && <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-primary hover:text-primary"
              >
                <Messages className="scale-150" />
              </Button>}

              {profile && <UserMenu />}
              
              {/* Login Button - Hidden on mobile */}
              {!profile && (
                <Button 
                  variant="primary_outline" 
                  size="lg" 
                  className="hidden md:flex"
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </Button>
              )}

              {/* Sell Button - Hidden on mobile */}
              <Button size="lg" className="hidden md:flex" onClick={() => {
                if (profile) {
                  router.push('/sell')
                } else {
                  router.push('/auth/signup')
                }
              }}>
                Sell
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="px-2">
                      <SearchInput />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-primary"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-primary"
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-primary"
                      >
                        <Messages className="h-4 w-4" />
                        Messages
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 text-primary"
                      >
                        <Globe className="h-4 w-4" />
                        العربية
                      </Button>
                      <Button variant="primary_outline">
                        Login
                      </Button>
                      <Button>Sell</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
