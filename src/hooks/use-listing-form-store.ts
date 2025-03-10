// hooks/use-listing-form-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storeFiles, retrieveFiles, clearFiles } from '@/services/indexedDB';
import { ListingFormData, ListingStep } from '@/types/listing'

// 5 hours in milliseconds
const EXPIRATION_TIME = 5 * 60 * 60 * 1000;

interface ListingFormState {
  // Form data
  formData: Partial<ListingFormData>;
  currentStep: ListingStep;
  isSubmitting: boolean;
  validationErrors: Record<string, string | undefined>;
  imagesLoaded: boolean;
  lastUpdated: number; // Add timestamp for expiration check
  
  // Actions
  setFormData: (data: Partial<ListingFormData>) => void;
  updateFormField: <K extends keyof ListingFormData>(
    key: K, 
    value: ListingFormData[K]
  ) => void;
  setCurrentStep: (step: ListingStep) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setValidationError: (field: string, error: string | null) => void;
  resetForm: () => void;
  saveImagesToIndexedDB: () => Promise<void>;
  loadImagesFromIndexedDB: () => Promise<void>;
  checkExpiration: () => boolean;
}

// Initial form data structure
const initialFormData: Partial<ListingFormData> = {
  category: {
    main_category: '',
  },
  images: [],
  details: {
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    price: '',
    address: '',
    address_ar: '',
    latitude: null,
    longitude: null,
    location_id: '',
    condition: 'new',
    is_negotiable: false,
    contact_method: ['phone'],
  },
  package_details: {
    user_package_id: '',
    is_bonus_listing: false,
    is_featured: false,
  }
};

export const useListingFormStore = create<ListingFormState>()(
  persist(
    (set, get) => ({
      // State
      formData: initialFormData,
      currentStep: 'category',
      isSubmitting: false,
      validationErrors: {},
      imagesLoaded: false,
      lastUpdated: Date.now(),
      
      // Actions
      setFormData: (data) => 
        set((state) => {
          const newState = { 
            formData: { ...state.formData, ...data },
            lastUpdated: Date.now()
          };
          
          if (data.images && Array.isArray(data.images)) {
            get().saveImagesToIndexedDB();
          }
          
          return newState;
        }),
      
      updateFormField: (key, value) => 
        set((state) => {
          const newState = {
            formData: { 
              ...state.formData, 
              [key]: value 
            },
            lastUpdated: Date.now()
          };
          
          if (key === 'images' && Array.isArray(value)) {
            setTimeout(() => get().saveImagesToIndexedDB(), 0);
          }
          
          return newState;
        }),
      
      setCurrentStep: (step) => 
        set({ currentStep: step, lastUpdated: Date.now() }),
      
      setIsSubmitting: (isSubmitting) => 
        set({ isSubmitting }),
      
      setValidationError: (field, error) => 
        set((state) => ({
          validationErrors: {
            ...state.validationErrors,
            [field]: error || undefined
          } as Record<string, string | undefined>
        })),
      
      resetForm: async () => {
        // Clear images from IndexedDB
        await clearFiles();
        
        // Reset the state
        set({ 
          formData: initialFormData,
          currentStep: 'category',
          isSubmitting: false,
          validationErrors: {},
          imagesLoaded: false,
          lastUpdated: Date.now()
        });
      },
      
      saveImagesToIndexedDB: async () => {
        const { formData } = get();
        if (formData.images && Array.isArray(formData.images)) {
          try {
            const validFiles = formData.images.filter(file => file instanceof File);
            await storeFiles(validFiles);
          } catch (error) {
            console.error('Failed to save images to IndexedDB:', error);
          }
        }
      },
      
      loadImagesFromIndexedDB: async () => {
        try {
          // Check expiration before loading
          if (get().checkExpiration()) {
            await get().resetForm();
            return;
          }

          if (!get().imagesLoaded) {
            const files = await retrieveFiles();
            if (files.length > 0) {
              set((state) => ({
                formData: {
                  ...state.formData,
                  images: files
                },
                imagesLoaded: true,
                lastUpdated: Date.now()
              }));
            } else {
              set({ imagesLoaded: true });
            }
          }
        } catch (error) {
          console.error('Failed to load images from IndexedDB:', error);
          set({ imagesLoaded: true });
        }
      },

      checkExpiration: () => {
        const { lastUpdated } = get();
        return Date.now() - lastUpdated > EXPIRATION_TIME;
      }
    }),
    {
      name: 'listing-form-storage',
      partialize: (state) => ({
        formData: {
          ...state.formData,
          images: undefined, // Don't save images to localStorage
        },
        currentStep: state.currentStep,
        lastUpdated: state.lastUpdated
      }),
    }
  )
);