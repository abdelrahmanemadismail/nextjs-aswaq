import BreadcrumbNav from "@/components/BreadcrumbNav";
import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { Languages } from "@/constants/enums";
import { headers } from "next/headers";
import { Locale } from "@/i18n.config";

export default async function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <CategoryBar />
      </div>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className={`mb-8 w-full flex ${locale === Languages.ARABIC ? "justify-end" : "justify-start"}`}>
          <BreadcrumbNav />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}