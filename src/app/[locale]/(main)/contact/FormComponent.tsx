'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { submitContactForm } from '@/actions/contact-actions'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export function ContactForm() {
  const { t, locale } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)

      formData.append('locale', locale)
      
      // Submit the form
      const result = await submitContactForm(formData)
      
      // If we get here without being redirected, there was an error
      if (result && !result.success) {
        toast({
          title: t.common.error,
          description: result.error || t.common.somethingWentWrong,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.common.somethingWentWrong,
        variant: "destructive"
      })
      console.error("Contact form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.contact.form.title}</CardTitle>
        <CardDescription>
          {t.contact.form.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                {t.contact.form.firstName}
              </label>
              <Input 
                id="firstName" 
                name="firstName" 
                placeholder={t.contact.form.firstNamePlaceholder} 
                required 
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                {t.contact.form.lastName}
              </label>
              <Input 
                id="lastName" 
                name="lastName" 
                placeholder={t.contact.form.lastNamePlaceholder} 
                required 
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t.contact.form.email}
            </label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder={t.contact.form.emailPlaceholder} 
              required 
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t.contact.form.phone}
            </label>
            <Input 
              id="phone" 
              name="phone" 
              type="tel" 
              placeholder={t.contact.form.phonePlaceholder} 
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              {t.contact.form.subject}
            </label>
            <Input 
              id="subject" 
              name="subject" 
              placeholder={t.contact.form.subjectPlaceholder} 
              required 
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              {t.contact.form.message}
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder={t.contact.form.messagePlaceholder}
              rows={5}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {t.contact.form.sending}
              </>
            ) : (
              t.contact.form.send
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}