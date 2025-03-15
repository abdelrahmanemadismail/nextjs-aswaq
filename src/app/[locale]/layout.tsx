import type { Metadata } from "next";
import { Cairo, Lato } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ProfileProvider } from "@/context/ProfileContext";
import { Suspense } from "react";
import { Loader2 } from 'lucide-react';
import { Locale } from "@/i18n.config";
import { Directions, Languages } from "@/constants/enums";
import { GoogleTagManager } from '@next/third-parties/google'

export async function generateStaticParams() {
  return [{ locale: Languages.ARABIC }, { locale: Languages.ENGLISH }];
}

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  preload: true,
  display: "swap",
});
const cairo = Cairo({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: true,
});

// Simple spinner component
const Spinner = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    <Loader2 className="text-primary" />
  </div>
);

export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const locale = (await params).locale;
  
  // Shared icons and other metadata
  const sharedMetadata = {
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    metadataBase: new URL('https://aswaq.online'),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en',
        'ar-AE': '/ar',
      },
    },
    robots: {
      index: true,
      follow: true,
    }
  };
  
  // Language-specific metadata
  if (locale === Languages.ARABIC) {
    return {
      title: "أسواق أونلاين | أسرع طريقة للبيع والشراء في الإمارات",
      description: "بع بسرعة وسهولة في الإمارات مع Aswaq.Online! أسرع طريقة لبيع السيارات، الإلكترونيات، الأزياء والمزيد في دبي وجميع أنحاء الإمارات. اشترك بأرخص الأسعار وابدأ البيع اليوم!",
      keywords: [
        "شراء وبيع في الإمارات", "عروض سريعة في دبي", "سوق إلكتروني في الإمارات", 
        "أفضل سوق في الإمارات", "صفقات سريعة في الإمارات", "شراء وبيع السيارات في الإمارات", 
        "بيع سيارتي بسرعة في دبي", "شراء سيارات مستعملة في دبي", "مشترين سيارات في دبي", 
        "بيع سيارة بسرعة في الإمارات", "شراء وبيع الإلكترونيات في الإمارات", 
        "بيع الهواتف مقابل النقد في دبي", "نقد فوري للإلكترونيات في دبي",
        "شراء وبيع الملابس في الإمارات", "بيع الملابس مقابل النقد في دبي",
        "نقد سريع مقابل الملابس في الإمارات", "شراء وبيع الأثاث في الإمارات",
        "بيع الأثاث بسرعة في دبي", "نقد فوري مقابل الأثاث في الإمارات"
      ],
      openGraph: {
        title: 'أسواق.أونلاين | أسرع طريقة للبيع والشراء في الإمارات',
        description: 'بع بسرعة وسهولة في الإمارات مع Aswaq.Online! أسرع طريقة لبيع السيارات، الإلكترونيات، الأزياء والمزيد في دبي وجميع أنحاء الإمارات',
        url: 'https://aswaq.online/ar',
        siteName: 'Aswaq.Online',
        locale: 'ar_AE',
        type: 'website',
        images: [
          {
            url: 'https://aswaq.online/og-image.png',
            width: 1200,
            height: 630,
            alt: 'أسواق.أونلاين - سوق التسوق الإلكتروني في الإمارات',
          }
        ],
      },
      ...sharedMetadata,
    };
  } else {
    return {
      title: "Aswaq.Online | Fastest Way to Buy & Sell in UAE",
      description: "Sell Fast & Easy in UAE with Aswaq.Online! The fastest way to sell cars, electronics, fashion, and more in Dubai and across the UAE. Enjoy the cheapest subscription rates and reach trusted buyers instantly.",
      keywords: [
        "Buy and sell in UAE", "Fast deals in Dubai", "Online marketplace UAE", 
        "Best marketplace UAE", "Quick deals UAE", "Buy and sell cars UAE", 
        "Sell my car fast Dubai", "Buy used cars in Dubai", "Car buyers in Dubai", 
        "Quick car sale UAE", "Buy and sell electronics UAE", "Sell phones for cash Dubai", 
        "Instant cash for electronics Dubai", "Buy and sell fashion UAE", 
        "Sell clothes for cash Dubai", "Quick cash for clothes UAE",
        "Buy and sell furniture UAE", "Sell used furniture fast Dubai", "Cash for furniture UAE"
      ],
      openGraph: {
        title: 'Aswaq.Online | Fastest Way to Buy & Sell in UAE',
        description: 'Sell Fast & Easy in UAE with Aswaq.Online! The fastest way to sell cars, electronics, fashion, and more in Dubai and across the UAE.',
        url: 'https://aswaq.online/en',
        siteName: 'Aswaq.Online',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: 'https://aswaq.online/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Aswaq Online - UAE E-commerce Marketplace',
          }
        ],
      },
      ...sharedMetadata,
    };
  }
}

export default async function RootLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
  children: React.ReactNode;
}>) {
  const locale = (await params).locale;
  return (
    <html
      lang={locale}
      dir={locale === Languages.ARABIC ? Directions.RTL : Directions.LTR}
    >
      <GoogleTagManager gtmId={process.env.gtmId||"GTM-XYZ"} />
      <body className={locale === Languages.ARABIC ? cairo.className : lato.className}>
        <div>
          <ProfileProvider>
            <Suspense fallback={<Spinner />}>
              {children}
            </Suspense>
          </ProfileProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}