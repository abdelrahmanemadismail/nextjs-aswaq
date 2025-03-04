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
import { useTranslation } from '@/hooks/use-translation'

export function PropertyFields() {
  const { t } = useTranslation()
  const { register, setValue, watch } = useFormContext<ListingFormData>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.listings.properties.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="property_details.property_type" label={t.listings.properties.propertyType}>
            <Select
              onValueChange={(value: 'apartment' | 'villa' | 'commercial') => {
                setValue('property_details.property_type', value, {
                  shouldValidate: true,
                })
              }}
              value={watch('property_details.property_type')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.listings.properties.selectPropertyType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">{t.listings.properties.apartment}</SelectItem>
                <SelectItem value="villa">{t.listings.properties.villa}</SelectItem>
                <SelectItem value="commercial">{t.listings.properties.commercial}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="property_details.payment_terms" label={t.listings.common.paymentTerms}>
            <Select
              onValueChange={(value: 'rent' | 'sale') => {
                setValue('property_details.payment_terms', value, {
                  shouldValidate: true,
                })
              }}
              value={watch('property_details.payment_terms')}
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

          <FormField name="property_details.bedrooms" label={t.listings.properties.bedrooms}>
            <Input
              type="number"
              placeholder={t.listings.properties.bedroomsPlaceholder}
              {...register('property_details.bedrooms', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="property_details.bathrooms" label={t.listings.properties.bathrooms}>
            <Input
              type="number"
              placeholder={t.listings.properties.bathroomsPlaceholder}
              {...register('property_details.bathrooms', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="property_details.square_footage" label={t.listings.properties.squareFootage}>
            <Input
              type="number"
              placeholder={t.listings.properties.squareFootagePlaceholder}
              {...register('property_details.square_footage', { valueAsNumber: true })}
            />
          </FormField>

          <FormField name="property_details.community" label={t.listings.properties.community}>
            <Input
              placeholder={t.listings.properties.communityPlaceholder}
              {...register('property_details.community')}
            />
          </FormField>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="furnished">{t.listings.properties.furnished}</Label>
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