import { Token_Storage_Key } from "@/utils/constants";
import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LogType = "info" | "success" | "error" | "agent" | "user";

export interface Log {
  id: string;
  timestamp: string;
  message: string;
  type: LogType;
}

interface AppState {
  // Auth State
  token: string | null;
  isAuthenticated: boolean;

  // UI State
  view: "email" | "otp" | "dashboard";
  emailInput: string;
  logs: Log[];

  // Actions
  setToken: (token: string) => void;
  setViewState: (view: "email" | "otp" | "dashboard") => void;
  setEmailInput: (email: string) => void;
  logout: () => void;
  addLog: (message: string, type?: LogType) => void;
  clearLogs: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: Cookies.get(Token_Storage_Key) || null,
      isAuthenticated: !!Cookies.get(Token_Storage_Key),
      view: Cookies.get(Token_Storage_Key) ? "dashboard" : "email",
      emailInput: "",
      logs: [],

      setToken: (token) => {
        Cookies.set(Token_Storage_Key, token, { expires: 7 });
        set({ token, isAuthenticated: true, view: "dashboard" });
      },

      setViewState: (view) => set({ view }),

      setEmailInput: (email) => set({ emailInput: email }),

      logout: () => {
        Cookies.remove(Token_Storage_Key);
        set({
          token: null,
          isAuthenticated: false,
          view: "email",
          logs: [],
        });
      },

      addLog: (message, type = "info") => {
        const newLog: Log = {
          id: window.crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          message,
          type,
        };
        set((state) => ({ logs: [...state.logs, newLog] }));
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "voice-agent-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        emailInput: state.emailInput,
      }),
    }
  )
);
