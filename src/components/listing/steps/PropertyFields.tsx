"use client"

import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import { FormField } from '../form/FormField'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'

export function PropertyFields() {
  const { register, setValue, watch } = useFormContext<ListingFormData>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="property_details.property_type" label="Property Type">
            <Select
              onValueChange={(value: 'apartment' | 'villa' | 'commercial') => {
                setValue('property_details.property_type', value, {
                  shouldValidate: true,
                })
              }}
              value={watch('property_details.property_type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="property_details.payment_terms" label="Payment Terms">
            <Select
              onValueChange={(value: 'rent' | 'sale') => {
                setValue('property_details.payment_terms', value, {
                  shouldValidate: true,
                })
              }}
              value={watch('property_details.payment_terms')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="property_details.bedrooms" label="Bedrooms">
            <Input
              type="number"
              placeholder="Number of bedrooms"
              {...register('property_details.bedrooms', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="property_details.bathrooms" label="Bathrooms">
            <Input
              type="number"
              placeholder="Number of bathrooms"
              {...register('property_details.bathrooms', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="property_details.square_footage" label="Square Footage">
            <Input
              type="number"
              placeholder="Area in square feet"
              {...register('property_details.square_footage', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="property_details.community" label="Community/Area">
            <Input
              placeholder="Enter community or area"
              {...register('property_details.community')}
            />
          </FormField>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="furnished">Furnished</Label>
            <Switch
              id="furnished"
              checked={watch('property_details.furnished')}
              onCheckedChange={(checked) => {
                setValue('property_details.furnished', checked, {
                  shouldValidate: true,
                })
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}