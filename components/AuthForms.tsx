/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

import { useAppStore } from "../store/useAppStore";
import { useSendOtp, useVerifyOtp } from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ArrowRight,
  Check,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export const EmailForm = () => {
  const { emailInput, setEmailInput, setViewState, addLog } = useAppStore();

  const {
    mutate: sendOtpMutation,
    isPending: isSendingOtp,
    isError: isSendError,
    error: sendError,
  } = useSendOtp();

  const handleSuccess = () => {
    addLog(`OTP sent to ${emailInput}`, "success");
    setViewState("otp");
  };

  const handleError = (err: Error) => {
    addLog(err.message, "error");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      addLog("Invalid email address", "error");
      return;
    }
    sendOtpMutation(
      { data: { email: emailInput }, id: undefined },
      { onSuccess: handleSuccess, onError: handleError }
    );
  };

  return (
    <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Enter your email to access the voice gateway
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="name@company.com"
                className="pl-9 bg-slate-950/50 border-slate-800 focus-visible:ring-blue-500"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          {isSendError && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 text-center">
              {(sendError as Error).message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
            isLoading={isSendingOtp}
            disabled={!emailInput}
          >
            Send Verification Code <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export const OtpForm = () => {
  const { emailInput, setToken, setViewState, addLog } = useAppStore();
  const [otp, setOtp] = React.useState("");
  const onSuccessVerify = (data: any) => {
    addLog("Authentication successful", "success");
    setToken(data?.access_token);
    setViewState("dashboard");
  };

  const onErrorVerify = (err: Error) => {
    addLog(err.message, "error");
  };

  const {
    mutate: verifyOtpMutation,
    isPending: isVerifying,
    isError: isVerifyError,
  } = useVerifyOtp(onSuccessVerify, onErrorVerify);

  const handleVerifySuccess = (data: any) => {
    addLog("Authentication successful", "success");
    setToken(data.access_token);
    setViewState("dashboard");
  };

  const handleVerifyError = (err: Error) => {
    addLog(err.message, "error");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    verifyOtpMutation({ data: { email: emailInput, otp }, id: undefined });
  };

  return (
    <Card className="w-full max-w-md animate-in slide-in-from-right-8 duration-500 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-500">
          <KeyRound className="w-6 h-6" />
        </div>
        <CardTitle>Verify Identity</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{" "}
          <span className="text-slate-200 font-medium">{emailInput}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              One-Time Password
            </label>
            <Input
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
          {isVerifyError && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 text-center">
              Invalid verification code. Please try again.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            type="submit"
            variant="emerald"
            className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
            isLoading={isVerifying}
            disabled={otp.length < 6}
          >
            Verify & Login <Check className="ml-2 w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-300"
            onClick={() => setViewState("email")}
          >
            <ArrowLeft className="mr-2 w-3 h-3" /> Change Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
