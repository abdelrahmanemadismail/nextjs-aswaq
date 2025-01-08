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
import { signUpWithEmailPassword } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthCard from "@/components/auth/AuthCard";

const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(64, "Full name cannot exceed 64 characters"),
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

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignupFormData, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateField = (field: keyof SignupFormData, value: string) => {
    try {
      const fieldSchema = signupSchema.shape[field];
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
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field, value);
      }
    };

  const handleBlur = (field: keyof SignupFormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, error) => {
          if (error.path[0]) {
            acc[error.path[0] as keyof SignupFormData] = error.message;
          }
          return acc;
        }, {} as Record<keyof SignupFormData, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUpWithEmailPassword(formData);
      const { error } = JSON.parse(response);

      if (error) {
        toast({
          title: "Registration error",
          description: "Could not create account. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Check your email for a verification link",
        });
        router.push("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Create your ASWAQ account">
      <GoogleButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 py-3 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          variant="link"
          className="px-1 font-semibold"
          onClick={() => router.push("/auth/login")}
        >
          Sign in
        </Button>
      </div>
    </AuthCard>
  );
};

export default SignupForm;
