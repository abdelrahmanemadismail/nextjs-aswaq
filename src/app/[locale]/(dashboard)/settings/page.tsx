"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth-actions";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notificationSettings, setNotificationSettings] = useState({
    generalProducts: true,
    adsInterested: true,
    userActions: true,
    accountInfo: true,
    promotions: true,
  });

  const handleNotificationChange = (
    setting: keyof typeof notificationSettings
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));

    // Show toast notification
    toast({
      title: t.settings.notifications.updated,
      description: t.settings.notifications.savedPreferences,
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await signOut();
      router.push("/auth/login");
      toast({
        title: t.settings.deleteAccount.success,
        description: t.settings.deleteAccount.successDescription,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t.settings.deleteAccount.error,
        description: t.settings.deleteAccount.errorDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-8 space-y-8">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.notifications.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Products */}
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="general-products"
              className="flex flex-col space-y-1"
            >
              <span>{t.settings.notifications.generalProducts.title}</span>
              <span className="text-sm text-muted-foreground">
                {t.settings.notifications.generalProducts.description}
              </span>
            </Label>
            <Switch
              id="general-products"
              checked={notificationSettings.generalProducts}
              onCheckedChange={() =>
                handleNotificationChange("generalProducts")
              }
            />
          </div>

          {/* Ads Interested */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ads-interested" className="flex flex-col space-y-1">
              <span>{t.settings.notifications.adsInterested.title}</span>
              <span className="text-sm text-muted-foreground">
                {t.settings.notifications.adsInterested.description}
              </span>
            </Label>
            <Switch
              id="ads-interested"
              checked={notificationSettings.adsInterested}
              onCheckedChange={() => handleNotificationChange("adsInterested")}
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="user-actions" className="flex flex-col space-y-1">
              <span>{t.settings.notifications.userActions.title}</span>
              <span className="text-sm text-muted-foreground">
                {t.settings.notifications.userActions.description}
              </span>
            </Label>
            <Switch
              id="user-actions"
              checked={notificationSettings.userActions}
              onCheckedChange={() => handleNotificationChange("userActions")}
            />
          </div>

          {/* Account Info */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="account-info" className="flex flex-col space-y-1">
              <span>{t.settings.notifications.accountInfo.title}</span>
              <span className="text-sm text-muted-foreground">
                {t.settings.notifications.accountInfo.description}
              </span>
            </Label>
            <Switch
              id="account-info"
              checked={notificationSettings.accountInfo}
              onCheckedChange={() => handleNotificationChange("accountInfo")}
            />
          </div>

          {/* Promotions */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="promotions" className="flex flex-col space-y-1">
              <span>{t.settings.notifications.promotions.title}</span>
              <span className="text-sm text-muted-foreground">
                {t.settings.notifications.promotions.description}
              </span>
            </Label>
            <Switch
              id="promotions"
              checked={notificationSettings.promotions}
              onCheckedChange={() => handleNotificationChange("promotions")}
            />
          </div>
        </CardContent>
      </Card>

      {/* change email */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>{t.settings.email.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="primary_outline" onClick={() => {router.push("/auth/change-email")}}>{t.settings.email.button}</Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>{t.settings.password.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="primary_outline" onClick={() => {router.push("/auth/reset-password")}}>{t.settings.password.button}</Button>
        </CardContent>
      </Card>

      {/* change phone number */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>{t.settings.phone.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="primary_outline" onClick={() => {router.push("/auth/phone-verification")}}>{t.settings.phone.button}</Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>{t.settings.deleteAccount.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                {t.settings.deleteAccount.button}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.settings.deleteAccount.confirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.settings.deleteAccount.confirmDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.settings.deleteAccount.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t.settings.deleteAccount.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}