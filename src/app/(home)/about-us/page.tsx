import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from 'lucide-react';
import { UX, Culture } from '@/components/Icons';

const AboutUs = () => {
  return (
    <>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-6">
          Seamless connections between buyers and sellers
        </h1>
      </div>

      {/* Our Story Section */}
      <Card className="mb-16">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-4">
                How we came out?
              </h2>
              <div className="space-y-4">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-primary">
                  Building the Dream
                </h3>
                <p className="text-muted-foreground">
                  Abdul gathered a dedicated team of developers, marketers, and logistics experts. They worked hard to
                  turn his vision into reality, aiming to make the digital marketplace accessible not only in affluent cities
                  but also in remote towns. Their mission was to combine the rich cultural heritage of the Middle East
                  with modern technology, crafting a unique e-commerce experience that was both local and globally
                  competitive.
                </p>
              </div>
            </div>
            <div className="flex justify-center relative w-full aspect-[16/9]">
              <Image
                src="/aswaq-bogo-banner.png"
                alt="ASWAQ Logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="eager"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ASWAQ Coverage Section */}
      <div className="text-center mb-16">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-8">
          ASWAQ in the Middle East and North Africa.
        </h2>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Customer Trust */}
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              Customer Trust
            </h3>
            <p className="text-muted-foreground">
              Ensuring secure transactions, protecting user data, and providing reliable customer service.
            </p>
          </CardContent>
        </Card>

        {/* User Experience */}
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <UX className="h-12 w-12 text-primary" />
            </div>
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              User Experience
            </h3>
            <p className="text-muted-foreground">
              Offering a seamless, intuitive, and enjoyable shopping experience, from browsing to checkout.
            </p>
          </CardContent>
        </Card>

        {/* Cultural Relevance */}
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <Culture className="h-12 w-12 text-primary" />
            </div>
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              Cultural Relevance
            </h3>
            <p className="text-muted-foreground">
              Understanding and incorporating local customs, preferences, and languages to resonate with the target audience.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AboutUs;