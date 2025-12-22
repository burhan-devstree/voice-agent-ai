import { Activity, Mic, Radio, Signal } from "lucide-react";
import { useVoiceSession } from "../hooks/useVoiceSession";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { SineWave } from "./SineWave";

export const VoiceMode = () => {
  const { status, isUserSpeaking, connect, disconnect } = useVoiceSession();

  const isActive = status === "connected" || status === "speaking";
  const isConnecting = status === "connecting";

  // Determine which speaking animation to show
  const isAISpeaking = status === "speaking";
  const isAnySpeaking = isAISpeaking || isUserSpeaking;

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      {/* Sphere Animation Area */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full animate-pulse delay-700" />
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full perspective-[1000px] px-4">
        {/* Ambient Background Glow */}
        {(isActive || isConnecting) && (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b opacity-50 pointer-events-none transition-colors duration-700",
              isConnecting
                ? "from-amber-500/10 via-amber-500/5 to-transparent"
                : "from-indigo-500/5 via-transparent to-transparent"
            )}
          />
        )}

        {/* Sine Wave Animation - Centralized and limited width */}
        {(isActive || isConnecting) && (
          <div className="w-full max-w-4xl h-40 relative z-0 mb-8 pointer-events-none">
            <SineWave
              isSpeaking={isAnySpeaking}
              type={isConnecting ? "connecting" : isAISpeaking ? "ai" : "user"}
            />
          </div>
        )}

        {/* Current Animation (Orb/Rings) - Hidden when active except during connection */}
        {!isActive && !isConnecting && (
          <div
            className="relative group cursor-pointer"
            onClick={isActive ? undefined : connect}
          >
            {/* Main Sphere Container */}
            <div
              className={cn(
                "relative w-48 h-48 rounded-full transition-all duration-700 ease-out flex items-center justify-center"
              )}
            >
              <div className="absolute inset-0 rounded-full blur-md transition-colors duration-500 bg-slate-800/40" />

              {/* The Actual "3D" Orb */}
              <div className="relative w-40 h-40 rounded-full shadow-2xl transition-all duration-700 overflow-hidden backdrop-blur-sm border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(71,85,105,0.6),rgba(30,41,59,1),rgba(15,23,42,1))] shadow-black/50">
                {/* Surface Shine/Gloss */}
                <div className="absolute top-4 left-6 w-16 h-10 bg-white/10 rounded-full blur-xl rotate-[-45deg] pointer-events-none" />
                <div className="absolute bottom-4 right-6 w-20 h-20 bg-black/20 rounded-full blur-xl pointer-events-none" />
              </div>
            </div>

            {/* Icon Overlay for Idle/Connecting */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <Mic className="w-12 h-12 text-slate-400 group-hover:text-white transition-colors" />
              </div>
            )}
          </div>
        )}

        {/* Status Text Label */}
        <div className="mt-8 text-center space-y-2 h-10 transition-all duration-300">
          <p
            className={cn(
              "text-lg font-medium tracking-wide transition-colors duration-300",
              status === "speaking"
                ? "text-indigo-300"
                : isUserSpeaking
                ? "text-emerald-400"
                : status === "connected"
                ? "text-indigo-200/70"
                : status === "connecting"
                ? "text-primary/50"
                : "text-slate-500"
            )}
          >
            {status === "speaking" && "AI Speaking..."}
            {isUserSpeaking && "You are Speaking..."}
            {status === "connected" && !isUserSpeaking && "Listening..."}
            {status === "connecting" && "Connecting..."}
            {status === "idle" && "Tap to Start"}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 p-6 relative z-20 w-full flex justify-center pb-12">
        <div className="max-w-xs w-full">
          {!isActive ? (
            <Button
              size="lg"
              onClick={connect}
              disabled={isConnecting}
              className={cn(
                "w-full h-14 !cursor-pointer text-base font-semibold shadow-xl shadow-primary/30 transition-all active:scale-95",
                "bg-gradient-to-r to-primary/45 from-primary  hover:from-primary/90  text-primary-foreground"
              )}
            >
              {isConnecting ? (
                <span className="flex items-center gap-3">
                  <Signal className="w-5 h-5 animate-pulse" /> Establishing
                  Secure Link...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Radio className="w-5 h-5" /> Start Live Conversation
                </span>
              )}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="lg"
              onClick={disconnect}
              className="w-full h-14 !cursor-pointer text-base font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 shadow-none active:scale-95 transition-all"
            >
              <div className="flex items-center justify-center w-full gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span>End Live Session</span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
