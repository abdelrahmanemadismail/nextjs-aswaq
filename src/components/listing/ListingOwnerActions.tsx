// components/listing/ListingOwnerActions.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tag, EyeOff, CheckCircle, BadgeAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  disableListing, 
  markListingAsSold,
  activateListing
} from '@/actions/owner-listing-actions';
import { Badge } from '@/components/ui/badge';

type ListingOwnerActionsProps = {
  listingId: string;
  listingStatus: string;
  translations: {
    edit: string;
    markAsSold: string;
    disable: string;
    activate: string;
    confirmSold: string;
    confirmDisable: string;
    confirmActivate: string;
    cancel: string;
    confirm: string;
    status: string;
    statusActive: string;
    statusSold: string;
    statusUnavailable: string;
  };
};

export function ListingOwnerActions({ listingId, listingStatus, translations }: ListingOwnerActionsProps) {
  const router = useRouter();
  const [showSoldAlert, setShowSoldAlert] = useState(false);
  const [showDisableAlert, setShowDisableAlert] = useState(false);
  const [showActivateAlert, setShowActivateAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if listing is active or not
  const isActive = listingStatus === 'active';
  
  // Get appropriate status label
  const getStatusLabel = () => {
    switch (listingStatus) {
      case 'active':
        return translations.statusActive;
      case 'sold':
        return translations.statusSold;
      case 'unavailable':
        return translations.statusUnavailable;
      default:
        return listingStatus;
    }
  };

  // Get appropriate status badge color
  const getStatusColor = () => {
    switch (listingStatus) {
      case 'active':
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case 'sold':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case 'unavailable':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      default:
        return "";
    }
  };

//   const handleEdit = () => {
//     router.push(`/listings/edit/${listingId}`);
//   };

  const handleMarkAsSold = async () => {
    setIsLoading(true);
    try {
      // API call to mark listing as sold
      const response = await markListingAsSold(listingId);

      if (response.success) {
        // Refresh the page to show updated status
        router.refresh();
      } else {
        console.error('Failed to mark listing as sold:', response.error);
      }
    } catch (error) {
      console.error('Error marking listing as sold:', error);
    } finally {
      setShowSoldAlert(false);
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      // API call to disable listing
      const response = await disableListing(listingId);

      if (response.success) {
        // Refresh the page to show updated status
        router.refresh();
      } else {
        console.error('Failed to disable listing:', response.error);
      }
    } catch (error) {
      console.error('Error disabling listing:', error);
    } finally {
      setShowDisableAlert(false);
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      // API call to activate listing
      const response = await activateListing(listingId);

      if (response.success) {
        // Refresh the page to show updated status
        router.refresh();
      } else {
        console.error('Failed to activate listing:', response.error);
      }
    } catch (error) {
      console.error('Error activating listing:', error);
    } finally {
      setShowActivateAlert(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{translations.status}:</span>
        <Badge className={getStatusColor()}>
          {listingStatus === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
          {listingStatus === 'sold' && <Tag className="h-3 w-3 mr-1" />}
          {listingStatus === 'unavailable' && <BadgeAlert className="h-3 w-3 mr-1" />}
          {getStatusLabel()}
        </Badge>
      </div>
      
      {/* Edit Button (always visible) */}
      {/* <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 mb-3"
        onClick={handleEdit}
      >
        <Edit className="h-4 w-4" />
        {translations.edit}
      </Button> */}
      
      {/* Conditional Buttons based on Status */}
      {isActive ? (
        <>
          {/* For active listings, show Mark as Sold and Disable */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mb-3"
            onClick={() => setShowSoldAlert(true)}
            disabled={isLoading}
          >
            <Tag className="h-4 w-4" />
            {translations.markAsSold}
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setShowDisableAlert(true)}
            disabled={isLoading}
          >
            <EyeOff className="h-4 w-4" />
            {translations.disable}
          </Button>
        </>
      ) : (
        /* For sold or unavailable listings, show Activate */
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setShowActivateAlert(true)}
          disabled={isLoading}
        >
          <CheckCircle className="h-4 w-4" />
          {translations.activate}
        </Button>
      )}

      {/* Mark as Sold Alert Dialog */}
      <AlertDialog open={showSoldAlert} onOpenChange={setShowSoldAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.markAsSold}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.confirmSold}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{translations.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsSold} disabled={isLoading}>
              {isLoading ? "Processing..." : translations.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Listing Alert Dialog */}
      <AlertDialog open={showDisableAlert} onOpenChange={setShowDisableAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.disable}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.confirmDisable}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{translations.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable} disabled={isLoading}>
              {isLoading ? "Processing..." : translations.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Listing Alert Dialog */}
      <AlertDialog open={showActivateAlert} onOpenChange={setShowActivateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.activate}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.confirmActivate}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{translations.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} disabled={isLoading}>
              {isLoading ? "Processing..." : translations.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ListingOwnerActions;