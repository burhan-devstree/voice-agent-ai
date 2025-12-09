"use client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "../store/useAppStore";
import { sendOtp, verifyOtp } from "../services/api";
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
import { ArrowRight, Check, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

export const EmailView = () => {
  const { emailInput, setEmailInput, setViewState, addLog } = useAppStore();

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      addLog(`OTP sent to ${emailInput}`, "success");
      setViewState("otp");
    },
    onError: (err: Error) => {
      addLog(err.message, "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      addLog("Invalid email address", "error");
      return;
    }
    mutation.mutate(emailInput);
  };

  return (
    <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
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
            <label className="text-xs font-medium text-slate-400 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="name@company.com"
                className="pl-9"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          {mutation.isError && (
            <p className="text-xs text-red-400 mt-2">
              {(mutation.error as Error).message}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            isLoading={mutation.isPending}
            disabled={!emailInput}
          >
            Send Verification Code <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export const OtpView = () => {
  const { emailInput, setToken, setViewState, addLog } = useAppStore();
  const [otp, setOtp] = React.useState("");

  const mutation = useMutation({
    mutationFn: (code: string) => verifyOtp(emailInput, code),
    onSuccess: (data) => {
      console.log("🚀 ~ OtpView ~ data:", data);
      addLog("Authentication successful", "success");
      setToken(data.access_token);
    },
    onError: (err: Error) => {
      addLog(err.message, "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    mutation.mutate(otp);
  };

  return (
    <Card className="w-full max-w-md animate-in slide-in-from-right-8 duration-500">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center mb-4 text-emerald-500">
          <KeyRound className="w-6 h-6" />
        </div>
        <CardTitle>Verify Identity</CardTitle>
        <CardDescription>
          Enter the code sent to{" "}
          <span className="text-slate-200 font-medium">{emailInput}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase">
              One-Time Password
            </label>
            <Input
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
          {mutation.isError && (
            <p className="text-xs text-red-400 text-center">
              Invalid verification code
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            variant="emerald"
            className="w-full"
            isLoading={mutation.isPending}
            disabled={otp.length < 6}
          >
            Verify & Login <Check className="ml-2 w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-slate-500"
            onClick={() => setViewState("email")}
          >
            Change Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
