'use client';

import { Globe } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation'
import { Languages } from '@/constants/enums'
import { useLanguageStore } from '@/lib/stores/languageStore'
import { i18n, LanguageType } from '@/i18n.config'
import { Button } from "./ui/button";

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { setLanguage } = useLanguageStore()

  // Function to get the localized path when switching languages
  const getLocalizedPath = (newLocale: LanguageType) => {
    // Extract current locale from pathname
    const pathSegments = pathname.split('/')
    const currentLocale = i18n.locales.includes(pathSegments[1] as LanguageType) 
      ? pathSegments[1] 
      : null

    if (currentLocale) {
      // Replace current locale with new locale
      pathSegments[1] = newLocale
      return pathSegments.join('/')
    } else {
      // Add new locale to the path
      return `/${newLocale}${pathname}`
    }
  }

  const switchLanguage = () => {
    // Determine which language to switch to
    const newLanguage = pathname.startsWith(`/${Languages.ARABIC}`) 
      ? Languages.ENGLISH 
      : Languages.ARABIC
    
    // Update the language in the store
    setLanguage(newLanguage)
    
    // Navigate to the new path with the updated locale
    const newPath = getLocalizedPath(newLanguage)
    router.push(newPath)
  }

  return (
    <Button
      variant="ghost"
      className="justify-center gap-2 text-primary"
      onClick={switchLanguage}
    >
      <Globe className="h-4 w-4" />
      {pathname.startsWith(`/${Languages.ARABIC}`) ? 'English' : 'العربية'}
    </Button>
  );
}