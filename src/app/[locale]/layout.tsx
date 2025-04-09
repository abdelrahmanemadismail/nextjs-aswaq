import type { Metadata, Viewport } from 'next';
import { Cairo, Lato } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ProfileProvider } from '@/context/ProfileContext';
import { Locale } from '@/i18n.config';
import { Languages, Directions } from '@/constants/enums';
import { GoogleTagManager } from '@next/third-parties/google';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

// Fonts
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
});

const cairo = Cairo({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

// Spinner fallback
const Spinner = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    <Loader2 className="animate-spin text-primary" size={48} />
  </div>
);

// Static routes for locales
export async function generateStaticParams() {
  return Object.values(Languages).map((locale) => ({ locale }));
}

// Metadata generator
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const locale = (await params).locale;

  const shared = {
    metadataBase: new URL('https://aswaq.online'),
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en',
        'ar-AE': '/ar',
      },
    },
  };

  if (locale === Languages.ARABIC) {
    return {
      ...shared,
      title: 'أسواق أونلاين | أسرع طريقة للبيع والشراء في الإمارات',
      description:
        'بع بسرعة وسهولة في الإمارات مع Aswaq.Online! أسرع طريقة لبيع السيارات، الإلكترونيات، الأزياء والمزيد في دبي وجميع أنحاء الإمارات.',
      keywords: [
        'شراء وبيع في الإمارات', 'سوق إلكتروني', 'بيع سيارات في دبي',
        'شراء إلكترونيات مستعملة', 'بيع ملابس مقابل النقد', 'بيع أثاث مستعمل', 'أسواق أون لاين', "أسواق أونلاين", 'Aswaq Online'
      ],
      openGraph: {
        title: 'أسواق.أونلاين | أسرع طريقة للبيع والشراء في الإمارات',
        description:
          'بع بسرعة وسهولة في الإمارات مع Aswaq.Online! أسرع طريقة لبيع السيارات، الإلكترونيات، الأزياء والمزيد.',
        url: 'https://aswaq.online/ar',
        siteName: 'Aswaq.Online',
        locale: 'ar_AE',
        type: 'website',
        images: [
          {
            url: 'https://aswaq.online/og-image.png',
            width: 1200,
            height: 630,
            alt: 'أسواق.أونلاين - سوق الإمارات',
          },
        ],
      },
    };
  }

  return {
    ...shared,
    title: 'Aswaq.Online | Fastest Way to Buy & Sell in UAE',
    description:
      'Sell Fast & Easy in UAE with Aswaq.Online! The fastest way to sell cars, electronics, fashion, and more in Dubai and across the UAE.',
    keywords: [
      'Buy and sell in UAE', 'Online marketplace UAE', 'Sell cars fast in Dubai',
      'Cash for phones UAE', 'Sell clothes online', 'Used furniture UAE','Aswaq Online', 'Cheap phones UAE', 'Cheap cars UAE'
    ],
    openGraph: {
      title: 'Aswaq.Online | Fastest Way to Buy & Sell in UAE',
      description:
        "Sell Fast & Easy in UAE with Aswaq.Online! The fastest way to sell cars, electronics, fashion, and more in Dubai and across the UAE. Enjoy the cheapest subscription rates and reach trusted buyers instantly.",
      url: 'https://aswaq.online/en',
      siteName: 'Aswaq.Online',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://aswaq.online/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Aswaq Online - UAE Marketplace',
        },
      ],
    },
  };
}

// Main layout
export default async function RootLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
  children: React.ReactNode;
}>) {
  const locale = (await params).locale;
  const isArabic = locale === Languages.ARABIC;

  return (
    <html lang={locale} dir={isArabic ? Directions.RTL : Directions.LTR}>
      {/* TikTok Pixel */}
      <Script id="tiktok-pixel" strategy="lazyOnload">
        {`
          !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)));}};
          for(var i=0;i<ttq.methods.length;i++){ttq.setAndDefer(ttq,ttq.methods[i]);}
          ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
          var o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
          ttq._o=ttq._o||{};ttq._o[e]=n||{};var script=document.createElement("script");
          script.type="text/javascript";script.async=true;script.src=r+"?sdkid="+e+"&lib="+t;
          var firstScript=document.getElementsByTagName("script")[0];firstScript.parentNode.insertBefore(script,firstScript);};
          ttq.load('CVLTPQBC77UCTQ7C5C5G');ttq.page();
        `} 
      </Script>

      <GoogleTagManager gtmId={process.env.gtmId || 'GTM-XYZ'} />

      <body className={isArabic ? cairo.className : lato.className}>
        <ProfileProvider>
          <Suspense fallback={<Spinner />}>
            {children}
          </Suspense>
        </ProfileProvider>
        <Toaster />
      </body>
    </html>
  );
}
