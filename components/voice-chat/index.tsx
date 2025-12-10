"use client";

import { useAppStore } from "@/store/useAppStore";
import { useFetchMe } from "@/services/api";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { EmailForm, OtpForm } from "../AuthForms";
import { Dashboard } from "../Dashboard";

export default function VoiceChat() {
  const { view, token, setUser, logout, isAuthenticated } = useAppStore();

  // Next.js-style data fetching effect
  const { data: userProfile, isError, isLoading } = useFetchMe(token!);

  useEffect(() => {
    if (userProfile) setUser(userProfile);
    if (isError) logout();
  }, [userProfile, isError]);

  // Loading state for initial auth check
  if (token && isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
          <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-mono">Authenticating...</p>
      </div>
    );
  }

  // "Routing"
  switch (view) {
    case "otp":
      return <OtpForm />;
    case "dashboard":
      return <Dashboard />;
    case "email":
    default:
      return <EmailForm />;
  }
}
