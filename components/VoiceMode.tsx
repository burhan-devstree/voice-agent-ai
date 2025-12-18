import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  Mic,
  Radio,
  Signal,
  Terminal,
  User,
} from "lucide-react";
import { useVoiceSession } from "../hooks/useVoiceSession";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";

export const VoiceMode = () => {
  const { logs } = useAppStore();
  const { status, connect, disconnect } = useVoiceSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isActive = status === "connected" || status === "speaking";
  const isConnecting = status === "connecting";

  // Auto scroll to bottom for live transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      {/* Main Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto  space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-0"
      >
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end pb-4">
          {/* Welcome / Placeholder State */}
          {logs.filter((l) => l.type === "agent" || l.type === "user")
            .length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-6 py-20 opacity-50">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="w-24 h-24 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center relative z-10">
                  {isActive ? (
                    <Activity className="w-10 h-10 text-indigo-400 animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10 text-slate-600" />
                  )}
                </div>
              </div>
              <p className="text-slate-400 text-sm max-w-sm text-center">
                {isActive
                  ? "Listening for your voice..."
                  : "Start a conversation to begin"}
              </p>
            </div>
          )}

          {logs.map((log) => {
            const isUser = log.type === "user";
            const isAgent = log.type === "agent";
            const isSystem = !isUser && !isAgent;

            if (isSystem) {
              return (
                <div key={log.id} className="flex justify-center my-2">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1.5 opacity-70",
                      log.type === "error"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : log.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-slate-800/50 border-slate-700 text-slate-500"
                    )}
                  >
                    {log.type === "error" && (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {log.type === "success" && (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {!["error", "success"].includes(log.type) && (
                      <Terminal className="w-3 h-3" />
                    )}
                    {log.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={log.id}
                className={cn(
                  "flex gap-4 group items-end transition-all duration-500 animate-in slide-in-from-bottom-2",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {isAgent && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-sm mt-1">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                )}

                <div
                  className={cn(
                    "flex flex-col max-w-[85%] md:max-w-[75%]",
                    isUser ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 opacity-70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {isUser ? "You" : "AI Assistant"}
                    </span>
                    <span className="text-[10px] text-slate-200 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-900/20"
                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {log.message}
                    </p>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 mt-1">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 p-6  relative z-20">
        <div className="max-w-md mx-auto">
          {!isActive ? (
            <Button
              size="lg"
              onClick={connect}
              disabled={isConnecting}
              className={cn(
                "w-full h-14 text-base font-semibold shadow-xl shadow-indigo-600/20 transition-all active:scale-95",
                "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white border border-indigo-400/20"
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
              className="w-full h-14 text-base font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 shadow-none active:scale-95 transition-all"
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
