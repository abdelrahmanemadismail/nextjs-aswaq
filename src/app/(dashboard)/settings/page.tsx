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

export default function SettingsPage() {
  const router = useRouter();
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
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await signOut();
      router.push("/auth/login");
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-8 space-y-8">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Products */}
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="general-products"
              className="flex flex-col space-y-1"
            >
              <span>General information about products and services</span>
              <span className="text-sm text-muted-foreground">
                Receive updates about new products and services on Aswaaq
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
              <span>Informations about Ads I&apos;m interested in</span>
              <span className="text-sm text-muted-foreground">
                Get notified about new ads matching your interests
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
              <span>Actions from other users on my account</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications about messages, likes, and other
                interactions
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
              <span>General informations and hints about my account</span>
              <span className="text-sm text-muted-foreground">
                Stay updated about your account status and tips
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
              <span>Promotions and Ads from OpenSooq</span>
              <span className="text-sm text-muted-foreground">
                Receive promotional content and special offers
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
          <CardTitle>Change Email</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="primary_outline" onClick={() => {router.push("/auth/change-email")}}>Change Email</Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="primary_outline" onClick={() => {router.push("/auth/reset-password")}}>Change Password</Button>
        </CardContent>
      </Card>

      {/* change phone number */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>Change Phone Number</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="primary_outline" onClick={() => {router.push("/auth/phone-verification")}}>Change Phone Number</Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>Delete Your Account</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                Delete your account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
