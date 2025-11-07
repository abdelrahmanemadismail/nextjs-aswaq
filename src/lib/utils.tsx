import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from "lucide-react"
import { Vehicles, Hobbies } from '@/components/Icons'
import { UaeDirham } from "@/components/Icons/UaeDirham"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale: string = 'en'): React.ReactNode {
  const formattedNumber = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    maximumFractionDigits: 0,
  }).format(price)

  // Return with the new UAE Dirham symbol
  return (
    <span className="flex items-center">
      {locale === 'ar' ? (
        <>
          {formattedNumber}
          <UaeDirham className="h-4 w-4 ml-1" />
        </>
      ) : (
        <>
          <UaeDirham className="h-4 w-4 mr-1" />
          {formattedNumber}
        </>
      )}
    </span>
  )
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .trim()
}

export const getIcon = (iconName: string | null) => {
  if (!iconName) return null
  const iconKey = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  if (iconKey === 'Vehicles') return Vehicles
  return ((LucideIcons as unknown) as { [key: string]: React.ComponentType })[iconKey] || Hobbies
}