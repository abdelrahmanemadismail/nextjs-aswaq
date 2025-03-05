import type { Metadata } from "next";
import { Cairo, Lato } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ProfileProvider } from "@/context/ProfileContext";
import { Suspense } from "react";
import { LoaderCircle } from 'lucide-react';
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
  <div className="flex justify-center items-center h-full">
    <LoaderCircle className="text-primary" />
  </div>
);

export const metadata: Metadata = {
  title: "Aswaq Online",
  description: "Aswaq Online",
};

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
        <div className="h-screen w-screen">
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
