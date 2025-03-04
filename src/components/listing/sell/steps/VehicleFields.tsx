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
import { useTranslation } from '@/hooks/use-translation'

export function VehicleFields() {
  const { t } = useTranslation()
  const { register, setValue, watch } = useFormContext<ListingFormData>()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.listings.vehicles.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="vehicle_details.brand" label={t.listings.vehicles.brand}>
            <Input
              placeholder={t.listings.vehicles.brandPlaceholder}
              {...register('vehicle_details.brand')}
            />
          </FormField>

          <FormField name="vehicle_details.model" label={t.listings.vehicles.model}>
            <Input
              placeholder={t.listings.vehicles.modelPlaceholder}
              {...register('vehicle_details.model')}
            />
          </FormField>

          <FormField name="vehicle_details.year" label={t.listings.vehicles.year}>
            <Select
              onValueChange={(value) => {
                setValue('vehicle_details.year', parseInt(value), {
                  shouldValidate: true,
                })
              }}
              value={watch('vehicle_details.year')?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.listings.vehicles.yearPlaceholder} />
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

          <FormField name="vehicle_details.mileage" label={t.listings.vehicles.mileage}>
            <Input
              type="number"
              placeholder={t.listings.vehicles.mileagePlaceholder}
              {...register('vehicle_details.mileage', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="vehicle_details.color" label={t.listings.vehicles.color}>
            <Input
              placeholder={t.listings.vehicles.colorPlaceholder}
              {...register('vehicle_details.color')}
            />
          </FormField>

          <FormField name="vehicle_details.payment_terms" label={t.listings.common.paymentTerms}>
            <Select
              onValueChange={(value: 'rent' | 'sale') => {
                setValue('vehicle_details.payment_terms', value, {
                  shouldValidate: true,
                })
              }}
              value={watch('vehicle_details.payment_terms')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.listings.common.selectPaymentTerms} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">{t.listings.common.forSale}</SelectItem>
                <SelectItem value="rent">{t.listings.common.forRent}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </CardContent>
    </Card>
  )
}