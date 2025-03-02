import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { Locale } from "@/i18n.config";
import getTrans from "@/utils/translation";

export const metadata: Metadata = {
  title: "Thank You | Aswaq Online",
  description: "Thank you for contacting Aswaq Online. We've received your message and will respond shortly.",
};

export default async function ThankYouPage() {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  return (
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t.contact.thankYou.title}
                </h1>
                
                <p className="text-muted-foreground text-lg md:text-xl">
                  {t.contact.thankYou.subtitle}
                </p>
                
                <div className="bg-muted p-6 rounded-lg max-w-md mx-auto mt-8">
                  <h2 className="font-medium text-lg mb-2">{t.contact.thankYou.nextSteps.title}</h2>
                  <ul className="text-left space-y-2 text-muted-foreground">
                    <li>{t.contact.thankYou.nextSteps.review}</li>
                    <li>{t.contact.thankYou.nextSteps.respond}</li>
                    <li>{t.contact.thankYou.nextSteps.reply}</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button asChild size="lg">
                  <Link href="/">{t.contact.thankYou.returnHome}</Link>
                </Button>
                
                <Button variant="outline" asChild size="lg">
                  <Link href="/help">{t.contact.faq.visitHelpCenter}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}