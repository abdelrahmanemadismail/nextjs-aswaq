"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { markAccountForDeletion } from "@/actions/account-deletion-actions";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

export default function DeleteAccountButton() {
  const router = useRouter();
  const { t, getLocalizedPath } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const result = await markAccountForDeletion();
      if (result.success) {
        router.push(getLocalizedPath("/auth/login"));
        toast({
          title: t?.settings?.deleteAccount?.success || "Account Pending Deletion",
          description: t?.settings?.deleteAccount?.successDescription || 
            "Your account has been marked for deletion. You have 30 days to reactivate it by logging back in.",
        });
      } else {
        throw new Error("Failed to mark account for deletion");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t?.settings?.deleteAccount?.error || "Error",
        description: t?.settings?.deleteAccount?.errorDescription || 
          "There was a problem marking your account for deletion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive mt-3 sm:mt-0 w-full sm:w-auto"
        >
          {t?.settings?.deleteAccount?.button || "Delete Account"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t?.settings?.deleteAccount?.confirmTitle || "Are you sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t?.settings?.deleteAccount?.confirmDescription || 
              "This action will mark your account for deletion. You'll have 30 days to change your mind by simply logging back in. After 30 days, your account and all associated data will be permanently removed from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t?.settings?.deleteAccount?.cancel || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? 
              (t?.common?.processing || "Processing...") : 
              (t?.settings?.deleteAccount?.confirm || "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}