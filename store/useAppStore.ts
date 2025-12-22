import { Token_Storage_Key } from "@/utils/constants";
import { UserProfile } from "@/types/api";
import Cookies from "js-cookie";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  user: UserProfile | null;
  isAuthenticated: boolean;

  // UI State
  view: "email" | "otp" | "dashboard";
  emailInput: string;
  logs: Log[];

  // Actions
  setToken: (token: string) => void;
  setUser: (user: UserProfile | null) => void;
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
      user: null,
      isAuthenticated: !!Cookies.get(Token_Storage_Key),
      view: Cookies.get(Token_Storage_Key) ? "dashboard" : "email",
      emailInput: "",
      logs: [],

      setToken: (token) => {
        Cookies.set(Token_Storage_Key, token, { expires: 7 });
        set({ token, isAuthenticated: true, view: "dashboard" });
      },

      setUser: (user) => set({ user }),

      setViewState: (view) => set({ view }),

      setEmailInput: (email) => set({ emailInput: email }),

      logout: () => {
        Cookies.remove(Token_Storage_Key);
        set({
          token: null,
          user: null,
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
      // Only persist specific parts of the state if needed,
      // but here we persist everything except maybe logs if they are too large.
      // partialize: (state) => ({
      //   token: state.token,
      //   user: state.user,
      //   isAuthenticated: state.isAuthenticated,
      //   emailInput: state.emailInput
      // }),
    }
  )
);
