import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
import CategoryBar from "@/components/CategoryBar"
import { getCategories } from "@/actions/category-actions"
import MainSearch from "@/components/MainSearch"
import Footer from "@/components/Footer"
import PackageList from "@/components/checkout/PackageList"
import getTrans from "@/utils/translation"
import { Locale } from "@/i18n.config"

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const locale = (await params).locale;
  const t = await getTrans(locale)
  const categories = (await getCategories()).filter(category => category.display_in_hero)

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
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <CategoryBar />
      </div>
      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-background py-24 overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                {t.homepage.heroTitle}
                <span className="text-primary block mt-2">{t.homepage.heroTitleHighlight}</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.homepage.heroSubtitle}
              </p>
              <MainSearch />
            </div>
            <div className="mt-12 flex gap-4 justify-center flex-wrap">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.name}
                  href={`/listings?category=${category.slug}`}
                  prefetch={true}
                  className="group flex flex-col items-center p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-16 w-16 flex items-center justify-center">
                    <Image
                      src={category.hero_image || "/placeholder.svg"}
                      alt={category.name}
                      width={32}
                      height={32}
                    // className="h-8 w-8"
                    />
                  </div>
                  <span className="mt-2 text-sm font-medium">
                    {locale === 'ar' && category.name_ar ? category.name_ar : category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5" />
          </div>
        </section>

        {/* Packages Section */}
        <PackageList  />

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
                  {item.step !== (locale === 'ar' ? '٣' : '3')
                    // <ArrowRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-muted-foreground" />
                  }
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
            <Button size="lg">{t.common.contactSupport}</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}