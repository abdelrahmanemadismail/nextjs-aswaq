'use client';

import { Globe } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation'
import { Languages } from '@/constants/enums'
import { useLanguageStore } from '@/lib/stores/languageStore'
import { i18n, LanguageType } from '@/i18n.config'
import { Button } from "./ui/button";
import { updatePreferredLanguage } from "@/actions/auth-actions";
import { useEffect } from "react";

export default function LanguageSwitcher({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const { setLanguage } = useLanguageStore()

    // On component mount, read language from cookies or localStorage
    useEffect(() => {
        // Extract current locale from pathname
        const pathSegments = pathname.split('/')
        const currentLocale = i18n.locales.includes(pathSegments[1] as LanguageType)
            ? pathSegments[1]
            : null

        if (currentLocale) {
            // Store the current language in localStorage
            localStorage.setItem('preferred-language', currentLocale)
            // Update the store
            setLanguage(currentLocale as Languages)
        } else {
            // Try to get from localStorage
            const storedLang = localStorage.getItem('preferred-language')
            if (storedLang && i18n.locales.includes(storedLang as LanguageType)) {
                setLanguage(storedLang as Languages)
            }
        }
    }, [pathname, setLanguage])

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

    const switchLanguage = async () => {
        // Determine which language to switch to
        const newLanguage = pathname.startsWith(`/${Languages.ARABIC}`)
            ? Languages.ENGLISH
            : Languages.ARABIC

        // Store the new language in localStorage
        localStorage.setItem('preferred-language', newLanguage)
        
        // Store in a cookie as well for server-side access
        document.cookie = `preferred-language=${newLanguage}; max-age=${60 * 60 * 24 * 365}; path=/`;
        
        // Update the language in the store
        setLanguage(newLanguage)
        
        // Update the user's preferred language in Supabase
        const result = await updatePreferredLanguage({
            preferredLanguage: newLanguage
        })

        if (!result.success) {
            console.error('Failed to save language preference:', result.error)
        }
        
        // Navigate to the new path with the updated locale
        const newPath = getLocalizedPath(newLanguage)
        // Add setLang parameter for middleware
        router.push(`${newPath}?setLang=${newLanguage}`)
    }

    return (
        <Button
            variant="ghost"
            className={`justify-center gap-2 text-primary w-full ${className}`}
            onClick={switchLanguage}
        >
            <Globe className="h-4 w-4" />
            <span className="hidden md:flex">{pathname.startsWith(`/${Languages.ARABIC}`) ? 'English' : 'العربية'}</span>
        </Button>
    );
}