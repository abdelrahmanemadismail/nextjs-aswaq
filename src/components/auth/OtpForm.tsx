"use client"
import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { phoneLogin, verifyPhone } from "@/actions/auth-actions";

interface OtpFormProps {
    phone: string;
    onVerificationComplete: () => void;
  }
export const OtpVerificationForm: React.FC<OtpFormProps> = ({
    phone,
    onVerificationComplete,
  }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState<boolean>(false);
    const [countdown, setCountdown] = useState(60);
    const [isResendActive, setIsResendActive] = useState(false);
    const inputRefs = [
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
    ];
  
    const maskPhoneNumber = (phone: string) => {
      if (phone.length < 4) return "";
      const last4 = phone.slice(-4);
      const maskedPart = "*".repeat(phone.length - 5);
      return "+" + maskedPart + last4;
    };
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
  
    const handleChange = (index: number, value: string) => {
      // Get only the last character if multiple characters are entered
      const lastChar = value.slice(-1);
      
      // Only allow single numbers
      if (!/^\d$/.test(lastChar) && value !== '') return;
  
      const newOtp = [...otp];
      newOtp[index] = lastChar;
      setOtp(newOtp);
  
      // Move to next input if a number is entered
      if (lastChar && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    };
    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      // Move to previous input on backspace if current input is empty
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    };
  
    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const pastedNumbers = pastedData.replace(/[^\d]/g, '').split('').slice(0, 6);
      
      const newOtp = [...otp];
      pastedNumbers.forEach((num, index) => {
        if (index < 6) newOtp[index] = num;
      });
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(val => !val);
      if (nextEmptyIndex !== -1) {
        inputRefs[nextEmptyIndex].current?.focus();
      } else if (inputRefs[5].current) {
        inputRefs[5].current.focus();
      }
    };
  
    const handleResend = async () => {
      setLoading(true);
      try {
        console.log(phone);
        const response = await phoneLogin({ phone: phone });
        const { error } = JSON.parse(response);
        
        if (error) {
          toast({
            title: 'Error resending OTP',
            description: 'Please try again',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'OTP sent',
            description: 'Please check your phone for the new code',
          });
          setIsResendActive(false);
          setCountdown(60);
          // Reset OTP input fields
          setOtp(['', '', '', '', '', '']);
          // Focus on first input
          inputRefs[0].current?.focus();
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const otpString = otp.join('');
        // Use the phone number from context
        console.log(phone);
        console.log(otpString);
        const response = await verifyPhone({
          phone: phone,
          token: otpString
        });
        
        const {data, error} = JSON.parse(response);
        console.log(data);
        if (!error) {
          toast({
            title: 'OTP verification successful',
            description: 'You are now logged in',
          });
          onVerificationComplete();
        } else {
          console.log(error);
          toast({
            title: 'OTP verification failed',
            description: 'Please try again1',
            variant: 'destructive',
          });
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({
          title: 'OTP verification failed',
          description: 'Please try again2',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
  
  
    return (
      <div className="space-y-6">
        <div className="space-y-2">
      <p className="text-sm text-muted-foreground text-center">
      Enter the code we sent over SMS{phone ? ` to ${maskPhoneNumber(phone)}` : ''}
    </p>
    </div>
    <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={inputRefs[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl"
                disabled={loading}
              />
            ))}
          </div>
  
          <Button 
            type="submit" 
            size="lg"
            className="w-full"
            disabled={loading || otp.some(digit => !digit)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
  
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive a code?
            </p>
            <Button
              variant="link"
              className="text-sm"
              onClick={handleResend}
              disabled={!isResendActive || loading}
            >
              {isResendActive ? 'Send again' : `Resend code in ${countdown}s`}
            </Button>
          </div>
        </form>
      </div>
    );
  };