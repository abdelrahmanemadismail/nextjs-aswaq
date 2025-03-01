'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, i18n } from '@/i18n.config';
import { Languages } from '@/constants/enums';

// Define a more flexible translation type that can accommodate unknown properties

// Create a default translation object with empty strings
const defaultTranslations = {
  common: {
    language: '',
    search: '',
    searchPlaceholder: '',
    contactSupport: '',
    viewAll: '',
    loadMore: '',
    moreDetails: '',
    close: '',
    back: '',
    next: '',
    submit: '',
    cancel: '',
    save: '',
    edit: '',
    delete: '',
    yes: '',
    no: '',
    sell: '',
    toggleMenu: '',
    aswaqMenu: '',
    error: '',
    unexpectedError: '',
    processing: ''
  },
  auth: {
    login: '',
    signup: '',
    logout: '',
    forgotPassword: ''
  },
  account: {
    profile: '',
    myPackages: '',
    promotionPackages: '',
    help: '',
    settings: '',
    logout: '',
    userAvatar: '',
    signOutSuccess: '',
    signOutSuccessDescription: '',
    signOutError: '',
    signOutErrorDescription: ''
  },
  payments: {
    selectPlan: '',
    packageIdRequired: '',
    noCheckoutUrl: '',
    checkoutFailed: '',
    free: '',
    getStarted: '',
    selectPackage: '',
    packages: '',
    errorLoadingPackages: '',
    listing: '',
    listings: '',
    bonusListing: '',
    days: '',
    bonusDay: '',
    validFor: '',
    featuredListings: '',
    chooseYourPackage: '',
    selectPerfectPlan: '',
    freeTierPackages: '',
    durationBasedPackages: '',
    bulkPackages: ''
  },
  homepage: {
    heroTitle: '',
    heroTitleHighlight: '',
    heroSubtitle: '',
    statistics: {
      categories: '',
      customerSupport: '',
      secureTransactions: '',
    },
    howItWorks: {
      title: '',
      subtitle: '',
      step1: {
        step: '',
        title: '',
        description: '',
      },
      step2: {
        step: '',
        title: '',
        description: '',
      },
      step3: {
        step: '',
        title: '',
        description: '',
      },
    },
    whyChooseUs: {
      title: '',
      subtitle: '',
      secureTransactions: {
        title: '',
        description: '',
      },
      realTimeUpdates: {
        title: '',
        description: '',
      },
      userFriendly: {
        title: '',
        description: '',
      },
      support: {
        title: '',
        description: '',
      },
    },
    faq: {
      title: '',
      subtitle: '',
    },
    support: {
      title: '',
      subtitle: '',
    },
  },
  footer: {
    aboutUs: '',
    contactUs: '',
    helpCenter: '',
    termsOfUse: '',
    termsOfService: '',
    privacyPolicy: '',
    copyright: ''
  }
};

type TranslationType = typeof defaultTranslations;

export function useTranslation() {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(Languages.ENGLISH);
  const [translations, setTranslations] = useState<TranslationType>(defaultTranslations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract locale from pathname
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1) {
      const pathLocale = pathSegments[1] as Locale;
      if (pathLocale === 'ar' || pathLocale === 'en') {
        setLocale(pathLocale);
      }
    }

    // Load translations based on locale
    async function loadTranslations() {
      try {
        setIsLoading(true);
        // Dynamic import based on locale
        const module = await import(`@/dictionaries/${locale}.json`);
        setTranslations(module.default as TranslationType);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTranslations();
  }, [pathname, locale]);

  // Function to switch the language
  const switchLanguage = useCallback(() => {
    const segments = pathname.split('/');
    const newLocale = locale === Languages.ARABIC ? Languages.ENGLISH : Languages.ARABIC;
    
    if (segments.length > 1 && i18n.locales.includes(segments[1] as any)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    router.push(segments.join('/'));
  }, [locale, pathname, router]);

  // Function to get a localized path
  const getLocalizedPath = useCallback((path: string) => {
    // If the path already starts with the locale, return it as is
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
      return path;
    }
    
    // If path starts with another locale, replace it
    for (const loc of i18n.locales) {
      if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
        return path.replace(`/${loc}`, `/${locale}`);
      }
    }
    
    // Otherwise, prepend the current locale
    return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
  }, [locale]);

  return {
    t: translations,
    locale,
    isLoading,
    switchLanguage,
    getLocalizedPath
  };
}