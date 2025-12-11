/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  status_code: number;
  error: boolean;
  message?: string;
  data: T;
  success?: boolean;
  status: number | string;
}

// ============================================
// Authentication Types
// ============================================

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  token_type?: string;
}

// ============================================
// User Types
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow additional fields
}

// ============================================
// Conversation Types
// ============================================

export interface ConversationAuthResponse {
  signed_url: string;
  agent_id: string;
}

// ============================================
// Hook Callback Types
// ============================================

export type OnSuccessCallback<T> = (data: T) => void;
export type OnErrorCallback = (error: Error) => void;
