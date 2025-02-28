import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  HeadphonesIcon,
  Star,
  ArrowRight,
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

const statistics = [
  { number: "10+", label: "Categories", icon: ShoppingBag },
  { number: "24/7", label: "Customer Support", icon: HeadphonesIcon },
  { number: "100%", label: "Secure Transactions", icon: Shield },
]

const features = [
  {
    title: "Secure Transactions",
    description: "Built-in security measures to protect buyers and sellers",
    icon: Shield,
  },
  {
    title: "Real-time Updates",
    description: "Instant notifications for your listings and offers",
    icon: Clock,
  },
  {
    title: "User-Friendly Interface",
    description: "Easy-to-use platform for seamless buying and selling",
    icon: Star,
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock customer service in multiple languages",
    icon: MessageSquare,
  },
]

const faqs = [
  {
    question: "How do I create a listing?",
    answer:
      "Creating a listing is simple! Click the 'Sell' button, choose your category, fill in the details, add photos, and publish. Free tier users can post up to 3 listings.",
  },
  {
    question: "How long do listings stay active?",
    answer:
      "Listing duration depends on your package. Free listings last 30 days, while paid packages offer extended durations plus bonus days.",
  },
  {
    question: "Is featured listing worth it?",
    answer:
      "Featured listings appear on the homepage and are designed to get more views. It's perfect for items you want to sell quickly.",
  },
  {
    question: "How do I become a verified seller?",
    answer:
      "Complete your profile, verify your contact information, and maintain a positive rating. Verified sellers will enjoy higher visibility and trust.",
  },
]

export default async function LandingPage() {
  const categories = (await getCategories()).filter(category => category.display_in_hero)

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
                Your Trusted Marketplace in the
                <span className="text-primary block mt-2">Middle East</span>
                {/* and the
                <span className="text-primary block mt-2">World</span> */}
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the region&apos;s fastest-growing marketplace for buying and selling
              </p>
              <MainSearch/>
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
                  <span className="mt-2 text-sm font-medium">{category.name}</span>
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
              <h2 className="text-3xl font-bold">How ASWAQ Online Works</h2>
              <p className="mt-4 text-muted-foreground">Start buying or selling in three simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create Account",
                  description: "Sign up for free and verify your account",
                },
                {
                  step: "2",
                  title: "Post or Browse",
                  description: "List your items or browse thousands of listings",
                },
                {
                  step: "3",
                  title: "Connect & Trade",
                  description: "Connect with buyers or sellers and make deals",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-center text-muted-foreground">{item.description}</p>
                  </div>
                  {item.step !== "3" && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why Choose ASWAQ Online</h2>
              <p className="mt-4 text-muted-foreground">Discover the features that make us the leading marketplace</p>
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


        {/* Compare Packages Section */}
        {/* <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Compare Packages</h2>
              <p className="mt-4 text-muted-foreground">Find the perfect plan for your needs</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Features</TableHead>
                    <TableHead>Free Tier</TableHead>
                    <TableHead>1 Month Plus</TableHead>
                    <TableHead>Bulk Packages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    "Number of Listings",
                    "Listing Duration",
                    "Featured Option",
                    "Priority Support",
                    "Verified Badge",
                  ].map((feature) => (
                    <TableRow key={feature}>
                      <TableCell>{feature}</TableCell>
                      <TableCell>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </TableCell>
                      <TableCell>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </TableCell>
                      <TableCell>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="mt-4 text-muted-foreground">Find answers to common questions about ASWAQ Online</p>
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
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-8">Our support team is here to assist you 24/7</p>
            <Button size="lg">Contact Support</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}