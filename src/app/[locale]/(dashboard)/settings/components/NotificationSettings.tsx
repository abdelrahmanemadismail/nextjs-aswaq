"use client";

import { useState } from "react";
import { RTLAwareSwitch } from "@/components/RTLAwareSwitch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";


interface NotificationSettingsProps {
  flexLayoutClass: string;
}

export default function NotificationSettings({ 
  flexLayoutClass
}: NotificationSettingsProps) {
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
      title: t?.settings?.notifications?.updated || "Settings Updated",
      description: t?.settings?.notifications?.savedPreferences || "Your notification preferences have been saved",
    });
  };

  return (
    <>
      {/* General Products */}
      <div className={flexLayoutClass}>
        <div className="flex-1">
          <Label
            htmlFor="general-products"
            className="flex flex-col space-y-1"
          >
            <span>{t?.settings?.notifications?.generalProducts?.title || "New Products"}</span>
            <span className="text-sm text-muted-foreground">
              {t?.settings?.notifications?.generalProducts?.description || "Receive updates on new products in your area"}
            </span>
          </Label>
        </div>
        <RTLAwareSwitch
          id="general-products"
          checked={notificationSettings.generalProducts}
          onCheckedChange={() =>
            handleNotificationChange("generalProducts")
          }
        />
      </div>

      {/* Ads Interested */}
      <div className={flexLayoutClass}>
        <div className="flex-1">
          <Label htmlFor="ads-interested" className="flex flex-col space-y-1">
            <span>{t?.settings?.notifications?.adsInterested?.title || "Ads You're Interested In"}</span>
            <span className="text-sm text-muted-foreground">
              {t?.settings?.notifications?.adsInterested?.description || "Receive notifications about ads you've shown interest in"}
            </span>
          </Label>
        </div>
        <RTLAwareSwitch
          id="ads-interested"
          checked={notificationSettings.adsInterested}
          onCheckedChange={() => handleNotificationChange("adsInterested")}
        />
      </div>

      {/* User Actions */}
      <div className={flexLayoutClass}>
        <div className="flex-1">
          <Label htmlFor="user-actions" className="flex flex-col space-y-1">
            <span>{t?.settings?.notifications?.userActions?.title || "User Actions"}</span>
            <span className="text-sm text-muted-foreground">
              {t?.settings?.notifications?.userActions?.description || "Receive notifications when users interact with your listings"}
            </span>
          </Label>
        </div>
        <RTLAwareSwitch
          id="user-actions"
          checked={notificationSettings.userActions}
          onCheckedChange={() => handleNotificationChange("userActions")}
        />
      </div>

      {/* Account Info */}
      <div className={flexLayoutClass}>
        <div className="flex-1">
          <Label htmlFor="account-info" className="flex flex-col space-y-1">
            <span>{t?.settings?.notifications?.accountInfo?.title || "Account Information"}</span>
            <span className="text-sm text-muted-foreground">
              {t?.settings?.notifications?.accountInfo?.description || "Receive important updates about your account"}
            </span>
          </Label>
        </div>
        <RTLAwareSwitch
          id="account-info"
          checked={notificationSettings.accountInfo}
          onCheckedChange={() => handleNotificationChange("accountInfo")}
        />
      </div>

      {/* Promotions */}
      <div className={flexLayoutClass}>
        <div className="flex-1">
          <Label htmlFor="promotions" className="flex flex-col space-y-1">
            <span>{t?.settings?.notifications?.promotions?.title || "Promotions"}</span>
            <span className="text-sm text-muted-foreground">
              {t?.settings?.notifications?.promotions?.description || "Receive promotional offers and deals"}
            </span>
          </Label>
        </div>
        <RTLAwareSwitch
          id="promotions"
          checked={notificationSettings.promotions}
          onCheckedChange={() => handleNotificationChange("promotions")}
        />
      </div>
    </>
  );
}