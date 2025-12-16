"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { user, logout } = useAppStore();
  const { status } = useVoiceSession();
  const router = useRouter();
  const isActive = status === "connected" || status === "speaking";
  const isConnecting = status === "connecting";

  const handleLogout = () => {
    logout();
    router.push("/login"); // Force navigation so middleware checks (or just simple route change)
  };

  return (
    <div className="shrink-0 h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 relative z-10 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50" />
        <div className="h-8 w-8 bg-primary/20 rounded-full border border-primary/30 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Authenticated As
          </p>
          <p className="text-sm font-medium text-foreground truncate max-w-[150px] lg:max-w-xs">
            {user?.email || "User"}
          </p>
        </div>
      </div>

      {/* Status Center Badge */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300",
            isActive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]"
              : isConnecting
              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              : "bg-muted/50 text-muted-foreground border-border"
          )}
        >
          <div className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isActive
                  ? "bg-emerald-400"
                  : isConnecting
                  ? "bg-yellow-400"
                  : "hidden"
              )}
            ></span>
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isActive
                  ? "bg-emerald-500"
                  : isConnecting
                  ? "bg-yellow-500"
                  : "bg-muted-foreground"
              )}
            ></span>
          </div>
          <span className="uppercase tracking-wider">
            {status === "idle" && "Ready"}
            {status === "connecting" && "Connecting"}
            {status === "connected" && "Listening"}
            {status === "speaking" && "Speaking"}
            {status === "error" && "Error"}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Sign Out"
        className="hover:bg-red-500/10 hover:text-red-400 text-muted-foreground"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};
