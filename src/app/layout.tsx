import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ProfileProvider } from "@/context/ProfileContext";
import { Suspense } from "react";
import { LoaderCircle } from 'lucide-react';

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  preload: true,
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lato.className}>
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
