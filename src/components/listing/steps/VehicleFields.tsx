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

export function VehicleFields() {
  const { register, setValue, watch } = useFormContext<ListingFormData>()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="vehicle_details.brand" label="Brand">
            <Input
              placeholder="Enter brand"
              {...register('vehicle_details.brand')}
            />
          </FormField>

          <FormField name="vehicle_details.model" label="Model">
            <Input
              placeholder="Enter model"
              {...register('vehicle_details.model')}
            />
          </FormField>

          <FormField name="vehicle_details.year" label="Year">
            <Select
              onValueChange={(value) => {
                setValue('vehicle_details.year', parseInt(value), {
                  shouldValidate: true,
                })
              }}
              value={watch('vehicle_details.year')?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="vehicle_details.mileage" label="Mileage">
            <Input
              type="number"
              placeholder="Enter mileage"
              {...register('vehicle_details.mileage', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="vehicle_details.color" label="Color">
            <Input
              placeholder="Enter color"
              {...register('vehicle_details.color')}
            />
          </FormField>

          <FormField name="vehicle_details.payment_terms" label="Payment Terms">
            <Select
              onValueChange={(value: 'rent' | 'sale') => {
                setValue('vehicle_details.payment_terms', value, {
                  shouldValidate: true,
                })
              }}
              value={watch('vehicle_details.payment_terms')}
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
        </div>
      </CardContent>
    </Card>
  )
}