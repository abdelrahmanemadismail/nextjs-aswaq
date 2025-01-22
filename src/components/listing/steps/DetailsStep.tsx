// components/listing/steps/DetailsStep.tsx

"use client"

import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import { FormField } from '../form/FormField'
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

export function DetailsStep() {
  const {
    register,
    watch,
    setValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formState: { errors },
  } = useFormContext<ListingFormData>()

  const category = watch('category')
  const mainCategory = category.main_category

  const handleCheckboxChange = (checked: boolean) => {
    setValue('details.is_negotiable', checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleConditionChange = (value: 'new' | 'used') => {
    setValue('details.condition', value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const renderCategorySpecificFields = () => {
    switch (mainCategory) {
      case 'vehicles':
        return (
          <VehicleFields />
        )
      case 'properties':
        return (
          <PropertyFields />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Basic Details */}
            <FormField name="details.title" label="Title">
              <Input
                placeholder="Enter a descriptive title"
                {...register('details.title')}
              />
            </FormField>

            <FormField name="details.description" label="Description">
              <Textarea
                placeholder="Describe your item in detail"
                className="min-h-[120px]"
                {...register('details.description')}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="details.price" label="Price">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...register('details.price', { valueAsNumber: true })}
                    className="pl-16"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none border-r bg-muted font-medium text-muted-foreground">
                    AED
                  </div>
                </div>
              </FormField>

              <FormField name="details.location" label="Location">
                <Input
                  placeholder="Enter location"
                  {...register('details.location')}
                />
              </FormField>
            </div>

            <FormField name="details.condition" label="Condition">
              <Select
                onValueChange={handleConditionChange}
                defaultValue={watch('details.condition')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_negotiable"
                checked={watch('details.is_negotiable')}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="is_negotiable">Price is negotiable</Label>
            </div>

            {/* Contact Methods */}
            <FormField name="details.contact_method" label="Contact Methods">
              <div className="flex flex-wrap gap-4">
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
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Category Specific Fields */}
      {renderCategorySpecificFields()}
    </div>
  )
}