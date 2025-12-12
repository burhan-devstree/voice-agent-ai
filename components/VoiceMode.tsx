"use client";
import {
  Activity,
  LogOut,
  Mic,
  PhoneOff,
  Radio,
  Signal,
  User,
} from "lucide-react";
import { useVoiceSession } from "../hooks/useVoiceSession";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { ConsoleLog } from "./ConsoleLog";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const VoiceMode = () => {
  const { user, logout } = useAppStore();
  const { status, connect, disconnect } = useVoiceSession();

  const isActive = status === "connected" || status === "speaking";
  const isSpeaking = status === "speaking";
  const isConnecting = status === "connecting";

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl shadow-black/50 relative">
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Sign Out"
            className="hover:bg-red-500/10 hover:text-red-400 text-slate-500"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <CardHeader className="pb-2 relative overflow-hidden">
          {/* Status Indicator Background Effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-10 transition-colors duration-700 pointer-events-none",
              isActive ? "bg-indigo-500" : "bg-transparent"
            )}
          />

          <div className="flex justify-center mb-6 relative z-10">
            <div
              className={cn(
                "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500",
                isActive
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)]"
                  : "bg-slate-800 shadow-inner border border-slate-700"
              )}
            >
              {/* Animated Rings */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-full border border-indigo-300/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                </>
              )}

              {isSpeaking ? (
                <div className="relative">
                  <Activity className="w-12 h-12 text-white animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                </div>
              ) : (
                <Mic
                  className={cn(
                    "w-12 h-12 transition-colors duration-300",
                    isActive ? "text-white" : "text-slate-500"
                  )}
                />
              )}
            </div>
          </div>

          <CardTitle className="text-xl tracking-tight text-center">
            {isActive ? "Live Session Active" : "Voice Gateway"}
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-1">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                )}
              />
              {isActive ? "Secure Connection Established" : "Disconnected"}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* User Info Badge */}
          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex items-center gap-3 shadow-inner">
            <div className="h-9 w-9 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Authenticated As
              </p>
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.email || "..."}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-3">
            {!isActive ? (
              <Button
                size="lg"
                onClick={connect}
                disabled={isConnecting}
                className={cn(
                  "w-full h-14 text-base font-semibold shadow-lg transition-all",
                  "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 border border-indigo-500/20"
                )}
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <Signal className="w-5 h-5 animate-pulse" /> Establishing
                    Link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Radio className="w-5 h-5" /> Start Conversation
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                onClick={disconnect}
                className="w-full h-14 text-base font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 shadow-none"
              >
                <PhoneOff className="mr-2 w-5 h-5" /> End Session
              </Button>
            )}
          </div>

          <ConsoleLog />
        </CardContent>
      </Card>
    </div>
  );
};
