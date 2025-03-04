// components/listing/steps/DetailsStep.tsx

"use client"

import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { VehicleFields } from './VehicleFields'
import { PropertyFields } from './PropertyFields'
import { LocationSelector } from './LocationSelector'
import LocationPicker from '../LocationPicker'
import { useTranslation } from '@/hooks/use-translation'

export function DetailsStep() {
  const { t } = useTranslation()
  
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ListingFormData>()

  const category = watch('category')
  const mainCategory = category.main_category
  
  // Extract errors for specific fields
  const titleError = errors.details?.title?.message
  const descriptionError = errors.details?.description?.message
  const priceError = errors.details?.price?.message
  const addressError = errors.details?.address?.message
  const locationIdError = errors.details?.location_id?.message
  const conditionError = errors.details?.condition?.message
  const contactMethodError = errors.details?.contact_method?.message

  const handleCheckboxChange = (checked: boolean) => {
    setValue('details.is_negotiable', checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleLocationSelect = (location: {
    formatted_address: string
    coordinates: {
      lat: number
      lng: number
    }
  }) => {
    setValue('details.address', location.formatted_address, {
      shouldValidate: true,
    })
    setValue('details.latitude', location.coordinates.lat, {
      shouldValidate: true,
    })
    setValue('details.longitude', location.coordinates.lng, {
      shouldValidate: true,
    })
  }

  const handleConditionChange = (value: 'new' | 'used') => {
    setValue('details.condition', value, {
      shouldValidate: true,
    })
  }

  const renderCategorySpecificFields = () => {
    switch (mainCategory) {
      case 'vehicles':
        return <VehicleFields />
      case 'properties':
        return <PropertyFields />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                {t.listings.form.title}
                {titleError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <Input
                id="title"
                placeholder={t.listings.form.titlePlaceholder}
                {...register('details.title')}
                className={titleError ? "border-destructive" : ""}
              />
              {titleError && (
                <p className="text-sm text-destructive">{titleError}</p>
              )}
            </div>

            {/* Title Arabic Field (optional) */}
            <div className="space-y-2">
              <Label htmlFor="title_ar" className="flex items-center">
                {t.listings.form.titleArabic}
              </Label>
              <Input
                id="title_ar"
                placeholder={t.listings.form.titleArabicPlaceholder}
                {...register('details.title_ar')}
                dir="rtl"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center">
                {t.listings.form.description}
                {descriptionError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <Textarea
                id="description"
                placeholder={t.listings.form.descriptionPlaceholder}
                className={`min-h-[120px] ${descriptionError ? "border-destructive" : ""}`}
                {...register('details.description')}
              />
              {descriptionError && (
                <p className="text-sm text-destructive">{descriptionError}</p>
              )}
            </div>

            {/* Description Arabic Field (optional) */}
            <div className="space-y-2">
              <Label htmlFor="description_ar" className="flex items-center">
                {t.listings.form.descriptionArabic}
              </Label>
              <Textarea
                id="description_ar"
                placeholder={t.listings.form.descriptionArabicPlaceholder}
                className="min-h-[120px]"
                {...register('details.description_ar')}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Field */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center">
                  {t.listings.form.price}
                  {priceError && <span className="ml-2 text-destructive text-sm">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    placeholder={t.listings.form.pricePlaceholder}
                    {...register('details.price', { valueAsNumber: true })}
                    className={`pl-16 ${priceError ? "border-destructive" : ""}`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none border-r bg-muted font-medium text-muted-foreground">
                    AED
                  </div>
                </div>
                {priceError && (
                  <p className="text-sm text-destructive">{priceError}</p>
                )}
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center">
                  {t.listings.location.location}
                  {addressError && <span className="ml-2 text-destructive text-sm">*</span>}
                </Label>
                <div className="space-y-2">
                  <Input
                    id="address"
                    placeholder={t.listings.location.locationPlaceholder}
                    {...register('details.address')}
                    readOnly
                    className={addressError ? "border-destructive" : ""}
                  />
                  <LocationPicker
                    onSelectLocation={handleLocationSelect}
                    initialLocation={{ lat: 23.42410000, lng: 53.84780000 }}
                  />
                </div>
                {addressError && (
                  <p className="text-sm text-destructive">{addressError}</p>
                )}
              </div>
            </div>
            
            {/* Address Arabic Field (optional) */}
            <div className="space-y-2">
              <Label htmlFor="address_ar" className="flex items-center">
                {t.listings.location.locationArabic}
              </Label>
              <Input
                id="address_ar"
                placeholder={t.listings.location.locationArabicPlaceholder}
                {...register('details.address_ar')}
                dir="rtl"
              />
            </div>
            
            {/* City/Area Field */}
            <div className="space-y-2">
              <Label htmlFor="location_id" className="flex items-center">
                {t.listings.location.cityArea}
                {locationIdError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <LocationSelector
                onLocationSelect={(location) => {
                  setValue('details.location_id', location.id, {
                    shouldValidate: true,
                  })
                }}
                error={locationIdError as string}
              />
            </div>

            {/* Condition Field */}
            <div className="space-y-2">
              <Label htmlFor="condition" className="flex items-center">
                {t.listings.form.condition}
                {conditionError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <Select
                onValueChange={handleConditionChange}
                defaultValue={watch('details.condition')}
              >
                <SelectTrigger id="condition" className={conditionError ? "border-destructive" : ""}>
                  <SelectValue placeholder={t.listings.form.selectCondition} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t.listings.form.conditionNew}</SelectItem>
                  <SelectItem value="used">{t.listings.form.conditionUsed}</SelectItem>
                </SelectContent>
              </Select>
              {conditionError && (
                <p className="text-sm text-destructive">{conditionError}</p>
              )}
            </div>

            {/* Negotiable Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_negotiable"
                checked={watch('details.is_negotiable')}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="is_negotiable">{t.listings.form.negotiable}</Label>
            </div>

            {/* Contact Methods */}
            <div className="space-y-2">
              <Label htmlFor="contact_methods" className="flex items-center">
                {t.listings.form.contactMethods}
                {contactMethodError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <div className={`flex flex-wrap gap-4 ${contactMethodError ? "p-2 border border-destructive rounded-md bg-destructive/10" : ""}`}>
                {[
                  { value: 'phone', label: t.listings.form.contactPhone },
                  { value: 'chat', label: t.listings.form.contactChat },
                  { value: 'whatsapp', label: t.listings.form.contactWhatsapp }
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={value}
                      checked={watch('details.contact_method').includes(value as 'phone' | 'chat' | 'whatsapp')}
                      onCheckedChange={(checked) => {
                        const currentMethods = watch('details.contact_method')
                        setValue(
                          'details.contact_method',
                          checked
                            ? [...currentMethods, value as 'phone' | 'chat' | 'whatsapp']
                            : currentMethods.filter((m) => m !== value),
                          { shouldValidate: true }
                        )
                      }}
                    />
                    <Label htmlFor={value}>
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              {contactMethodError && (
                <p className="text-sm text-destructive">{contactMethodError}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Specific Fields */}
      {renderCategorySpecificFields()}
    </div>
  )
}