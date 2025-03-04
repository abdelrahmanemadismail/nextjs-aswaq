// components/listing/steps/ImageStep.tsx

"use client"

import { useFormContext } from 'react-hook-form'
import { ListingFormData } from '@/types/listing'
import { ImageUpload } from '../ImageUpload'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/use-translation'

export function ImageStep() {
  const { t } = useTranslation()
  
  const {
    setValue,
    formState: { errors },
    watch,
  } = useFormContext<ListingFormData>()

  const images = watch('images') || []

  const handleImagesChange = (files: File[]) => {
    // Set the files directly as an array
    setValue('images', files, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <ImageUpload
            images={images}
            maxFiles={30}
            onChange={handleImagesChange}
            error={errors.images?.message as string}
          />
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-2">{t.listings.photos.tipsHeading}</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• {t.listings.photos.tipLandscape}</li>
          <li>• {t.listings.photos.tipLighting}</li>
          <li>• {t.listings.photos.tipBackground}</li>
          <li>• {t.listings.photos.tipAppropriate}</li>
          <li>• {t.listings.photos.tipMultipleAngles}</li>
        </ul>
      </div>
    </div>
  )
}