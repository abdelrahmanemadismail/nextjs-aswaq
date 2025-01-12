import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ProfileProvider } from "@/context/ProfileContext";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  preload: true,
  display: "swap",
});

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
          <ProfileProvider>{children}</ProfileProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
