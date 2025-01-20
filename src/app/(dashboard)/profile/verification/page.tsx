'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'
import { format, addYears } from 'date-fns'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import DatePicker from '@/components/DatePicker'
import { submitVerificationRequest } from '@/actions/verification-actions'
import { useProfile } from '@/context/ProfileContext'
import { toast } from '@/hooks/use-toast'
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

export default function IDVerification() {
  const router = useRouter()
  const { profile, refreshProfile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<'id' | 'passport'>('id')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentExpiry, setDocumentExpiry] = useState<string | null>(
    format(addYears(new Date(), 5), 'yyyy-MM-dd')
  )

  // Image states
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [passportImage, setPassportImage] = useState<File | null>(null)

  // Preview URLs for images
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [passportPreview, setPassportPreview] = useState<string | null>(null)

  const handleImageUpload = (type: 'front' | 'back' | 'passport', file: File) => {
    // Create preview URL
    const url = URL.createObjectURL(file)

    switch(type) {
      case 'front':
        setFrontImage(file)
        setFrontPreview(url)
        break
      case 'back':
        setBackImage(file)
        setBackPreview(url)
        break
      case 'passport':
        setPassportImage(file)
        setPassportPreview(url)
        break
    }
  }

  const validateForm = () => {
    if (!documentNumber) {
      toast({
        title: "Required field missing",
        description: "Please enter the document number",
        variant: "destructive",
      })
      return false
    }

    if (!documentExpiry) {
      toast({
        title: "Required field missing",
        description: "Please select document expiry date",
        variant: "destructive",
      })
      return false
    }

    if (selectedId === 'id' && (!frontImage || !backImage)) {
      toast({
        title: "Required images missing",
        description: "Please upload both front and back images of your ID",
        variant: "destructive",
      })
      return false
    }

    if (selectedId === 'passport' && !passportImage) {
      toast({
        title: "Required image missing",
        description: "Please upload your passport image",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleContinue = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)

      const files = selectedId === 'id' 
        ? [frontImage!, backImage!]
        : [passportImage!]

      await submitVerificationRequest(
        selectedId,
        files,
        documentNumber,
        documentExpiry!
      )

      await refreshProfile()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit verification request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageInputChange = (
    type: 'front' | 'back' | 'passport',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image less than 5MB",
          variant: "destructive",
        })
        return
      }
      handleImageUpload(type, file)
    }
  }

  // Already verified users shouldnt access this page
  if (profile?.verification_status === 'verified') {
    router.push('/')
    return null
  }

  // Pending verification users should see a different message
  if (profile?.verification_status === 'pending') {
    return (
        <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-semibold">
            Verification In Progress
            </CardTitle>
            <CardDescription className="text-sm">
            Your verification request is being reviewed. We&apos;ll notify you once it&apos;s complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 py-4 text-center">
            <Image
              src="/success.svg"
              alt="Success Illustration"
              width={300}
              height={300}
              className="mx-auto"
            />
            <Button 
              size="lg" 
              onClick={() => router.push('/')}
            >
              Back To Home
            </Button>
          </CardContent>
        </Card>
      </div>    
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container grid gap-8 py-8 md:grid-cols-2 md:items-start md:gap-12 lg:gap-16">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Select an ID type to add</h1>
            <p className="text-gray-600">This will allow us to verify your identity</p>
          </div>

          <RadioGroup 
            value={selectedId} 
            onValueChange={(value: 'id' | 'passport') => setSelectedId(value)}
            className="space-y-3"
          >
            <Label
              htmlFor="id-radio"
              className="flex cursor-pointer items-center justify-between rounded-xl border p-4"
            >
              <div className="font-medium flex items-center gap-2">
                Emirates ID 
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-primary rounded">
                  Recommended
                </span>
              </div>
              <RadioGroupItem value="id" id="id-radio" className="border-primary text-primary" />
            </Label>
            <Label
              htmlFor="passport-radio"
              className="flex cursor-pointer items-center justify-between rounded-xl border p-4"
            >
              <div className="font-medium">Passport & Residence Visa</div>
              <RadioGroupItem 
                value="passport" 
                id="passport-radio" 
                className="border-primary text-primary" 
              />
            </Label>
          </RadioGroup>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-number">Document Number</Label>
              <Input
                id="document-number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter document number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-expiry">Document Expiry Date</Label>
              <DatePicker
                id="document-expiry"
                value={documentExpiry}
                onChange={setDocumentExpiry}
                minDate={new Date()}
              />
            </div>
          </div>

          <div className="space-y-4 p-6">
            {selectedId === 'id' ? (
              <>
                <h2 className="text-xl font-semibold text-center">
                  Take Photos of your ID
                </h2>
                <div className="grid grid-cols-2 gap-4 max-w-[280px] mx-auto">
                  <div className="space-y-2">
                    <p className="text-center text-sm">Front ID</p>
                    <label 
                      htmlFor="front-id-photo" 
                      className="block aspect-square cursor-pointer rounded-xl border-2 p-2"
                    >
                      {frontPreview ? (
                        <Image 
                          src={frontPreview} 
                          alt="Front ID Preview" 
                          width={200} 
                          height={200}
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Camera className="h-8 w-8" />
                        </div>
                      )}
                      <input
                        type="file"
                        id="front-id-photo"
                        accept="image/*"
                        onChange={(e) => handleImageInputChange('front', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-center text-sm">Back ID</p>
                    <label 
                      htmlFor="back-id-photo" 
                      className="block aspect-square cursor-pointer rounded-xl border-2 p-2"
                    >
                      {backPreview ? (
                        <Image 
                          src={backPreview} 
                          alt="Back ID Preview" 
                          width={200} 
                          height={200}
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Camera className="h-8 w-8" />
                        </div>
                      )}
                      <input
                        type="file"
                        id="back-id-photo"
                        accept="image/*"
                        onChange={(e) => handleImageInputChange('back', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-center">
                  Take Passport Photo
                </h2>
                <div className="max-w-[140px] mx-auto">
                  <label 
                    htmlFor="passport-photo" 
                    className="block aspect-square cursor-pointer rounded-xl border-2 p-2"
                  >
                    {passportPreview ? (
                      <Image 
                        src={passportPreview} 
                        alt="Passport Preview" 
                        width={200} 
                        height={200}
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                    <input
                      type="file"
                      id="passport-photo"
                      accept="image/*"
                      onChange={(e) => handleImageInputChange('passport', e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ASWAQ verified is an exclusive service. Your data will be processed securely & will not be
              disclosed to any third party.
            </p>
            <p className="text-sm text-gray-600">
              This helps us prevent anyone from creating fake accounts using your details
            </p>
          </div>

          <Button 
            onClick={handleContinue} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>

        <div className="hidden md:block">
          <Image
            src="/verification.svg"
            alt="Verification Illustration"
            width={500}
            height={500}
            className="w-full"
          />
        </div>
      </main>
    </div>
  )
}