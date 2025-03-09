// ClaimPackageForm.tsx
'use client';

import { Button } from '../ui/button';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

// Define the server action in a separate file with 'use server' directive
// This import will work because the server action is properly marked
import { getRamadanPackage } from '@/actions/package-actions';

interface ClaimPackageFormProps {
  buttonText: string;
}

export function ClaimPackageForm({ buttonText }: ClaimPackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const result = await getRamadanPackage();
        if (!result.success) {
          console.error("Error in getRamadanPackage:", result.message);
          
        }
  
        toast({
          title: "Success!",
          description: "Your Ramadan package has been claimed successfully.",
        });
        
        window.location.href = '/en/profile/packages';
        return;
      } catch (error) {
        console.error("Exception in claimPackageAction:", error);
        return { success: false, error: "Failed to claim package" };
      }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : buttonText}
      </Button>
    </form>
  );
}