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
import { getRecentListingsCount } from "@/actions/listing-actions"
import Footer from "@/components/Footer"
import PackageList from "@/components/checkout/PackageList"
import getTrans from "@/utils/translation"
import { Locale } from "@/i18n.config"
import { createClient } from "@/utils/supabase/server"

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
  const recentListingsCount = await getRecentListingsCount() + 4
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
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <div className="w-full bg-[#006EB8] text-white text-center py-2 px-4 text-sm font-medium">
        {t.homepage.announce.text}
        <a href={user ? "/sell" : "/auth/signup"} className="underline font-semibold hover:text-blue-200 ml-1">
          {t.homepage.announce.button}
        </a>
      </div>
      </div>
      

      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-background py-12 md:py-20 lg:py-24 overflow-hidden -mt-2">
        <div className="container mx-auto px-2 md:px-4 lg:px-6 relative z-10 -mt-10">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 "> 
              {/* Text Content */}
              <div className="w-full md:w-1/2 text-center md:text-left animate-fade-in-up">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                  {t.homepage.heroTitle}
                  <span className="block mt-2 text-primary">
                  {t.homepage.heroTitleHighlight}
                  </span>
                </h1>
                <div className="mt-8 flex flex-col sm:flex-row sm:justify-start items-center sm:items-start gap-4 ltr:flex-row rtl:flex-row-reverse">

                  <Link 
                    href={user ? "/sell" : "/auth/signup"}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-md hover:bg-primary/90 transition"
                  >
                    {t.homepage.sellButton}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    🚀 {recentListingsCount}{t.homepage.sellButtonAnnounce}
                  </span>
                </div>
                <p className="mt-6 text-xl text-muted-foreground max-w-2xl md:max-w-none">
                  {t.homepage.heroSubtitle}
                </p>

                
              </div>

              {/* Hero Image */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
                <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/hero-i-remove.png" 
                    alt="Arab woman using phone"
                    width={800}
                    height={800}
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>

            </div>

            <div className="mt-16 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:justify-center">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/listings?category=${category.slug}`}
                  prefetch={true}
                  className="group flex flex-col items-center p-2 sm:p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-all h-[120px] w-[100px] sm:w-[120px]"
                >
                  <div className="h-16 w-16 flex items-center justify-center">
                    <Image
                      src={category.hero_image || "/placeholder.svg"}
                      alt={category.name}
                      width={32}
                      height={32}
                    />
                  </div>
                  <span className="mt-2 text-xs sm:text-sm font-medium text-center line-clamp-2">
                    {locale === 'ar' && category.name_ar ? category.name_ar : category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5" />
          </div>
        </section>


        {/* Packages Section */}
        <PackageList />

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
