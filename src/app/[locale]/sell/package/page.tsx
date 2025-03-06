// app/[locale]/sell/package/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, GiftIcon, Clock, Gem } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useListingFormStore } from '@/hooks/use-listing-form-store'
import { validateStep } from '@/utils/listing-form-validation'
import { getUserPackages } from '@/actions/payment-actions'
import { UserPackage } from '@/types/package'
import { Languages } from '@/constants/enums'
import { format } from 'date-fns'

export default function PackagePage() {
  const { t, locale, getLocalizedPath } = useTranslation()
  const router = useRouter()
  
  const [packages, setPackages] = useState<UserPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get form data from Zustand store
  const { 
    formData, 
    updateFormField, 
    setValidationError, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationErrors 
  } = useListingFormStore()
  
  // Selected package and bonus state
  const selectedPackageId = formData.package_details?.user_package_id
  const isBonus = formData.package_details?.is_bonus_listing

  // Load user's active packages
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getUserPackages()
        
        if (result.error) {
          setError(result.error)
        } else if (result.packages) {
          setPackages(result.packages)
          
          // Auto-select the first package if none is selected and packages are available
          if (result.packages.length > 0 && !selectedPackageId) {
            updatePackageSelection(result.packages[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading packages:', err)
        setError('Failed to load packages. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPackages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackageId])

  // Handle package selection
  const updatePackageSelection = async (packageId: string) => {
    try {
      // Import dynamically to avoid SSR issues
      const { checkPackageAvailability } = await import('@/actions/package-actions')
      
      // Check if regular listings are available
      const regularCheck = await checkPackageAvailability(packageId, false)
      
      if (regularCheck.available) {
        // Regular listings available, use regular
        // Ensure user_package_id is a string
        if (packageId) {
          // Ensure user_package_id is a string
          if (packageId) {
            updateFormField('package_details', {
              ...formData.package_details,
              user_package_id: packageId,
              is_bonus_listing: false
            })
          }
        }
      } else {
        // Regular listings not available, check for bonus
        const bonusCheck = await checkPackageAvailability(packageId, true)
        
        if (bonusCheck.available) {
          // Use bonus listing
          // Ensure user_package_id is a string
          if (packageId) {
            updateFormField('package_details', {
              ...formData.package_details,
              user_package_id: packageId,
              is_bonus_listing: true
            })
          }
        } else {
          // No listings available at all
          updateFormField('package_details', {
            ...formData.package_details,
            user_package_id: packageId,
            is_bonus_listing: false
          })
        }
      }
      
      // Clear validation errors
      setValidationError('package_details.user_package_id', null)
    } catch (err) {
      console.error('Error updating package selection:', err)
      
      // Fallback to client-side selection without availability check
      const selectedPackage = packages.find(p => p.id === packageId)
      
      if (selectedPackage) {
        const useBonus = selectedPackage.listings_remaining === 0 && 
                         selectedPackage.bonus_listings_remaining > 0
        
        if (packageId) {
          updateFormField('package_details', {
            ...formData.package_details,
            user_package_id: packageId,
            is_bonus_listing: useBonus
          })
        }
      }
    }
  }

  // Handle bonus toggle
  const handleBonusToggle = (useBonus: boolean) => {
    if (!formData.package_details?.user_package_id) return;
    
    updateFormField('package_details', {
      user_package_id: formData.package_details.user_package_id,
      is_bonus_listing: useBonus,
      is_featured: formData.package_details.is_featured
    })
  }

  // Determine if a package has available listings
  const getAvailableListings = (pkg: UserPackage, useBonus: boolean) => {
    return useBonus ? pkg.bonus_listings_remaining : pkg.listings_remaining
  }

  // Check if the selected package has available listings
  const canUseSelectedPackage = () => {
    if (!selectedPackageId) return false
    
    const selectedPackage = packages.find(p => p.id === selectedPackageId)
    if (!selectedPackage) return false
    
    return getAvailableListings(selectedPackage, !!isBonus) > 0
  }

  // Handle form navigation
  const handleNext = async () => {
    try {
      // Validate current step
      const validation = await validateStep('package', formData)
      
      if (!validation.valid) {
        // Set validation errors
        if (validation.errors) {
          Object.entries(validation.errors).forEach(([field, message]) => {
            setValidationError(field, message)
          })
        }
        return
      }
      
      // Check if the selected package has available listings
      if (!canUseSelectedPackage()) {
        setError(t.listings.packageSelection?.noAvailableListings || 
                 "No listings available with this package")
        return
      }
      
      // Update the current step in the store
      useListingFormStore.getState().setCurrentStep('package')
      
      // Navigate to review step
      router.push(getLocalizedPath(`/sell/review`))
    } catch (err) {
      console.error('Error navigating to next step:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }
  
  const handleBack = () => {
    router.push(getLocalizedPath('/sell/details'))
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && packages.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">{t.payments.errorLoadingPackages}</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={handleBack}>
            {t.common.back}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (packages.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t.userPackages.noPackages.title}</CardTitle>
          <CardDescription>{t.userPackages.noPackages.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <a 
            href={`/${locale}/packages`} 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            {t.userPackages.noPackages.viewPackages}
          </a>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleBack}>
            {t.common.back}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.payments.selectPlan}</CardTitle>
        <CardDescription>
          {t.listings.packageSelection?.description || "Select a package to publish your listing"}
        </CardDescription>
      </CardHeader>
      
      {error && (
        <CardContent className="pt-0 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}
      
      <CardContent>
        <RadioGroup 
          className="space-y-4"
          value={selectedPackageId || ''} 
          onValueChange={updatePackageSelection}
        >
          {packages.map((pkg) => {
            const packageName = locale === Languages.ARABIC && pkg.package?.name_ar 
              ? pkg.package.name_ar 
              : pkg.package?.name
            
            const isActive = pkg.id === selectedPackageId
            const hasRegularListings = pkg.listings_remaining > 0
            const hasBonusListings = pkg.bonus_listings_remaining > 0
            const isExpiringSoon = new Date(pkg.expires_at).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
            
            return (
              <div 
                key={pkg.id}
                className={`border rounded-lg p-4 relative ${isActive ? 'border-primary' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={pkg.id} id={pkg.id} className="mt-1" />
                  <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">{packageName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t.userPackages.card.purchased}: {format(new Date(pkg.created_at), 'PP')}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 md:mt-0">
                        {pkg.is_featured && (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            <Gem className="mr-1 h-3 w-3" />
                            {t.userPackages.card.featured}
                          </Badge>
                        )}
                        <Badge variant={isExpiringSoon ? 'destructive' : 'outline'}>
                          <Clock className="mr-1 h-3 w-3" />
                          {t.userPackages.card.expires}: {format(new Date(pkg.expires_at), 'PP')} 
                          {isExpiringSoon && ` ${t.userPackages.card.soon}`}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">{t.userPackages.card.regularListings}</span>
                        <div className="flex items-center mt-1">
                          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${hasRegularListings ? 'bg-primary' : 'bg-destructive'}`}
                              style={{ width: `${Math.max((1 - pkg.listings_remaining / (pkg.package?.listing_count ?? 1)) * 100, 0)}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm">
                            {pkg.listings_remaining} / {pkg.package?.listing_count ?? 0}
                          </span>
                        </div>
                      </div>
                      
                      {(pkg.package?.bonus_listing_count ?? 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium flex items-center">
                            {t.userPackages.card.bonusListings}
                            <GiftIcon className="ml-1 h-3 w-3 text-amber-500" />
                          </span>
                          <div className="flex items-center mt-1">
                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${hasBonusListings ? 'bg-amber-500' : 'bg-destructive'}`}
                                style={{ width: `${Math.max((1 - pkg.bonus_listings_remaining / (pkg.package?.bonus_listing_count ?? 1)) * 100, 0)}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm">
                              {pkg.bonus_listings_remaining} / {pkg.package?.bonus_listing_count ?? 0}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          {t.userPackages.card.listingDuration} {pkg.package?.duration_days} {t.userPackages.card.days}
                        </div>
                        {(pkg.package?.bonus_duration_days ?? 0) > 0 && (
                          <div>
                            {t.userPackages.card.bonusDuration} {pkg.package?.bonus_duration_days} {t.userPackages.card.days}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
                
                {/* Show status indicators or warnings */}
                {isActive && (
                  <div className={`mt-4 ${!canUseSelectedPackage() ? 'border-t border-destructive pt-3' : ''}`}>
                    {!hasRegularListings && !hasBonusListings ? (
                      <div className="flex items-center text-destructive">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>
                          {t.listings.packageSelection?.noListingsAvailable || "No listings available with this package"}
                        </span>
                      </div>
                    ) : !hasRegularListings && hasBonusListings ? (
                      <div className="flex items-center text-amber-500">
                        <GiftIcon className="h-4 w-4 mr-2" />
                        <span>
                          {t.listings.packageSelection?.usingBonusListing || "Using bonus listing from your package"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>
                          {t.listings.packageSelection?.readyToPublish || "Ready to publish your listing"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Bonus toggle option if both regular and bonus listings are available */}
                {isActive && hasRegularListings && hasBonusListings && (
                  <div className="mt-4 border-t pt-4">
                    <RadioGroup 
                      className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4"
                      value={isBonus ? 'bonus' : 'regular'} 
                      onValueChange={(val) => handleBonusToggle(val === 'bonus')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id={`${pkg.id}-regular`} />
                        <Label htmlFor={`${pkg.id}-regular`}>
                          {t.listings.packageSelection?.useRegularListing || "Use regular listing"}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bonus" id={`${pkg.id}-bonus`} />
                        <Label htmlFor={`${pkg.id}-bonus`} className="flex items-center">
                          {t.listings.packageSelection?.useBonusListing || "Use bonus listing"}
                          <GiftIcon className="ml-1 h-3 w-3 text-amber-500" />
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {t.common.back}
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canUseSelectedPackage()}
        >
          {t.common.next}
        </Button>
      </CardFooter>
    </Card>
  )
}