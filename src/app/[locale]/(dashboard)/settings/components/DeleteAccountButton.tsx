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
import { signOut } from "@/actions/auth-actions";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";


export default function DeleteAccountButton() {
  const router = useRouter();
  const { t, getLocalizedPath } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);



  const handleDeleteAccount = async () => {
    try {
      await signOut();
      router.push(getLocalizedPath("/auth/login"));
      toast({
        title: t?.settings?.deleteAccount?.success || "Account Deleted",
        description: t?.settings?.deleteAccount?.successDescription || "Your account has been successfully deleted",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t?.settings?.deleteAccount?.error || "Error",
        description: t?.settings?.deleteAccount?.errorDescription || "There was a problem deleting your account",
        variant: "destructive",
      });
    } finally {
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
              "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t?.settings?.deleteAccount?.cancel || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t?.settings?.deleteAccount?.confirm || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}