/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getItem, removeItem, setItem } from "@/utils/storage";
import { create } from "zustand";

interface AppState {
  // Auth State
  token: string | null;
  user: any;
  isAuthenticated: boolean;

  // UI State
  view: "email" | "otp" | "dashboard";
  emailInput: string;
  logs: any;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  setViewState: (view: "email" | "otp" | "dashboard") => void;
  setEmailInput: (email: string) => void;
  logout: () => void;
  addLog: (message: string, type?: any) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  token: getItem("voice_agent_token"),
  user: null,
  isAuthenticated: !!getItem("voice_agent_token"),
  view: getItem("voice_agent_token") ? "dashboard" : "email",
  emailInput: "",
  logs: [],

  setToken: (token) => {
    setItem("voice_agent_token", token);
    set({ token, isAuthenticated: true, view: "dashboard" });
  },

  setUser: (user) => set({ user }),

  setViewState: (view) => set({ view }),

  setEmailInput: (email) => set({ emailInput: email }),

  logout: () => {
    removeItem("voice_agent_token");
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      view: "email",
      logs: [],
    });
  },

  addLog: (message, type = "info") => {
    const newLog: any = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    set((state) => ({ logs: [...state.logs, newLog] }));
  },
}));
