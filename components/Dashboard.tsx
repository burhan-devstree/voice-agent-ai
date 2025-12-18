"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { ChatArea } from "./ChatArea";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { VoiceMode } from "./VoiceMode";

export const Dashboard = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans relative">
        <SidebarInset className="bg-transparent">
          <Header />
          <main className="flex-1 flex flex-col relative h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background transition-all duration-300 overflow-hidden">
            {selectedChatId ? (
              <ChatArea conversationId={selectedChatId} />
            ) : (
              <div className="flex items-center justify-center h-full w-full relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[position:bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />
                <VoiceMode />
              </div>
            )}
          </main>
        </SidebarInset>
        <Sidebar
          side="right"
          variant="floating"
          collapsible="offcanvas"
          overlay
          selectedId={selectedChatId}
          onConversationSelect={(id) => setSelectedChatId(id)}
          onNewChat={() => setSelectedChatId(null)}
          className="top-16 bottom-2 right-2 h-auto"
        />
      </div>
    </SidebarProvider>
  );
};
