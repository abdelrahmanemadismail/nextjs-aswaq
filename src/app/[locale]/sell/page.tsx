'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { stepToPath } from '@/utils/listing-form-validation'
import { useTranslation } from '@/hooks/use-translation'
import { initDB } from '@/services/indexedDB'

export default function SellPage() {
  const router = useRouter()
  const { locale } = useTranslation();
  const { currentStep, loadImagesFromIndexedDB } = useListingFormStore()
  
  useEffect(() => {
    // Initialize IndexedDB and ensure images are loaded
    const init = async () => {
      try {
        // Initialize the database first
        await initDB()
        
        // Try to load any saved images
        await loadImagesFromIndexedDB()
        
        // Convert the current step to a URL path and redirect
        const path = stepToPath[currentStep]
        router.push(`/${locale}/sell/${path}`)
      } catch (error) {
        console.error('Error initializing:', error)
        // Even if there's an error, redirect to the first step
        router.push(`/${locale}/sell/category`)
      }
    }
    
    init()
  }, [locale, router, currentStep, loadImagesFromIndexedDB])
  
  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}