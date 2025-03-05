'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: Country) => void;
  defaultCountry?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  dir?: "ltr" | "rtl";
}

export interface PhoneInputRef {
  getFormattedNumber: () => string | undefined;
  isValid: () => boolean;
}

const PhoneInput = React.forwardRef<PhoneInputRef, PhoneInputProps>(
  (
    {
      value,
      onChange,
      onCountryChange,
      defaultCountry = "AE",
      placeholder = "Enter your phone number",
      error,
      disabled = false,
      className = "",
      id = "phone",
      dir = "ltr",
    },
    ref
  ) => {
    const isRTL = dir === "rtl";
    const [selectedCountry, setSelectedCountry] = useState<Country>({
      code: defaultCountry,
      name: "United Arab Emirates",
      dialCode: "971",
    });

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

    // Initialize selected country on component mount
    useEffect(() => {
      const country = countries.find((c) => c.code === defaultCountry);
      if (country) {
        setSelectedCountry(country);
        if (onCountryChange) onCountryChange(country);
      }
    }, [countries, defaultCountry, onCountryChange]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = e.target.value.replace(/[^\d]/g, "");
      onChange(cleanValue);
    };

    const handleCountryChange = (code: string) => {
      const country = countries.find((c) => c.code === code);
      if (country) {
        setSelectedCountry(country);
        if (onCountryChange) onCountryChange(country);
      }
    };

    // Expose methods through ref
    React.useImperativeHandle(ref, () => ({
      getFormattedNumber: () => {
        const fullNumber = `+${selectedCountry.dialCode}${value}`;
        const parsedNumber = parsePhoneNumberFromString(fullNumber);
        return parsedNumber?.formatInternational();
      },
      isValid: () => {
        const fullNumber = `+${selectedCountry.dialCode}${value}`;
        const parsedNumber = parsePhoneNumberFromString(fullNumber);
        return !!parsedNumber?.isValid();
      },
    }));

    // Define classes based on direction
    const selectTriggerClass = isRTL
      ? "w-[100px] rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
      : "w-[100px] rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10";
    
    const inputClass = isRTL
      ? `flex-1 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 ${
          error ? "border-red-500" : ""
        }`
      : `flex-1 rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 ${
          error ? "border-red-500" : ""
        }`;

    return (
      <div className={`flex ${className}`} dir={dir}>
        <Select
          defaultValue={selectedCountry.code}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue>
              <div className="flex items-center">
                <Image
                  src={`https://flag.vercel.app/m/${selectedCountry.code}.svg`}
                  alt={selectedCountry.name}
                  width={24}
                  height={16}
                  onError={(e) => {
                    e.currentTarget.src = "/images/flags/default.svg";
                  }}
                />
                <span className="ms-1">+{selectedCountry.dialCode}</span>
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
          id={id}
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          disabled={disabled}
          className={inputClass}
          placeholder={placeholder}
          dir="ltr" // Always keep phone numbers in LTR
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;