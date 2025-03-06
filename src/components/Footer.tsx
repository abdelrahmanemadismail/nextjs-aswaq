import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';
import { headers } from 'next/headers';
import { FacebookLogo, InstagramLogo, LinkedinLogo, PinterestLogo, SnapLogo, TiktokLogo } from './Icons';

const Footer = async () => {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  const getLocalizedPath = (path: string) => {
    // If the path already starts with the locale, return it as is
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
      return path;
    }
    
    // If path starts with another locale, replace it
    const locales = ['ar', 'en'];
    for (const loc of locales) {
      if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
        return path.replace(`/${loc}`, `/${locale}`);
      }
    }
    
    // Otherwise, prepend the current locale
    return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
  };

  return (
    <footer style={{ backgroundColor: 'hsla(203, 79%, 94%, 0.5)' }} className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-end">
          {/* Left Column - Logo and Contact */}
          <div className="w-full mb-8 lg:mb-0 flex flex-col items-center lg:items-start md:items-start">
            <Link href={getLocalizedPath('/')} className="block mb-8">
              <Image
                src="/logo.svg"
                alt="Aswaq Online"
                width={150}
                height={50}
                className="h-auto"
              />
            </Link>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinLogo />
              </a>
              <a 
                href="https://www.instagram.com/aswaqdotonline/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <InstagramLogo />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <FacebookLogo />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
                aria-label="TikTok"
              >
                <TiktokLogo />
              </a>
              <a 
                href="https://pinterest.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors"
                aria-label="Pinterest"
              >
                <PinterestLogo />
              </a>
              <a 
                href="https://snapchat.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition-colors"
                aria-label="Snapchat"
              >
               <SnapLogo />
              </a>
            </div>
          </div>

          {/* Right Column - Navigation Links */}
            <ul className="space-y-2 w-full flex flex-col items-center lg:items-end md:items-end justify-end">
              <li><Link href={getLocalizedPath('/about-us')} className="text-muted-foreground hover:text-primary">{t.footer.aboutUs}</Link></li>
              <li><Link href={getLocalizedPath('/contact')} className="text-muted-foreground hover:text-primary">{t.footer.contactUs}</Link></li>
              <li><Link href={getLocalizedPath('/help')} className="text-muted-foreground hover:text-primary">{t.footer.helpCenter}</Link></li>
              <li><Link href={getLocalizedPath('/terms-of-service')} className="text-muted-foreground hover:text-primary">{t.footer.termsOfUse}</Link></li>
              <li><Link href={getLocalizedPath('/privacy-policy')} className="text-muted-foreground hover:text-primary">{t.footer.privacyPolicy}</Link></li>
            </ul>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-sm mb-4 lg:mb-0">
              {t.footer.copyright.replace('{year}', '2025')}
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href={getLocalizedPath('/privacy-policy')} className="hover:underline">
                {t.footer.privacyPolicy}
              </Link>
              <Link href={getLocalizedPath('/terms-of-service')} className="hover:underline">
                {t.footer.termsOfService}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;