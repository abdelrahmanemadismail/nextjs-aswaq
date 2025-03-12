// components/SellHeader.tsx
'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useListingFormStore } from '@/hooks/use-listing-form-store';
import { useTranslation } from '@/hooks/use-translation';
import LanguageSwitcher from './LanguageSwitcher';

// Import components for the alert dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SellHeader() {
  const { t } = useTranslation();
  const resetForm = useListingFormStore((state) => state.resetForm);
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  const handleLeave = async () => {
    // Show confirmation dialog
    setShowAlert(true);
  };

  const confirmLeave = async () => {
    // Reset form and navigate to home
    await resetForm();
    router.push('/');
  };

  return (
    <>
      <header className="flex items-center justify-between py-3 px-3 md:px-8 lg:px-10 border-b w-full">
        <button 
          className="flex items-center text-foreground hover:text-primary transition-colors"
          onClick={handleLeave}
        >
          <X className="h-6 w-6 mr-2" />
          <span className="text-base font-medium">{t.common.leave}</span>
        </button>
        
        <div className="flex-1 flex justify-center">
          <Image
            src="/logo.svg"
            alt="ASWAQ Online"
            width={200}
            height={60}
            className="h-20 w-auto"
            priority
          />
        </div>
        
        <div >
          <LanguageSwitcher />
        </div>
      </header>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirmLeaving || 'Confirm Leaving'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.leaveWarning || 'All your entered data will be lost. Are you sure you want to leave?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-destructive text-destructive-foreground">
              {t.common.leave || 'Leave'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}