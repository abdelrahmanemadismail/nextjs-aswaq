// components/listing/steps/PackageSelectionStep.tsx

"use client"

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, GiftIcon, Clock, Gem } from 'lucide-react'
import { getUserPackages } from '@/actions/payment-actions'
import { useTranslation } from '@/hooks/use-translation'
import { Languages } from '@/constants/enums'
import { UserPackage } from '@/types/package'
import { format } from 'date-fns'

export function PackageSelectionStep() {
  const { t, locale } = useTranslation()
  const isArabic = locale === Languages.ARABIC
  
  const [packages, setPackages] = useState<UserPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { setValue, watch, formState } = useFormContext<ListingFormData>()
  const selectedPackageId = watch('package_details.user_package_id')
  const isBonus = watch('package_details.is_bonus_listing')

  // Load user's active packages
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setIsLoading(true)
        const result = await getUserPackages()
        
        if (result.error) {
          setError(result.error)
        } else if (result.packages) {
          setPackages(result.packages)
          
          // Auto-select the first package if none is selected and packages are available
          if (result.packages.length > 0 && !selectedPackageId) {
            setValue('package_details.user_package_id', result.packages[0].id, { 
              shouldValidate: true 
            })
            
            // Set bonus if regular listings are depleted but bonus are available
            if (result.packages[0].listings_remaining === 0 && result.packages[0].bonus_listings_remaining > 0) {
              setValue('package_details.is_bonus_listing', true, { shouldValidate: true })
            }
          }
        }
      } catch (err) {
        setError('Failed to load packages')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPackages()
  }, [setValue, selectedPackageId])

  // Handle package selection with availability check
  const handlePackageSelect = async (packageId: string) => {
    setValue('package_details.user_package_id', packageId, { shouldValidate: true })
    
    // Reset bonus selection when changing packages
    const selectedPackage = packages.find(p => p.id === packageId)
    if (selectedPackage) {
      // Check if regular listings are available
      try {
        // Import dynamically to avoid SSR issues
        const { checkPackageAvailability } = await import('@/actions/package-actions')
        const regularCheck = await checkPackageAvailability(packageId, false)
        
        if (!regularCheck.available) {
          // Regular listings not available, check for bonus listings
          const bonusCheck = await checkPackageAvailability(packageId, true)
          if (bonusCheck.available) {
            // Use bonus listing if regular not available
            setValue('package_details.is_bonus_listing', true, { shouldValidate: true })
          } else {
            // Neither regular nor bonus listings available
            setValue('package_details.is_bonus_listing', false, { shouldValidate: true })
          }
        } else {
          // Regular listings available, default to regular
          setValue('package_details.is_bonus_listing', false, { shouldValidate: true })
        }
      } catch (error) {
        console.error('Error checking package availability:', error)
        // Fallback to client-side logic
        const useBonus = selectedPackage.listings_remaining === 0 && selectedPackage.bonus_listings_remaining > 0
        setValue('package_details.is_bonus_listing', useBonus, { shouldValidate: true })
      }
    }
  }

  // Handle bonus toggle
  const handleBonusToggle = (isBonus: boolean) => {
    setValue('package_details.is_bonus_listing', isBonus, { shouldValidate: true })
  }

  // Determine if the user has available listings with the selected package
  const getAvailableListings = (pkg: UserPackage, useBonus: boolean) => {
    return useBonus ? pkg.bonus_listings_remaining : pkg.listings_remaining
  }

  // Check if the selected package has available listings
  const canUseSelectedPackage = () => {
    if (!selectedPackageId) return false
    
    const selectedPackage = packages.find(p => p.id === selectedPackageId)
    if (!selectedPackage) return false
    
    return getAvailableListings(selectedPackage, isBonus!) > 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t.payments.errorLoadingPackages}</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (packages.length === 0) {
    return (
      <Card>
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
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t.payments.selectPlan}</CardTitle>
          <CardDescription>{t.listings.packageSelection?.description || "Select a package to publish your listing"}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            className="space-y-4"
            value={selectedPackageId} 
            onValueChange={handlePackageSelect}
          >
            {packages.map((pkg) => {
              const packageName = isArabic && pkg.package?.name_ar ? pkg.package.name_ar : pkg.package?.name
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
                                style={{ width: `${Math.max((1 - pkg.listings_remaining / pkg.package?.listing_count!) * 100, 0)}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm">
                              {pkg.listings_remaining} / {pkg.package?.listing_count}
                            </span>
                          </div>
                        </div>
                        
                        {pkg.package?.bonus_listing_count! > 0 && (
                          <div>
                            <span className="text-sm font-medium flex items-center">
                              {t.userPackages.card.bonusListings}
                              <GiftIcon className="ml-1 h-3 w-3 text-amber-500" />
                            </span>
                            <div className="flex items-center mt-1">
                              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${hasBonusListings ? 'bg-amber-500' : 'bg-destructive'}`}
                                  style={{ width: `${Math.max((1 - pkg.bonus_listings_remaining / pkg.package?.bonus_listing_count!) * 100, 0)}%` }}
                                />
                              </div>
                              <span className="ml-2 text-sm">
                                {pkg.bonus_listings_remaining} / {pkg.package?.bonus_listing_count}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 text-sm text-muted-foreground">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>{t.userPackages.card.listingDuration} {pkg.package?.duration_days} {t.userPackages.card.days}</div>
                          {pkg.package?.bonus_duration_days! > 0 && (
                            <div>{t.userPackages.card.bonusDuration} {pkg.package?.bonus_duration_days} {t.userPackages.card.days}</div>
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
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span>{t.listings.packageSelection?.noListingsAvailable || "No listings available with this package"}</span>
                        </div>
                      ) : !hasRegularListings && hasBonusListings ? (
                        <div className="flex items-center text-amber-500">
                          <GiftIcon className="h-4 w-4 mr-2" />
                          <span>{t.listings.packageSelection?.usingBonusListing || "Using bonus listing from your package"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>{t.listings.packageSelection?.readyToPublish || "Ready to publish your listing"}</span>
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
      </Card>
      
      {!canUseSelectedPackage() && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t.listings.packageSelection?.noAvailableListings || "No available listings"}
            </CardTitle>
            <CardDescription>
              {t.listings.packageSelection?.purchaseNewPackage || "You need to purchase a new package or choose a different package with available listings."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a 
              href={`/${locale}/packages`} 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {t.userPackages.noPackages.viewPackages}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}