// app/contact/page.tsx
import { Metadata } from "next";
import { Mail } from "lucide-react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ContactForm } from "./FormComponent";
import Link from "next/link";
import { headers } from "next/headers";
import { Locale } from "@/i18n.config";
import getTrans from "@/utils/translation";

export const metadata: Metadata = {
  title: "Contact Us | Aswaq Online",
  description: "Get in touch with the Aswaq Online team. We're here to help with your questions and feedback.",
};

export default async function ContactPage() {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  return (
      <main className="flex-1">
        {/* Page header */}
        <section className="bg-primary/5 py-8 md:py-12">
          <div className="px-4 md:px-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t.contact.title}</h1>
              <p className="text-muted-foreground md:text-xl">
                {t.contact.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Contact information and form */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t.contact.getInTouch.title}</h2>
                  <p className="text-muted-foreground mb-6">
                    {t.contact.getInTouch.description}
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base mb-1">{t.contact.emailUs}</CardTitle>
                        <CardDescription>
                          <a href="mailto:support@aswaq.online" className="text-primary hover:underline">
                            support@aswaq.online
                          </a>
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              {/* Contact Form */}
              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">{t.contact.faq.title}</h2>
              <p className="text-muted-foreground mt-2">
                {t.contact.faq.subtitle}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.homepage.faq.createListing.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t.homepage.faq.createListing.answer}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.homepage.faq.listingDuration.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t.homepage.faq.listingDuration.answer}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.homepage.faq.verifiedSeller.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t.homepage.faq.verifiedSeller.answer}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <Link href="/help">
                {t.contact.faq.visitHelpCenter}
              </Link>
            </div>
          </div>
        </section>
      </main>
  );
}