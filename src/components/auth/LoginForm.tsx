"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { signInWithPassword } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
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

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { t, getLocalizedPath } = useTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginFormData, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      const fieldSchema = loginSchema.shape[field];
      fieldSchema.parse(value);
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
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field, value);
      }
    };

  const handleBlur = (field: keyof LoginFormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, error) => {
          if (error.path[0]) {
            acc[error.path[0] as keyof LoginFormData] = error.message;
          }
          return acc;
        }, {} as Record<keyof LoginFormData, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signInWithPassword(formData);
      const { error } = JSON.parse(response);
      console.log(error);

      if (error) {
        toast({
          title: t.auth.authError,
          description: t.auth.wrongCredentials,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.auth.signInSuccess,
          description: t.auth.signInSuccessDescription,
        });
        router.push(getLocalizedPath("/"));
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

  return (
    <AuthCard title={t.auth.continueToAswaq}>
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

        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Link
              href={getLocalizedPath("/auth/reset-password/request")}
              className="text-primary underline-offset-4 hover:underline text-sm"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
              {t.auth.signingIn}
            </>
          ) : (
            t.auth.signIn
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t.auth.noAccount}{" "}
        </span>
        <Button
          variant="link"
          className="px-1 font-semibold"
          onClick={() => router.push(getLocalizedPath("/auth/signup"))}
        >
          {t.auth.signup}
        </Button>
      </div>
    </AuthCard>
  );
};

export default LoginForm;