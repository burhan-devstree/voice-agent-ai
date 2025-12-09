import { create } from 'zustand';
import { UserProfile, LogEntry } from '../types';

interface AppState {
  // Auth State
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  
  // UI State
  view: 'email' | 'otp' | 'dashboard';
  emailInput: string;
  logs: LogEntry[];
  
  // Actions
  setToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  setViewState: (view: 'email' | 'otp' | 'dashboard') => void;
  setEmailInput: (email: string) => void;
  logout: () => void;
  addLog: (message: string, type?: LogEntry['type']) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  token: localStorage.getItem('voice_agent_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('voice_agent_token'),
  view: localStorage.getItem('voice_agent_token') ? 'dashboard' : 'email',
  emailInput: '',
  logs: [],

  setToken: (token) => {
    localStorage.setItem('voice_agent_token', token);
    set({ token, isAuthenticated: true, view: 'dashboard' });
  },

  setUser: (user) => set({ user }),

  setViewState: (view) => set({ view }),

  setEmailInput: (email) => set({ emailInput: email }),

  logout: () => {
    localStorage.removeItem('voice_agent_token');
    set({ token: null, user: null, isAuthenticated: false, view: 'email', logs: [] });
  },

  addLog: (message, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    set((state) => ({ logs: [...state.logs, newLog] }));
  }
}));