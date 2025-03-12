'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { Languages } from '@/constants/enums'

const steps = [
  { key: 'category', path: 'category' },
  { key: 'images', path: 'images' },
  { key: 'details', path: 'details' },
  { key: 'package', path: 'package' },
  { key: 'review', path: 'review' }
]

export function ProgressBar() {
  const { t, locale } = useTranslation()
  const pathname = usePathname()
  const isRTL = locale === Languages.ARABIC
  
  // Extract the current step from the pathname
  const currentPath = pathname.split('/').pop()
  
  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.path === currentPath)
  
  // Get labels for each step
  const getStepLabel = (key: string): string => {
    switch (key) {
      case 'category':
        return t.listings.form.chooseCategory
      case 'images':
        return t.listings.form.uploadImages
      case 'details':
        return t.listings.form.addDetails
      case 'package':
        return t.listings.packageSelection?.title || 'Select Package'
      case 'review':
        return t.listings.form.reviewListing
      default:
        return key
    }
  }
  
  return (
    <div className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          
          return (
            <div 
              key={step.key}
              className="flex flex-col items-center flex-1"
            >
              <div 
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full mb-1 
                  ${isComplete ? 'bg-primary text-primary-foreground' : 
                    isCurrent ? 'bg-primary text-primary-foreground' : 
                    'bg-muted text-muted-foreground'}
                `}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span 
                className={`text-xs text-center hidden sm:block
                  ${isCurrent ? 'text-primary font-medium' : 
                    isComplete ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                {getStepLabel(step.key)}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute top-0 h-full bg-primary transition-all duration-300"
          style={{ 
            [isRTL ? 'right' : 'left']: 0,
            width: `${Math.min(
              (currentStepIndex / (steps.length - 1)) * 100, 
              100
            )}%` 
          }}
        />
      </div>
    </div>
  )
}