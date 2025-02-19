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
import { AlertCircle } from 'lucide-react'

export function DetailsStep() {
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
                Title
                {titleError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                {...register('details.title')}
                className={titleError ? "border-destructive" : ""}
              />
              {titleError && (
                <p className="text-sm text-destructive">{titleError}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center">
                Description
                {descriptionError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail"
                className={`min-h-[120px] ${descriptionError ? "border-destructive" : ""}`}
                {...register('details.description')}
              />
              {descriptionError && (
                <p className="text-sm text-destructive">{descriptionError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Field */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center">
                  Price
                  {priceError && <span className="ml-2 text-destructive text-sm">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
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
                  Location
                  {addressError && <span className="ml-2 text-destructive text-sm">*</span>}
                </Label>
                <div className="space-y-2">
                  <Input
                    id="address"
                    placeholder="Enter location"
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
            
            {/* City/Area Field */}
            <div className="space-y-2">
              <Label htmlFor="location_id" className="flex items-center">
                City/Area
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
                Condition
                {conditionError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <Select
                onValueChange={handleConditionChange}
                defaultValue={watch('details.condition')}
              >
                <SelectTrigger id="condition" className={conditionError ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
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
              <Label htmlFor="is_negotiable">Price is negotiable</Label>
            </div>

            {/* Contact Methods */}
            <div className="space-y-2">
              <Label htmlFor="contact_methods" className="flex items-center">
                Contact Methods
                {contactMethodError && <span className="ml-2 text-destructive text-sm">*</span>}
              </Label>
              <div className={`flex flex-wrap gap-4 ${contactMethodError ? "p-2 border border-destructive rounded-md bg-destructive/10" : ""}`}>
                {['phone', 'chat', 'whatsapp'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={watch('details.contact_method').includes(method as 'phone' | 'chat' | 'whatsapp')}
                      onCheckedChange={(checked) => {
                        const currentMethods = watch('details.contact_method')
                        setValue(
                          'details.contact_method',
                          checked
                            ? [...currentMethods, method as 'phone' | 'chat' | 'whatsapp']
                            : currentMethods.filter((m) => m !== method),
                          { shouldValidate: true }
                        )
                      }}
                    />
                    <Label htmlFor={method} className="capitalize">
                      {method}
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