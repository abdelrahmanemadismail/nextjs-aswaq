"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { addPhoneToUser, phoneLogin } from "@/actions/auth-actions";
import { OtpVerificationForm } from "@/components/auth/OtpForm";
import AuthCard from "@/components/auth/AuthCard";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const PhoneVerification: React.FC = () => {
  const [phone, setPhone] = useState<string>("");
  const [formattedPhone, setFormattedPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
  });
  const router = useRouter();

  const countries: Country[] = React.useMemo(() => {
    const countryCodes = getCountries() || [];
    return countryCodes.map((country) => ({
      code: country,
      name:
        new Intl.DisplayNames(["en"], { type: "region" }).of(country) ||
        country,
      dialCode: getCountryCallingCode(country),
    }));
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullNumber = `+${selectedCountry.dialCode}${phone}`;
    const parsedNumber = parsePhoneNumberFromString(fullNumber);

    if (!parsedNumber?.isValid()) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const formattedNumber = parsedNumber.formatInternational();
      setFormattedPhone(formattedNumber);
      console.log(formattedPhone);
      const response = await addPhoneToUser({ phone: formattedNumber });
      const { error } = JSON.parse(response);

      if (error) {
        toast({
          title: "Error",
          description: "Could not update phone number",
          variant: "destructive",
        });
      } else {
        const phoneLoginResponse = await phoneLogin({ phone: formattedNumber });
        const { error: loginError } = JSON.parse(phoneLoginResponse);

        if (loginError) {
          //   console.error('OTP error:', loginError);
          toast({
            title: "Error",
            description: "Could not send verification code",
            variant: "destructive",
          });
        } else {
          setShowOtpForm(true);
          toast({
            title: "Code sent",
            description: "Check your WhatsApp for the verification code",
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //   console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setPhone(value);
  };

  const handleVerificationComplete = () => {
    toast({
      title: "Verified successfully!",
      description: "Phone number verified successfully!",
    });
    // Get the redirectedFrom parameter from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";

    // Redirect to the original destination or dashboard
    setTimeout(() => {
      router.push(redirectTo);
    }, 500);
  };
  return (
    <AuthCard
      title={
        !showOtpForm
          ? "Enter your phone number to receive a verification code"
          : "Enter the verification code sent to your phone"
      }
    >
      {!showOtpForm ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone number
            </Label>
            <div className="flex">
              <Select
                defaultValue={selectedCountry.code}
                onValueChange={(value) => {
                  const country = countries.find((c) => c.code === value);
                  if (country) setSelectedCountry(country);
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10">
                  <SelectValue>
                    <div className="flex">
                      <Image
                        src={`https://flag.vercel.app/m/${selectedCountry.code}.svg`}
                        alt={selectedCountry.name}
                        width={24}
                        height={16}
                        onError={(e) => {
                          e.currentTarget.src = "/images/flags/default.svg";
                        }}
                      />
                      +{selectedCountry.dialCode}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[300px] p-0">
                  {countries.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={`https://flag.vercel.app/m/${country.code}.svg`}
                          alt={country.name}
                          width={24}
                          height={16}
                          onError={(e) => {
                            e.currentTarget.src = "/images/flags/default.svg";
                          }}
                        />
                        <span>{country.name}</span>
                        <span className="ml-auto text-gray-500">
                          +{country.dialCode}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading}
                className="flex-1 rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Sending code...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      ) : (
        <OtpVerificationForm
          phone={formattedPhone}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </AuthCard>
  );
};

export default PhoneVerification;
