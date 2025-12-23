/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import React from "react";

import { useSendOtp, useVerifyOtp } from "@/hooks/api";
import { ArrowLeft, ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import Image from "next/image";
import { IMAGES } from "@/utils/Images";
import Link from "next/link";
import TopHeader from "./TopHeader";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-4 overflow-hidden bg-slate-950">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full animate-pulse delay-700" />

      {/* Top Left Logo */}
      <TopHeader />

      <div className="relative z-10 w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

const CommanLogo = () => {
  return (
    <div className="mx-auto w-20 h-20 bg-linear-to-tr from-primary to-primary/60 p-0.5 rounded-3xl shadow-2xl shadow-primary/20 rotate-6 hover:rotate-0 transition-all duration-500 overflow-hidden group">
      <Link
        href="https://www.devstree.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full bg-slate-900 rounded-[calc(1.5rem-2px)] flex items-center justify-center transition-colors group-hover:bg-slate-800"
      >
        <Image
          src={IMAGES.DevstreeDLogo}
          alt="Devstree Logo"
          width={100}
          height={100}
          className="w-12 h-12 ml-1"
        />
      </Link>
    </div>
  );
};

export const EmailForm = () => {
  const { emailInput, setEmailInput } = useAppStore();
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/otp");
  };

  const handleError = (err: Error) => {
    console.log("🚀 ~ handleError ~ err:", err);
  };

  const {
    mutate: sendOtpMutation,
    isPending: isSendingOtp,
    isError: isSendError,
    error: sendError,
  } = useSendOtp(handleSuccess, handleError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      return;
    }
    sendOtpMutation({ data: { email: emailInput }, id: undefined });
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl shadow-primary/5 ring-1 ring-white/5">
        <CardHeader className="space-y-4 pb-8">
          <CommanLogo />
          <div className="text-center space-y-2">
            <CardTitle className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Welcome
            </CardTitle>
            <CardDescription className="text-slate-400 text-base max-w-[280px] mx-auto leading-relaxed">
              Enter your email to access the premium voice gateway experience
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                Security Access
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <Input
                  placeholder="name@company.com"
                  className="pl-12 h-14 mt-2 bg-slate-950/60 border-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-2xl text-lg"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {isSendError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-sm text-destructive text-center animate-in fade-in slide-in-from-top-2">
                {(sendError as Error).message}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-10 px-8">
            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all duration-300 rounded-2xl font-bold text-lg group border-none"
              isLoading={isSendingOtp}
              disabled={!emailInput}
            >
              Verify Email identity
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
};

export const OtpForm = () => {
  const { emailInput, setToken } = useAppStore();
  const [otp, setOtp] = React.useState("");
  const router = useRouter();

  const onSuccessVerify = (data: any) => {
    setToken(data?.access_token);
    router.push("/dashboard");
  };

  const onErrorVerify = (err: Error) => {
    console.error(err);
  };

  const {
    mutate: verifyOtpMutation,
    isPending: isVerifying,
    isError: isVerifyError,
  } = useVerifyOtp(onSuccessVerify, onErrorVerify);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    verifyOtpMutation({ data: { email: emailInput, otp }, id: undefined });
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl shadow-primary/5 ring-1 ring-white/5">
        <CardHeader className="space-y-4 pb-8">
          <CommanLogo />
          <div className="text-center space-y-2">
            <CardTitle className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Verify OTP
            </CardTitle>
            <CardDescription className="text-slate-400 text-base leading-relaxed">
              We&apos;ve sent a 6-digit code to <br />
              <span className="text-primary font-semibold">{emailInput}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-center block">
                Verification Protocol
              </label>
              <div className="relative">
                <Input
                  placeholder="000000"
                  className="text-center text-4xl tracking-[0.8em] font-mono h-20 bg-slate-950/60 border-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-2xl"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </div>
            </div>
            {isVerifyError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-sm text-foreground text-center animate-in fade-in slide-in-from-top-2">
                The code you entered is invalid.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-5 pb-10 px-8">
            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all duration-300 rounded-2xl font-bold text-lg border-none"
              isLoading={isVerifying}
              disabled={otp.length < 6}
            >
              Confirm & Access <Check className="ml-3 w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl border border-transparent hover:border-white/10"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-3 w-4 h-4" /> Edit Email Address
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
};
