"use client";

import React, { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { signUpWithEmailPassword } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthCard from "@/components/auth/AuthCard";
import EmailConfirmation from "@/components/auth/EmailConfirmation";
import { useTranslation } from '@/hooks/use-translation';
import PhoneInput, { PhoneInputRef } from '@/components/PhoneInput';
import { sendGTMEvent } from "@next/third-parties/google";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(64, "Full name cannot exceed 64 characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s\-()]{8,20}$/, "Please enter a valid phone number"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password cannot exceed 64 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol")
    .refine((password) => !password.includes(" "), {
      message: "Password cannot contain spaces",
    }),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const { t, getLocalizedPath, locale } = useTranslation();
  const phoneInputRef = useRef<PhoneInputRef>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignupFormData, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const router = useRouter();

  const validateField = (field: keyof SignupFormData, value: string) => {
    try {
      // For phone number, use the validation from the component
      if (field === 'phoneNumber' && phoneInputRef.current) {
        if (!phoneInputRef.current.isValid()) {
          setErrors((prev) => ({
            ...prev,
            [field]: t.auth.enterValidPhone || "Please enter a valid phone number",
          }));
          return;
        }
      } else {
        const fieldSchema = signupSchema.shape[field];
        fieldSchema.parse(value);
      }
      
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: err.errors[0].message,
        }));
      }
    }
  };

  const handleChange =
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field, value);
      }
    };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
    if (touched.phoneNumber) {
      validateField('phoneNumber', value);
    }
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    // Re-validate phone if it's already been touched
    if (touched.phoneNumber) {
      validateField('phoneNumber', formData.phoneNumber);
    }
  };

  const handleBlur = (field: keyof SignupFormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    // Validate all fields
    let isValid = true;
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
    
    // Validate phone with component validation
    if (phoneInputRef.current && !phoneInputRef.current.isValid()) {
      newErrors.phoneNumber = t.auth.enterValidPhone || "Please enter a valid phone number";
      isValid = false;
    }
    
    // Validate other fields
    try {
      signupSchema.parse({
        ...formData,
        // Skip phone validation in zod since we already validated it
        phoneNumber: newErrors.phoneNumber ? '' : formData.phoneNumber || '+1234567890',
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach(error => {
          if (error.path[0] && error.path[0] !== 'phoneNumber') {
            newErrors[error.path[0] as keyof SignupFormData] = error.message;
            isValid = false;
          }
        });
      }
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phoneNumber: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get the formatted phone number from the component
      const formattedPhone = phoneInputRef.current?.getFormattedNumber() || '';
      
      // Include the phone number in the data sent to the backend
      const response = await signUpWithEmailPassword({
        ...formData,
        phoneNumber: formattedPhone.replace(/\s+/g, ''),
        preferredLanguage: locale
      });
      const { error } = JSON.parse(response);

      if (error) {
        toast({
          title: t.auth.registrationError,
          description: error,
          variant: "destructive",
        });
        console.log(error)
      } else {
        // Instead of redirecting, show the confirmation screen
        sendGTMEvent({ event: 'buttonClicked', value: 'Created Account' })
        setIsSignupComplete(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.common.somethingWentWrong,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push(getLocalizedPath("/auth/login"));
  };

  if (isSignupComplete) {
    return (
      <AuthCard title={t.auth.accountCreated}>
        <EmailConfirmation 
          email={formData.email}
          type='signup'
          onBackToLogin={handleBackToLogin} 
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t.auth.createAswaqAccount}>
      <GoogleButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 py-3 text-muted-foreground">
            {t.auth.orContinueWithEmail}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t.auth.fullName}</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder={t.auth.enterFullName}
            value={formData.fullName}
            onChange={handleChange("fullName")}
            onBlur={handleBlur("fullName")}
            required
            disabled={isLoading}
            className={errors.fullName ? "border-red-500 h-10" : "h-10"}
          />
          {touched.fullName && errors.fullName && (
            <Alert variant="destructive" className="py-2 border-none">
              <AlertDescription>{errors.fullName}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t.auth.enterEmail}
            value={formData.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            required
            disabled={isLoading}
            className={errors.email ? "border-red-500 h-10" : "h-10"}
          />
          {touched.email && errors.email && (
            <Alert variant="destructive" className="py-2 border-none">
              <AlertDescription>{errors.email}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.auth.phone}</Label>
          <PhoneInput
            ref={phoneInputRef}
            id="phone"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            onCountryChange={handleCountryChange}
            defaultCountry="AE"
            placeholder={t.profile.phoneVerification?.enterPhonePlaceholder}
            disabled={isLoading}
            error={errors.phoneNumber}
            selectedCountry={selectedCountry}
          />
          {touched.phoneNumber && errors.phoneNumber && (
            <Alert variant="destructive" className="py-2 border-none">
              <AlertDescription>{errors.phoneNumber}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t.auth.enterPassword}
            value={formData.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
            required
            disabled={isLoading}
            className={errors.password ? "border-red-500 h-10" : "h-10"}
          />
          {touched.password && errors.password && (
            <Alert variant="destructive" className="py-2 border-none">
              <AlertDescription>{errors.password}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.creatingAccount}
            </>
          ) : (
            t.auth.createAccount
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t.auth.haveAccount} </span>
        <Button
          variant="link"
          className="px-1 font-semibold"
          onClick={handleBackToLogin}
        >
          {t.auth.signIn}
        </Button>
      </div>
    </AuthCard>
  );
};

export default SignupForm;