import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';
import { headers } from 'next/headers';
import { FacebookLogo, InstagramLogo, LinkedinLogo, PinterestIcon, SnapchatIcon, TiktokIcon } from './Icons';
import { Languages } from '@/constants/enums';

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

  // Social media data
  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      icon: <LinkedinLogo className="w-5 h-5" />,
      hoverColor: "group-hover:text-blue-600"
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/aswaq.online4",
      icon: <InstagramLogo className="w-5 h-5" />,
      hoverColor: "group-hover:text-pink-600"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61573841013544&rdid=U7m4G5to9Hb1T5jB&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F164fR6eJW9%2F",
      icon: <FacebookLogo className="w-5 h-5" />,
      hoverColor: "group-hover:text-blue-700"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@aswaq.online?is_from_webapp=1&sender_device=pc",
      icon: <TiktokIcon />,
      hoverColor: "group-hover:text-black"
    },
    {
      name: "Pinterest",
      url: "https://www.pinterest.com/aswaqonline454/?invite_code=be0e1646502c4f98abf3f1dacef69390&sender=1147714423696409266",
      icon: <PinterestIcon />,
      hoverColor: "group-hover:text-red-600"
    },
    {
      name: "Snapchat",
      url: "https://www.snapchat.com/add/aswaq.online?share_id=H2liFY6OdyU&locale=ar-AE",
      icon: <SnapchatIcon />,
      hoverColor: "group-hover:text-yellow-400"
    }
  ];

  return (
    <footer style={{ backgroundColor: 'hsla(203, 79%, 94%, 0.5)' }} className="py-12 px-4">
      <div className=" mx-auto px-4">
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
            <div className={`flex ${locale === Languages.ARABIC ? 'flex-row-reverse' : 'flex-row'} flex-wrap gap-2 mt-4 justify-center sm:justify-start`} dir={locale === Languages.ARABIC ? "rtl" : "ltr"}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="group flex items-center justify-center w-10 h-10 rounded-full  transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                >
                  <span className={`text-gray-600 ${social.hoverColor} transition-colors duration-300`}>
                    {social.icon}
                  </span>
                </a>
              ))}
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