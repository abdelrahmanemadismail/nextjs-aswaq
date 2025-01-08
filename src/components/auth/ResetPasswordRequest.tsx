'use client'
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPasswordForEmail } from '@/actions/auth-actions';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import { toast } from '@/hooks/use-toast';

const resetSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
});

type ResetFormData = z.infer<typeof resetSchema>;

const ResetPasswordRequest: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ResetFormData>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ResetFormData, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: keyof ResetFormData, value: string) => {
    try {
      const fieldSchema = resetSchema.shape[field];
      fieldSchema.parse(value);
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: err.errors[0].message
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    if (touched.email) {
      validateField('email', value);
    }
  };

  const handleBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    validateField('email', formData.email);
  };

  const validateForm = () => {
    try {
      resetSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, error) => {
          if (error.path[0]) {
            acc[error.path[0] as keyof ResetFormData] = error.message;
          }
          return acc;
        }, {} as Record<keyof ResetFormData, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordForEmail(formData);
      const { error } = JSON.parse(response);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send reset instructions. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset instructions have been sent to your email.",
        });
        router.push('/auth/login');
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
    <AuthCard title="Reset your password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            placeholder="Enter your email"
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

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <div className="text-center text-sm py-4">
          <span className="text-muted-foreground">Remember your password? </span>
          <Link
            href="/auth/login"
            className="text-primary underline-offset-4 hover:underline text-sm"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordRequest;