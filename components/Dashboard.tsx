"use client";
import { useEffect, useState } from "react";
import { ChatArea } from "./ChatArea";
import { Sidebar } from "./Sidebar";
import { VoiceMode } from "./VoiceMode";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "./ui/button";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatHistory } from "@/hooks/api/use-history";

export const Dashboard = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  const { data: historyData, isLoading: historyLoading } = useChatHistory({
    skip: 0,
    limit: 10,
  });
  console.log("🚀 ~ Dashboard ~ historyData:", historyData);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      {!isDesktop && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        selectedId={selectedChatId}
        onSelect={(id) => {
          setSelectedChatId(id);
          if (!isDesktop) setIsSidebarOpen(false);
        }}
        onNewChat={() => {
          setSelectedChatId(null);
          if (!isDesktop) setIsSidebarOpen(false);
        }}
        className="z-50"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={!isDesktop}
      />

      <main className="flex-1 flex flex-col relative h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-slate-950 transition-all duration-300">
        {/* Toggle Button */}
        <div
          className={cn(
            "absolute top-4 left-4 z-30",
            isSidebarOpen && isDesktop && "hidden"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 backdrop-blur border border-slate-700/50 shadow-lg"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        </div>

        {selectedChatId ? (
          <ChatArea conversationId={selectedChatId} />
        ) : (
          <div className="flex items-center justify-center h-full w-full p-4 relative">
            <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-[position:bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />
            <VoiceMode />
          </div>
        )}
      </main>
    </div>
  );
};
