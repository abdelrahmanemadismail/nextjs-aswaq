// components/auth/SignupConfirmation.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendEmailConfirmation } from "@/actions/auth-actions";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/use-translation';

interface EmailConfirmationProps {
  email: string;
  type: 'signup' | 'email_change';
  onBackToLogin: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ 
  email,
  type,
  onBackToLogin 
}) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !isResendActive) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsResendActive(true);
    }
    return () => clearInterval(timer);
  }, [countdown, isResendActive]);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      // Resend verification email
      const response = await resendEmailConfirmation({
        email:email,
        type: type,
      });
      
      const { error } = JSON.parse(response);
      
      if (error) {
        toast({
          title: t.common.error,
          description: error.message || t.common.somethingWentWrong,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.auth.accountCreated,
          description: t.auth.verificationEmailSent,
        });
        setIsResendActive(false);
        setCountdown(60);
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

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="font-semibold text-lg">
            {t.auth.accountCreated}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.auth.verificationEmailSent}
          </p>
          <p className="text-sm font-medium">
            {maskEmail(email)}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <Button 
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onBackToLogin}
        >
          {t.auth.login}
        </Button>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t.auth.didntReceiveEmail}
          </p>
          <Button
            variant="link"
            className="text-sm"
            onClick={handleResend}
            disabled={!isResendActive || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isResendActive 
              ? t.auth.resendVerificationEmail 
              : t.auth.resendInSeconds.replace('{seconds}', countdown.toString())}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;