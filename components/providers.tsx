"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

import { VoiceSessionProvider } from "@/hooks/useVoiceSession";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <VoiceSessionProvider>{children}</VoiceSessionProvider>
    </QueryClientProvider>
  );
}
