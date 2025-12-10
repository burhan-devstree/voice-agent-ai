/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: string[] | Record<string, string[]>;
  status_code?: number;
  code?: string;
}

export interface AxiosErrorConfig {
  url?: string;
  method?: string;
  data?: string;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, any>;
}

export interface EnhancedError extends Error {
  status_code?: number;
  messageCode?: string;
  code?: string;
  status?: number;
  response?: {
    data?: ErrorResponse;
    status?: number;
    statusText?: string;
  };
  config?: AxiosErrorConfig;
  request?: any;
}
