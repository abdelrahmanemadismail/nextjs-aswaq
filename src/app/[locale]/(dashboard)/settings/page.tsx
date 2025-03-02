import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Locale } from "@/i18n.config";
import { Languages } from "@/constants/enums";
import NotificationSettings from "./components/NotificationSettings";
import DeleteAccountButton from "./components/DeleteAccountButton";
import getTrans from "@/utils/translation";
import Link from "next/link";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Settings | Aswaq Online",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  const isRTL = locale === Languages.ARABIC;

  // Function to generate a localized path
  function getLocalizedPath(path: string): string {
    return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // RTL-aware layout classes with improved mobile responsiveness
  const flexLayoutClass = `flex flex-col ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'} items-start sm:items-center justify-between gap-2 sm:gap-4 w-full`;

  // Common button class with responsive adjustments
  const buttonClass = "w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary bg-background shadow-sm hover:bg-accent hover:text-primary h-9 px-4 py-2";

  return (
    <div className="py-4 md:py-8 px-4 md:px-0 space-y-4 md:space-y-8">
      {/* Notification Settings */}
      <Card className="w-full">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">{t.settings?.notifications?.title || "Notification Settings"}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* We'll use a client component for the switches */}
          <NotificationSettings flexLayoutClass={flexLayoutClass} />
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card className="w-full">
        <CardHeader className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg md:text-xl">{t.settings?.email?.title || "Email Address"}</CardTitle>
          <div className="mt-3 sm:mt-0 w-full sm:w-auto">
            <Link 
              className={buttonClass} 
              href={getLocalizedPath("/auth/change-email")}
            >
              {t.settings?.email?.button || "Change Email"}
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Change Password */}
      <Card className="w-full">
        <CardHeader className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg md:text-xl">{t.settings?.password?.title || "Password"}</CardTitle>
          <div className="mt-3 sm:mt-0 w-full sm:w-auto">
            <Link 
              className={buttonClass}
              href={getLocalizedPath("/auth/reset-password")}
            >
              {t.settings?.password?.button || "Change Password"}
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Change Phone Number */}
      <Card className="w-full">
        <CardHeader className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg md:text-xl">{t.settings?.phone?.title || "Phone Number"}</CardTitle>
          <div className="mt-3 sm:mt-0 w-full sm:w-auto">
            <Link 
              className={buttonClass}
              href={getLocalizedPath("/auth/phone-verification")}
            >
              {t.settings?.phone?.button || "Update Phone"}
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Delete Account */}
      <Card className="w-full">
        <CardHeader className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg md:text-xl">{t.settings?.deleteAccount?.title || "Delete Account"}</CardTitle>
          <div className="mt-3 sm:mt-0 w-full sm:w-auto">
            <DeleteAccountButton />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}