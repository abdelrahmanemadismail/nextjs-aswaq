"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

type Locale = 'en' | 'ar';

type Content = {
  title: string;
  subtitle: string;
  benefits: string[];
  cta: string;
  secondary: string;
  close: string;
};

interface SignupPopupClientProps {
  content: Content;
  locale: Locale;
}

export const SignupPopupClient = ({ content, locale }: SignupPopupClientProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isUser, setIsUser] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is signed in
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsUser(!!user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (isUser === null) return; // Wait for user check
    if (isUser) return; // Don't show popup if user is signed in
    // Show popup after 15 seconds of page load or on 50% scroll, whichever happens first
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsVisible(true);
      }
    }, 100);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight - window.innerHeight;
      
      if (scrollPosition > pageHeight * 0.5 && !hasInteracted) {
        setIsVisible(true);
        setHasInteracted(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasInteracted, isUser]);
  
  const closePopup = () => {
    setIsVisible(false);
    setHasInteracted(true);
    
    // Set cookie to prevent showing again for 3 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    document.cookie = `signup_popup_shown=true; expires=${expiryDate.toUTCString()}; path=/`;
  };
  
  if (!isVisible || isUser) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-auto overflow-hidden transform transition-all ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Decorative top banner */}
        <div className="h-1.5 sm:h-2 bg-gradient-to-r from-primary to-blue-400"></div>
        
        <div className="relative p-4 sm:p-6">
          {/* Close button */}
          <button 
            onClick={closePopup}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            aria-label={content.close}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{content.title}</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{content.subtitle}</p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary2 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="space-y-3 sm:space-y-4">
            <Link 
              href={`/${locale}/auth/signup`}
              className="flex items-center justify-center w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
            >
              {content.cta}
            </Link>
            
            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Link href={`/${locale}/auth/login`} className="text-primary2 hover:underline">
                {content.secondary}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 