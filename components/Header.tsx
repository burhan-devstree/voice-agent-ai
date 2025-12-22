"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { IMAGES } from "@/utils/Images";
import Link from "next/link";

export const Header = () => {
  const { user, logout } = useAppStore();
  console.log("🚀 ~ Header ~ user:", user);
  const { status } = useVoiceSession();
  const router = useRouter();
  const isActive = status === "connected" || status === "speaking";
  const isConnecting = status === "connecting";
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
      <div className="shrink-0 h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 relative z-10">
        {/* Left Side: Brand */}
        <div className="flex items-center gap-4">
          <div className="bg-white/95  px-2 py-1 rounded-xl shadow-lg border border-white/20 transition-all hover:scale-105 duration-300">
            <Link
              href={"https://www.devstree.com/"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              <Image
                src={IMAGES.FullLogoBlack}
                alt="Devstree Full Logo"
                width={80}
                height={32}
                unoptimized
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Status Center Badge (Absolute Centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div
            className={cn(
              "flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 shadow-sm",
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10"
                : isConnecting
                ? "bg-primary/15 text-primary border-primary/30 shadow-primary/10"
                : "bg-slate-900/50 text-slate-400 border-slate-800"
            )}
          >
            <div className="relative flex h-2 w-2">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isActive
                    ? "bg-emerald-400"
                    : isConnecting
                    ? "bg-primary"
                    : "hidden"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isActive
                    ? "bg-emerald-500"
                    : isConnecting
                    ? "bg-primary"
                    : "bg-slate-600"
                )}
              />
            </div>
            <span className="uppercase tracking-widest">
              {status === "idle" && "System Ready"}
              {status === "connecting" && "Initializing..."}
              {status === "connected" && "Listening..."}
              {status === "speaking" && "AI Speaking"}
              {status === "error" && "Error Detected"}
            </span>
          </div>
        </div>

        {/* Right Side: User Profile, Actions & Sidebar Trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">
                Authorized
              </span>
              <span className="text-xs font-medium text-foreground/90 truncate max-w-[140px]">
                {user?.email || "User Account"}
              </span>
            </div>
            <div className="h-9 w-9 bg-primary/15 rounded-xl border border-primary/20 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden">
              <Image
                src={IMAGES.DevstreeDLogo}
                alt="Profile"
                width={24}
                height={24}
                className="w-5 h-5 transition-transform group-hover:scale-110"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLogoutDialogOpen(true)}
              title="Sign Out"
              className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <SidebarTrigger className="w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all" />
          </div>
        </div>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle>Confirm Sign Out</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to sign out? Your current session will be
              ended.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button variant="default" onClick={handleLogout} className="">
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
