import { Metadata } from 'next';
import { Button } from "@/components/ui/button"
import { User, ListTodo, CreditCard, ImageIcon, ShieldCheck, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';

export const metadata: Metadata = {
  title: 'Help Center - Aswaq',
  description: 'Get help with your Aswaq account, listings, and more',
}

interface HelpCategory {
  icon: React.ReactNode
  name: string
  slug: string
  description: string
}

export default async function HelpCenter() {

  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  const categories: HelpCategory[] = [
    {
      icon: <User className="h-8 w-8 text-primary" />,
      name: t.help.categories.accounts.name,
      slug: "accounts",
      description: t.help.categories.accounts.description
    },
    {
      icon: <ListTodo className="h-8 w-8 text-primary" />,
      name: t.help.categories.listingServices.name,
      slug: "listing-services",
      description: t.help.categories.listingServices.description
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      name: t.help.categories.paymentsAndPurchases.name,
      slug: "payments-purchases",
      description: t.help.categories.paymentsAndPurchases.description
    },
    {
      icon: <ImageIcon className="h-8 w-8 text-primary" />,
      name: t.help.categories.advertising.name,
      slug: "advertising",
      description: t.help.categories.advertising.description
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      name: t.help.categories.paidListing.name,
      slug: "paid-listing",
      description: t.help.categories.paidListing.description
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      name: t.help.categories.safetySecurity.name,
      slug: "safety-security",
      description: t.help.categories.safetySecurity.description
    }
  ]

  const guides = [
    {
      title: t.help.findingFavoriteStuff,
      image: "/images/help/Guide.png",
      href: `/${locale}/help/articles/safe-meeting-guidelines`
    },
    {
      title: t.help.settingUpAccount,
      image: "/images/help/Guide-2.png",
      href: `/${locale}/help/categories/accounts`
    },
    {
      title: t.help.securingAccount,
      image: "/images/help/Guide-3.png",
      href: `/${locale}/help/categories/safety-security`
    },
    {
      title: t.help.sellingStuff,
      image: "/images/help/Guide-4.png",
      href: `/${locale}/help/categories/listing-services`
    }
  ]

  return (
    <div className="container max-w-7xl py-6 space-y-12">
      {/* Search Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-center">{t.help.howCanWeHelp}</h1>
        {/* <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Input 
              type="search" 
              placeholder={t.help.search}
              className="h-12 pl-4"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12 rounded-l-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </div>
        </div> */}
      </div>

      {/* Categories Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t.help.recommendedForYou}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/${locale}/help/categories/${category.slug}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg h-fit">
                    {category.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Guides Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t.help.guidesForGettingStarted}</h2>
          <Button variant="link" asChild>
            <Link href="/help/articles">{t.help.browseAllTopics}</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {guides.map((guide) => (
            <Link key={guide.title} href={guide.href}>
              <Card className="hover:bg-muted/50 transition-colors overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{guide.title}</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}