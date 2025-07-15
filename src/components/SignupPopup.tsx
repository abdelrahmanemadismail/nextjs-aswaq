import React from 'react';
import { SignupPopupClient } from './SignupPopupClient';

type Locale = 'en' | 'ar';

// Translations for the popup content
const translations = {
  en: {
    title: "Join Our Marketplace Today!",
    subtitle: "Sign up now and start buying or selling with ease.",
    benefits: ["Post listings 3 days free", "Connect with buyers & sellers"],
    cta: "Sign Up Now",
    secondary: "Already have an account? Login",
    close: "Close popup"
  },
  ar: {
    title: "انضم إلى سوقنا اليوم!",
    subtitle: "سجل الآن وابدأ البيع أو الشراء بسهولة.",
    benefits: ["انشر إعلاناتك 3 أيام مجانية", "تواصل مع المشترين والبائعين"],
    cta: "سجل الآن",
    secondary: "لديك حساب بالفعل؟ تسجيل الدخول",
    close: "أغلق النافذة"
  }
};

const SignupPopup = ({ locale = 'en' }: { locale?: Locale }) => {
  const content = translations[locale] || translations.en;
  
  return <SignupPopupClient content={content} locale={locale} />;
};

export default SignupPopup;