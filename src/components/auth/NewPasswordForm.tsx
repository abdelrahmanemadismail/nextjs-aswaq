'use client'
import React, { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updatePassword } from '@/actions/auth-actions';
import AuthCard from '@/components/auth/AuthCard';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

const basePasswordSchema = z.string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password cannot exceed 64 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol")
  .refine((password) => !password.includes(" "), {
    message: "Password cannot contain spaces",
  });

const passwordSchema = z.object({
  password: basePasswordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

function NewPasswordForm() {
  const { t, getLocalizedPath } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PasswordFormData, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateField = (field: keyof PasswordFormData, value: string) => {
    try {
      if (field === 'password') {
        basePasswordSchema.parse(value);
      } else {
        passwordSchema.parse(formData);
      }
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.errors.find(error => 
          error.path[0] === field || 
          (field === 'confirmPassword' && error.path.length === 0)
        );
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [field]: fieldError.message
          }));
        }
      }
    }
  };

  const handleChange = (field: keyof PasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
    if (field === 'password' && touched.confirmPassword && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleBlur = (field: keyof PasswordFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    try {
      passwordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, error) => {
          const field = error.path[0] as keyof PasswordFormData || 'confirmPassword';
          acc[field] = error.message;
          return acc;
        }, {} as Record<keyof PasswordFormData, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await updatePassword({ password: formData.password });
      const { error } = JSON.parse(response);

      if (error) {
        console.log(error);
        toast({
          title: t.common.error,
          description: t.auth.passwordUpdateError,
          variant: "destructive",
        });
      } else {
        console.log(response);
        toast({
          title: t.common.success,
          description: t.auth.passwordUpdateSuccess,
        });
        router.push(getLocalizedPath('/auth/login'));
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

  if (!mounted) {
    return null;
  }

  return (
    <AuthCard title={t.auth.setNewPassword}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.newPassword}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            autoComplete="new-password"
            placeholder={t.auth.enterNewPassword}
            required
            disabled={isLoading}
            className={errors.password ? "border-red-500 h-10" : "h-10"}
            aria-invalid={!!errors.password}
          />
          {touched.password && errors.password && (
            <Alert variant="destructive" className="py-2 border-none">
              <AlertDescription>{errors.password}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            autoComplete="new-password"
            placeholder={t.auth.confirmNewPassword}
            required
            disabled={isLoading}
            className={errors.confirmPassword ? "border-red-500 h-10" : "h-10"}
            aria-invalid={!!errors.confirmPassword}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <Alert variant="destructive" className="py-2 border-none">
              <AlertDescription>{errors.confirmPassword}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.updatingPassword}
            </>
          ) : (
            t.auth.updatePassword
          )}
        </Button>
      </form>
    </AuthCard>
  );
}

export default NewPasswordForm;