"use client";
import React, { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import { Terminal } from "lucide-react";

export const ConsoleLog = () => {
  const logs = useAppStore((s) => s.logs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mt-8 rounded-xl bg-black/40 border border-slate-800 overflow-hidden flex flex-col h-48">
      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal className="w-3 h-3 text-slate-500" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          System Activity
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs"
      >
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Ready to initialize...</div>
        )}
        {logs.map((log: { id: string; timestamp: string; message: string; type: string }) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span
              className={cn(
                "break-words",
                log.type === "error" && "text-red-400",
                log.type === "success" && "text-emerald-400",
                log.type === "agent" && "text-indigo-300",
                log.type === "user" && "text-slate-300",
                log.type === "info" && "text-slate-400"
              )}
            >
              {log.type === "agent" && (
                <span className="text-indigo-500 font-bold mr-1">AI:</span>
              )}
              {log.type === "user" && (
                <span className="text-slate-500 font-bold mr-1">You:</span>
              )}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
