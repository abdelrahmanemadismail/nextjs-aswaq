// lib/stores/languageStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Languages } from '@/constants/enums';
import { LanguageType } from '@/i18n.config';

interface LanguageState {
  currentLanguage: LanguageType;
  setLanguage: (language: LanguageType) => void;
  toggleLanguage: () => void;
}

// Create the language store with persist middleware
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      // Default to the system's language if possible, otherwise use Arabic (your default)
      currentLanguage: Languages.ARABIC,
      
      // Set a specific language
      setLanguage: (language: LanguageType) => {
        set({ currentLanguage: language });
        
        // Also update the HTML dir attribute for RTL/LTR
        if (typeof document !== 'undefined') {
          document.documentElement.dir = language === Languages.ARABIC ? 'rtl' : 'ltr';
          document.documentElement.lang = language;
        }
      },
      
      // Toggle between languages
      toggleLanguage: () => {
        set((state) => ({ 
          currentLanguage: state.currentLanguage === Languages.ARABIC ? Languages.ENGLISH : Languages.ARABIC 
        }));
        
        // Also update the HTML dir attribute for RTL/LTR
        if (typeof document !== 'undefined') {
          document.documentElement.dir = 
            document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl';
          document.documentElement.lang = 
            document.documentElement.lang === Languages.ARABIC ? Languages.ENGLISH : Languages.ARABIC;
        }
      },
    }),
    {
      name: 'language-storage', // Storage key
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // Using native API in browser
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [cookieName, cookieValue] = cookie.trim().split('=');
              if (cookieName === name && cookieValue) {
                try {
                  return JSON.parse(decodeURIComponent(cookieValue));
                } catch (e) {
                  console.error('Error parsing cookie value', e);
                }
              }
            }
          }
          return null;
        },
        setItem: (name, value) => {
          // Using native API in browser
          if (typeof document !== 'undefined') {
            const expiry = new Date();
            expiry.setTime(expiry.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
            document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expiry.toUTCString()};path=/`;
          }
        },
        removeItem: (name) => {
          // Using native API in browser
          if (typeof document !== 'undefined') {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        },
      })),
      // Only persist the currentLanguage, not the methods
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);

// Export helper to get language on the server side from cookies
export const getStoredLanguage = (cookieString: string): LanguageType | null => {
  try {
    const cookies = cookieString.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'language-storage' && value) {
        const { state } = JSON.parse(decodeURIComponent(value));
        if (state?.currentLanguage && 
           (state.currentLanguage === Languages.ARABIC || 
            state.currentLanguage === Languages.ENGLISH)) {
          return state.currentLanguage;
        }
      }
    }
    return null;
  } catch (e) {
    console.error('Error parsing language from cookies:', e);
    return null;
  }
};