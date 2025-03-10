// components/SellHeader.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';
import LanguageSwitcher from './LanguageSwitcher';

export default async function SellHeader() {
    const url = (await headers()).get('x-url')
    const locale = url?.split('/')[3] as Locale
    const t = await getTrans(locale);

  return (
    <header className="flex items-center justify-between py-3 px-12 border-b w-full">
      <Link 
        href="/"
        className="flex items-center text-foreground hover:text-primary transition-colors"
      >
        <X className="h-6 w-6 mr-2" />
        <span className="text-base font-medium">{t.common.leave}</span>
      </Link>
      
      <div className="flex-1 flex justify-center">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="ASWAQ Online"
            width={200}
            height={60}
            className="h-20 w-auto"
            priority
          />
        </Link>
      </div>
      
      {/* Empty div to balance the layout */}
      <div className="w-20">
      <LanguageSwitcher />
      </div>
    </header>
  );
}