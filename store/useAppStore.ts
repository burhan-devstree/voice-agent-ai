/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getItem, removeItem, setItem } from "@/utils/storage";
import { create } from "zustand";

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
  user: any; // Keep as any since we don't have user type definition yet
  isAuthenticated: boolean;

  // UI State
  view: "email" | "otp" | "dashboard";
  emailInput: string;
  logs: Log[];

  // Actions
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  setViewState: (view: "email" | "otp" | "dashboard") => void;
  setEmailInput: (email: string) => void;
  logout: () => void;
  addLog: (message: string, type?: LogType) => void;
}

const Token_Storage_Key = "voice_agent_token";

export const useAppStore = create<AppState>((set) => ({
  token: getItem(Token_Storage_Key),
  user: null,
  isAuthenticated: !!getItem(Token_Storage_Key),
  view: getItem(Token_Storage_Key) ? "dashboard" : "email",
  emailInput: "",
  logs: [],

  setToken: (token) => {
    setItem(Token_Storage_Key, token);
    set({ token, isAuthenticated: true, view: "dashboard" });
  },

  setUser: (user) => set({ user }),

  setViewState: (view) => set({ view }),

  setEmailInput: (email) => set({ emailInput: email }),

  logout: () => {
    removeItem(Token_Storage_Key);
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
}));
