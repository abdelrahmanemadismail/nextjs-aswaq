'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, i18n } from '@/i18n.config';
import { Languages } from '@/constants/enums';

// Define a more flexible translation type that can accommodate unknown properties

// Create a default translation object with empty strings
const defaultTranslations = {
  common: {
    home: '',
    language: '',
    search: '',
    searchPlaceholder: '',
    contactSupport: '',
    viewAll: '',
    loadMore: '',
    moreDetails: '',
    close: '',
    back: '',
    leave: '',
    confirmLeaving: '',
    confirm: '',
    leaveWarning: '',
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
    processing: '',
    aswaqOnline: '',
    success: '',
    somethingWentWrong: '',
    you: '',
    read: '',
    delivered: '',
    typeMessage: '',
    send: '',
    attachImage: '',
    noMessages: '',
    searchConversations: '',
    noConversations: '',
    selectConversation: '',
    conversationNotFound: '',
    participantNotFound: '',
    initialMessage: '',
    startingChat: '',
    chatWithSeller: '',
    notifications: '',
    messages: '',
    loading: ''
  },
  auth: {
    login: '',
    signup: '',
    logout: '',
    forgotPassword: '',
    continueToAswaq: '',
    agreementPrefix: '',
    agreementConnector: '',
    changeEmailAddress: '',
    newEmail: '',
    enterNewEmail: '',
    changeEmail: '',
    changingEmail: '',
    emailChangeError: '',
    emailChangeSuccess: '',
    googleLogo: '',
    continueWithGoogle: '',
    email: '',
    enterEmail: '',
    password: '',
    enterPassword: '',
    orContinueWithEmail: '',
    signIn: '',
    signingIn: '',
    noAccount: '',
    authError: '',
    wrongCredentials: '',
    signInSuccess: '',
    signInSuccessDescription: '',
    setNewPassword: '',
    newPassword: '',
    enterNewPassword: '',
    confirmPassword: '',
    confirmNewPassword: '',
    updatePassword: '',
    updatingPassword: '',
    passwordUpdateError: '',
    passwordUpdateSuccess: '',
    resetYourPassword: '',
    sending: '',
    sendResetLink: '',
    rememberPassword: '',
    resetInstructionsError: '',
    resetInstructionsSent: '',
    createAswaqAccount: '',
    fullName: '',
    enterFullName: '',
    phone: '',
    phonePlaceholder: '',
    creatingAccount: '',
    createAccount: '',
    haveAccount: '',
    registrationError: '',
    accountCreationError: '',
    accountCreated: '',
    verificationEmailSent: '',
    enterValidPhone: '',
    otp: {
      enterCodeSent: '',
      enterCodeSentToPhone: '',
      continue: '',
      didntReceiveCode: '',
      sendAgain: '',
      resendCodeIn: '',
      errorResendingOtp: '',
      pleaseTryAgain: '',
      otpSent: '',
      checkPhoneForCode: '',
      verificationSuccessful: '',
      nowLoggedIn: '',
      verificationFailed: ''
    },
    didntReceiveEmail: '',
    resendVerificationEmail: '',
    resendInSeconds: ''
  },
  account: {
    profile: '',
    myListings: '',
    myPackages: '',
    promotionPackages: '',
    messages: '',
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
    bulkPackages: '',
    success: {
      title: '',
      subtitle: '',
      processing: '',
      pleaseWait: '',
      successTitle: '',
      successMessage: '',
      viewPackages: '',
      backToHome: '',
      errorTitle: '',
      errorMessage: '',
      errorDefault: '',
      tryAgain: '',
      contactSupport: '',
      transactionId: ''
    },
    cancelled: {
      title: '',
      subtitle: '',
      message: '',
      returnToPackages: '',
      backToHome: '',
      needHelp: ''
    }
  },
  listings: {
    km: '',
    share: '',
    call: '',
    whatsapp: '',
    phoneNotAvailable: '',
    callSeller: '',
    whatsappNotAvailable: '',
    messageOnWhatsapp: '',
    whatsappMessage: '',
    success: '',
    listingPublished: '',
    failedToCreate: '',
    ownerActions: {
      title: '',
      description: '',
      edit: '',
      markAsSold: '',
      disable: '',
      activate: '',
      confirmSold: '',
      confirmDisable: '',
      confirmActivate: '',
      status: '',
      statusActive: '',
      statusSold: '',
      statusUnavailable: ''
    },
    form: {
      title: '',
      titlePlaceholder: '',
      titleArabic: '',
      titleArabicPlaceholder: '',
      description: '',
      descriptionPlaceholder: '',
      descriptionArabic: '',
      descriptionArabicPlaceholder: '',
      price: '',
      pricePlaceholder: '',
      condition: '',
      selectCondition: '',
      conditionNew: '',
      conditionUsed: '',
      negotiable: '',
      contactMethods: '',
      contactPhone: '',
      contactChat: '',
      contactWhatsapp: '',
      backToCategories: '',
      chooseCategory: '',
      uploadImages: '',
      addDetails: '',
      reviewListing: '',
      fixErrorsBeforeProceeding: '',
      selectCategoryError: '',
      uploadImageError: '',
      completeRequiredFields: '',
      fixErrorsBeforeSubmitting: '',
      errorSubmitting: '',
      publishing: '',
      publishListing: ''
    },
    location: {
      location: '',
      locationPlaceholder: '',
      locationArabic: '',
      locationArabicPlaceholder: '',
      cityArea: '',
      chooseOnMap: '',
      chooseLocation: '',
      searchOrClick: '',
      confirmLocation: '',
      country: '',
      selectCountry: '',
      city: '',
      selectCity: ''
    },
    review: {
      previewDescription: '',
      noLocation: ''
    },
    vehicles: {
      title: '',
      brand: '',
      brandPlaceholder: '',
      model: '',
      modelPlaceholder: '',
      year: '',
      yearPlaceholder: '',
      mileage: '',
      mileagePlaceholder: '',
      color: '',
      colorPlaceholder: '',
      km: '',
      specs: '',
      subCategory: ''
    },
    properties: {
      title: '',
      propertyType: '',
      selectPropertyType: '',
      apartment: '',
      villa: '',
      commercial: '',
      bedrooms: '',
      bedroomsPlaceholder: '',
      bathrooms: '',
      bathroomsPlaceholder: '',
      squareFootage: '',
      squareFootagePlaceholder: '',
      community: '',
      communityPlaceholder: '',
      furnished: '',
      sqft: ''
    },
    common: {
      paymentTerms: '',
      selectPaymentTerms: '',
      forSale: '',
      forRent: ''
    },
    photos: {
      tipsHeading: '',
      tipLandscape: '',
      tipLighting: '',
      tipBackground: '',
      tipAppropriate: '',
      tipMultipleAngles: '',
      dropHere: '',
      dragAndDrop: '',
      maxImages: '',
      supportedFormats: '',
      uploadedCount: '',
      uploadAlt: '',
      removeImage: ''
    },
    packageSelection: {
      title: '',
      description: '',
      selectPackageError: '',
      listingType: '',
      duration: '',
      packageDetails: '',
      regularListing: '',
      bonusListing: '',
      usingBonusListing: '',
      readyToPublish: '',
      noListingsAvailable: '',
      noAvailableListings: '',
      purchaseNewPackage: '',
      useRegularListing: '',
      useBonusListing: ''
    },
    similar: '',
    filters: {
      sortBy: '',
      newestFirst: '',
      oldestFirst: '',
      priceLowToHigh: '',
      priceHighToLow: '',
      price: '',
      allCategories: '',
      categories: '',
      location: '',
      clearAllFilters: '',
      startSellingTitle: '',
      startSellingDescription: '',
      noListingsFound: '',
      adjustFilters: '',
      viewAllListings: '',
      adsCount: ''
    },
    map: {
      title: ''
    },
    generalTips: {
      title: '',
      publicPlaces: '',
      advancePayment: '',
      inspectProduct: ''
    },
    actionButtons: {
      call: '',
      chat: '',
      phoneNumber: ''
    },
    error: {
      title: '',
      tryAgain: ''
    }
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
      createListing: {
        question: '',
        answer: ''
      },
      listingDuration: {
        question: '',
        answer: ''
      },
      featuredListing: {
        question: '',
        answer: ''
      },
      verifiedSeller: {
        question: '',
        answer: ''
      }
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
  },
  images: {
    cropProfilePicture: '',
    errorCropping: ''
  },
  about: {
    heroTitle: '',
    storyTitle: '',
    buildingTitle: '',
    buildingContent: '',
    logoAlt: '',
    coverageTitle: '',
    features: {
      customerTrust: {
        title: '',
        content: ''
      },
      userExperience: {
        title: '',
        content: ''
      },
      culturalRelevance: {
        title: '',
        content: ''
      }
    }
  },
  contact: {
    title: '',
    subtitle: '',
    getInTouch: {
      title: '',
      description: ''
    },
    emailUs: '',
    form: {
      title: '',
      description: '',
      firstName: '',
      firstNamePlaceholder: '',
      lastName: '',
      lastNamePlaceholder: '',
      email: '',
      emailPlaceholder: '',
      phone: '',
      phonePlaceholder: '',
      subject: '',
      subjectPlaceholder: '',
      message: '',
      messagePlaceholder: '',
      send: '',
      sending: ''
    },
    faq: {
      title: '',
      subtitle: '',
      visitHelpCenter: ''
    },
    thankYou: {
      title: '',
      subtitle: '',
      nextSteps: {
        title: '',
        review: '',
        respond: '',
        reply: ''
      },
      returnHome: ''
    }
  },
  help: {
    title: '',
    howCanWeHelp: '',
    search: '',
    searchTopic: '',
    recommendedForYou: '',
    guidesForGettingStarted: '',
    browseAllTopics: '',
    findingFavoriteStuff: '',
    settingUpAccount: '',
    securingAccount: '',
    sellingStuff: '',
    needToGetInTouch: '',
    contactUs: '',
    needToGetInTouchDesc: '',
    wasArticleHelpful: '',
    articles: {
      title: '',
      description: '',
      categories: '',
      readMore: '',
      noArticles: '',
      previous: '',
      next: '',
      page: '',
      of: ''
    },
    categories: {
      title: '',
      description: '',
      accounts: {
        name: '',
        description: ''
      },
      listingServices: {
        name: '',
        description: ''
      },
      paymentsAndPurchases: {
        name: '',
        description: ''
      },
      advertising: {
        name: '',
        description: ''
      },
      paidListing: {
        name: '',
        description: ''
      },
      safetySecurity: {
        name: '',
        description: ''
      }
    }
  },
  settings: {
  title: '',
  notifications: {
    title: '',
    updated: '',
    savedPreferences: '',
    generalProducts: {
      title: '',
      description: ''
    },
    adsInterested: {
      title: '',
      description: ''
    },
    userActions: {
      title: '',
      description: ''
    },
    accountInfo: {
      title: '',
      description: ''
    },
    promotions: {
      title: '',
      description: ''
    }
  },
  email: {
    title: '',
    button: ''
  },
  password: {
    title: '',
    button: ''
  },
  phone: {
    title: '',
    button: ''
  },
  deleteAccount: {
    title: '',
    button: '',
    confirmTitle: '',
    confirmDescription: '',
    cancel: '',
    confirm: '',
    success: '',
    successDescription: '',
    error: '',
    errorDescription: ''
  }
},
profile: {
  title: '',
  description: '',
  edit: '',
  cancel: '',
  saveChanges: '',
  changePhoto: '',
  fullName: '',
  email: '',
  changeEmail: '',
  phoneNumber: '',
  changePhoneNumber: '',
  dateOfBirth: '',
  selectBirthDate: '',
  verificationStatus: '',
  getVerified: '',
  whyVerification: '',
  verificationBenefits: [
    '',
    '',
    '',
    ''
  ],
  loading: {
    title: '',
    description: ''
  },
  notFound: {
    title: '',
    description: ''
  },
  updated: '',
  updatedDescription: '',
  updateError: '',
  updateErrorDescription: '',
  avatarUpdated: '',
  avatarUpdatedDescription: '',
  avatarUpdateError: '',
  avatarUpdateErrorDescription: '',
  phoneVerification: {
    updatePhoneNumber: '',
    phoneNumber: '',
    enterPhonePlaceholder: '',
    updating: '',
    updateButton: '',
    invalidPhone: '',
    enterValidPhone: '',
    phoneUpdated: '',
    phoneUpdateSuccess: ''
  }
},
verification: {
  title: '',
  subtitle: '',
  emitatesId: '',
  recommended: '',
  passport: '',
  documentNumber: '',
  documentNumberPlaceholder: '',
  expiryDate: '',
  idPhotos: '',
  frontId: '',
  backId: '',
  passportPhoto: '',
  securityNote: '',
  fraudPrevention: '',
  continue: '',
  submitting: '',
  pending: {
    title: '',
    description: '',
    backToHome: ''
  },
  validation: {
    requiredField: '',
    documentNumberRequired: '',
    expiryDateRequired: '',
    idImagesRequired: '',
    passportImageRequired: '',
    fileTooLarge: '',
    fileSizeLimit: ''
  },
  rejected: {
    title: '',
    description: '',
    reasonTitle: '',
    defaultReason: '',
    editRequest: '',
    backToHome: ''
  },
  resubmit: '',
  error: {
    title: '',
    defaultMessage: ''
  }
},
userPackages: {
  title: '',
  error: '',
  noPackages: {
    title: '',
    description: '',
    viewPackages: ''
  },
  card: {
    featured: '',
    listingsUsage: '',
    used: '',
    expires: '',
    soon: '',
    regularListings: '',
    bonusListings: '',
    listingDuration: '',
    bonusDuration: '',
    days: '',
    day: '',
    purchased: '',
    id: '',
    usePackage: ''
  }
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
        const translationModule = await import(`@/dictionaries/${locale}.json`);
        setTranslations(translationModule.default as TranslationType);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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