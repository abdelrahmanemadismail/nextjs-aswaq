import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from 'lucide-react';
import { UX, Culture } from '@/components/Icons';
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';

const AboutUs = async () => {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-6">
          {t.about.heroTitle}
        </h1>
      </div>

      {/* Our Story Section */}
      <Card className="mb-16">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-4">
                {t.about.storyTitle}
              </h2>
              <div className="space-y-4">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-primary">
                  {t.about.buildingTitle}
                </h3>
                <p className="text-muted-foreground">
                  {t.about.buildingContent}
                </p>
              </div>
            </div>
            <div className="flex justify-center relative w-full aspect-[16/9]">
              <Image
                src="/aswaq-bogo-banner.png"
                alt={t.about.logoAlt}
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
          {t.about.coverageTitle}
        </h2>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Customer Trust */}
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="h-12 w-12 text-primary2" />
            </div>
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              {t.about.features.customerTrust.title}
            </h3>
            <p className="text-muted-foreground">
              {t.about.features.customerTrust.content}
            </p>
          </CardContent>
        </Card>

        {/* User Experience */}
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <UX className="h-12 w-12 text-primary2" />
            </div>
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              {t.about.features.userExperience.title}
            </h3>
            <p className="text-muted-foreground">
              {t.about.features.userExperience.content}
            </p>
          </CardContent>
        </Card>

        {/* Cultural Relevance */}
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <Culture className="h-12 w-12 text-primary2" />
            </div>
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              {t.about.features.culturalRelevance.title}
            </h3>
            <p className="text-muted-foreground">
              {t.about.features.culturalRelevance.content}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AboutUs;