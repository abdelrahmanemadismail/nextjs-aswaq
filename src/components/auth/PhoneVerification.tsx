"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { updateUserPhoneNumber } from "@/actions/profile-actions";
import AuthCard from "@/components/auth/AuthCard";
import { useProfile } from "@/context/ProfileContext";
import { useTranslation } from "@/hooks/use-translation";
import PhoneInput, { PhoneInputRef } from "@/components/PhoneInput";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const PhoneVerification: React.FC = () => {
  const { t, getLocalizedPath } = useTranslation();
  const [phone, setPhone] = useState<string>("");
  const { refreshProfile } = useProfile();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
  });
  const phoneInputRef = useRef<PhoneInputRef>(null);
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneInputRef.current?.isValid()) {
      toast({
        title: t.profile.phoneVerification?.invalidPhone || "Invalid phone number",
        description: t.profile.phoneVerification?.enterValidPhone || "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const formattedNumber = phoneInputRef.current.getFormattedNumber();
      
      // Update the phone number in the profiles table
      await updateUserPhoneNumber(formattedNumber || '');
      
      // Refresh the profile to get the updated phone number
      await refreshProfile();
      
      toast({
        title: t.profile.phoneVerification?.phoneUpdated || "Phone Updated",
        description: t.profile.phoneVerification?.phoneUpdateSuccess || "Your phone number has been updated successfully",
      });

      // Get the redirectedFrom parameter from the URL
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirectedFrom") || getLocalizedPath("/profile");

      // Redirect to the original destination or dashboard
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.common.somethingWentWrong,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
  };

  return (
    <AuthCard title={t.profile.phoneVerification?.updatePhoneNumber || "Update Phone Number"}>
      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700"
          >
            {t.profile.phoneVerification?.phoneNumber || "Phone Number"}
          </Label>
          <PhoneInput
            ref={phoneInputRef}
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            onCountryChange={handleCountryChange}
            defaultCountry="AE"
            selectedCountry={selectedCountry}
            placeholder={t.profile.phoneVerification?.enterPhonePlaceholder || "Enter your phone number"}
            disabled={loading}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {t.profile.phoneVerification?.updating || "Updating..."}
            </>
          ) : (
            t.profile.phoneVerification?.updateButton || "Update Phone Number"
          )}
        </Button>
      </form>
    </AuthCard>
  );
};

export default PhoneVerification;