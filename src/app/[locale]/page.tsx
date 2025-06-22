import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  HeadphonesIcon,
  Star,
  ShoppingBag,
  Shield,
  Clock,
  MessageSquare,
} from "lucide-react"
import Header from "@/components/Header"
import { getCategories } from "@/actions/category-actions"
// import { getRecentListingsCount } from "@/actions/listing-actions"
import Footer from "@/components/Footer"
import getTrans from "@/utils/translation"
import { Locale } from "@/i18n.config"
import { createClient } from "@/utils/supabase/server"
import SignupPopup from '@/components/SignupPopup';
import CategoriesBar from '@/components/CategoriesBar';

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {

  const getLocalizedPath = (path: string) => {
    // If the path already starts with the locale, return it as is
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
      return path;
    }

    // If path starts with another locale, replace it
    const locales = ['ar', 'en'];
    for (const loc of locales) {
      if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
        return path.replace(`/${loc}`, `/${locale}`);
      }
    }

    // Otherwise, prepend the current locale
    return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
  };
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser();
  const locale = (await params).locale;
  const t = await getTrans(locale)
  const categories = (await getCategories()).filter(category => category.display_in_hero)
  // const recentListingsCount = await getRecentListingsCount() + 4
  const statistics = [
    { number: "10+", label: t.homepage.statistics.categories, icon: ShoppingBag },
    { number: "24/7", label: t.homepage.statistics.customerSupport, icon: HeadphonesIcon },
    { number: "100%", label: t.homepage.statistics.secureTransactions, icon: Shield },
  ]

  const features = [
    {
      title: t.homepage.whyChooseUs.secureTransactions.title,
      description: t.homepage.whyChooseUs.secureTransactions.description,
      icon: Shield,
    },
    {
      title: t.homepage.whyChooseUs.realTimeUpdates.title,
      description: t.homepage.whyChooseUs.realTimeUpdates.description,
      icon: Clock,
    },
    {
      title: t.homepage.whyChooseUs.userFriendly.title,
      description: t.homepage.whyChooseUs.userFriendly.description,
      icon: Star,
    },
    {
      title: t.homepage.whyChooseUs.support.title,
      description: t.homepage.whyChooseUs.support.description,
      icon: MessageSquare,
    },
  ]

  const faqs = [
    {
      question: t.homepage.faq.createListing.question,
      answer: t.homepage.faq.createListing.answer,
    },
    {
      question: t.homepage.faq.listingDuration.question,
      answer: t.homepage.faq.listingDuration.answer,
    },
    {
      question: t.homepage.faq.featuredListing.question,
      answer: t.homepage.faq.featuredListing.answer,
    },
    {
      question: t.homepage.faq.verifiedSeller.question,
      answer: t.homepage.faq.verifiedSeller.answer,
    },
  ]

  const howItWorks = [
    {
      step: t.homepage.howItWorks.step1.step,
      title: t.homepage.howItWorks.step1.title,
      description: t.homepage.howItWorks.step1.description,
    },
    {
      step: t.homepage.howItWorks.step2.step,
      title: t.homepage.howItWorks.step2.title,
      description: t.homepage.howItWorks.step2.description,
    },
    {
      step: t.homepage.howItWorks.step3.step,
      title: t.homepage.howItWorks.step3.title,
      description: t.homepage.howItWorks.step3.description,
    },
  ]

  return (
    <>
    <SignupPopup locale={locale} />
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <div className="hidden md:block w-full bg-primary2 text-white text-center py-2 px-4 text-sm font-medium">
  {t.homepage.announce.text}
  <a href={user ? "/sell" : "/auth/signup"} className="underline font-semibold hover:text-blue-200 ml-1">
    {t.homepage.announce.button}
  </a>
</div>

      </div>
      

      <main className="flex-1">
        {/* Enhanced Hero Section - Redesigned to match provided image */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden p-0 pb-32">
          {/* Background image with gradient overlay */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/Frame 1261153564.png"
              alt="Handshake background"
              fill
              className="object-cover w-full h-full"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-700/60 to-orange-400/60" />
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-16 gap-8">
            {/* Left: Text Content */}
            <div className="w-full md:w-1/2 text-white text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 whitespace-pre-line">
                {t.homepage.heroTitle}
                <span className="block mt-2 text-primary">
                  {t.homepage.heroTitleHighlight}
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-xl">
                {t.homepage.heroSubtitle}
              </p>
              <Link
                href={user ? "/sell" : "/auth/signup"}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg px-8 py-4 shadow-lg transition-colors"
              >
                {t.homepage.sellButton}
              </Link>
            </div>
            {/* Right: Empty for spacing on desktop, image is in background */}
            <div className="hidden md:block w-1/2" />
          </div>
        </section>
        {/* Categories Bar Section - now placed just below hero */}
        <div className="relative z-20 w-full max-w-6xl mx-auto -mt-16 px-4">
          <CategoriesBar categories={categories} />
        </div>

        {/* Statistics Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {statistics.map(({ number, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold">{number}</div>
                  <div className="text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">{t.homepage.howItWorks.title}</h2>
              <p className="mt-4 text-muted-foreground">{t.homepage.howItWorks.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-center text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">{t.homepage.whyChooseUs.title}</h2>
              <p className="mt-4 text-muted-foreground">{t.homepage.whyChooseUs.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="bg-background/60">
                    <CardHeader>
                      <Icon className="h-8 w-8 text-primary mb-4" />
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">{t.homepage.faq.title}</h2>
              <p className="mt-4 text-muted-foreground">{t.homepage.faq.subtitle}</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <HeadphonesIcon className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t.homepage.support.title}</h2>
            <p className="text-muted-foreground mb-8">{t.homepage.support.subtitle}</p>
            <Link
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 rounded-md px-8"
              href={getLocalizedPath('/contact')}>
              {t.common.contactSupport}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
      </>
  )
}
