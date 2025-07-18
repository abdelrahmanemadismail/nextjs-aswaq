'use server'
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import { Menu } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
// import NotificationsPanel from "@/components/NotificationsPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import { CountrySelector } from "./country-selector";
import { headers } from "next/headers";
import { i18n, Locale } from "@/i18n.config";
import { createClient } from "@/utils/supabase/server";
import getTrans from "@/utils/translation";
import { ChatButton } from "@/components/ChatButton"; // Import the new ChatButton component

// Function to get a localized path
function getLocalizedPath(path: string, locale: string) {
  // If the path already starts with the locale, return it as is
  if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
    return path;
  }
  
  // If path starts with another locale, replace it
  for (const loc of i18n.locales) {
    if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
      return path.replace(`/${loc}`, `/${locale}`);
    }
  }
  
  // Otherwise, prepend the current locale
  return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
}

export default async function Header() {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  // Get user profile from Supabase
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? 
    await supabase.from('profiles').select('*').eq('id', user.id).single() : 
    { data: null };

  return (
    <header className="border-b bg-background">
      <div className="w-full lg:max-w-[1400px] mx-auto">
        <nav className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Logo */}
            <Link href={getLocalizedPath("/", locale)} className="flex-shrink-0" prefetch={true}>
              <Image
                src="/logo.svg"
                alt="ASWAQ Online"
                width={100}
                height={40}
                className="h-16"
                priority
              />
            </Link>
            <div className="hidden md:block">
              <CountrySelector />
            </div>
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:flex">
              <SearchInput />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4 justify-end">
              {/* Notifications */}
              {/* {profile && (
                <NotificationsPanel />
              )} */}

              {/* Language and Country Selectors */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
              </div>

              {/* Messages with Unread Count - Replace the old Messages button */}
              {profile && (
                <div className="hidden md:flex">
                  <ChatButton 
                    path={getLocalizedPath("/chat", locale)} 
                  />
                </div>
              )}

              {/* User Menu if logged in */}
              {profile && <UserMenu />}
              
              {/* Login Button - Hidden on mobile */}
              {!profile && (
                <Link href={getLocalizedPath("/auth/login", locale)}>
                  <Button 
                    variant="primary_outline" 
                    size="lg" 
                    className="hidden md:flex"
                  >
                    {t.auth.login}
                  </Button>
                </Link>
              )}

              {/* Sell Button - Visible on both mobile and desktop */}
              <Link 
                href={profile ? getLocalizedPath("/sell", locale) : getLocalizedPath("/auth/signup", locale)}
              >
                <Button size={profile ? "default" : "lg"} className="whitespace-nowrap">
                  {t.common.sell}
                </Button>
              </Link>

              {/* Mobile Menu - Only shown when user is NOT logged in */}
              {!profile && (
                <Sheet>
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
                      <div className="px-2">
                        <CountrySelector />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link href={getLocalizedPath("/auth/login", locale)}>
                          <Button variant="primary_outline" className="w-full">
                            {t.auth.login}
                          </Button>
                        </Link>
                        <Link href={getLocalizedPath("/auth/signup", locale)}>
                          <Button variant="primary_outline" className="w-full">
                            {t.auth.signup}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}