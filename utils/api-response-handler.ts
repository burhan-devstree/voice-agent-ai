/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Centralized API response handler
 * Handles different response formats and validates success status
 */

export interface ResponseValidation {
  isSuccess: boolean;
  data: any;
  message?: string;
}

/**
 * Validates if an API response indicates success
 * Handles multiple response formats:
 * - Format 1: { status_code: 200, success: true, data: {...} }
 * - Format 2: { status: "success", data: {...} }
 * - Format 3: Direct object { id: "...", ... }
 */
export const validateResponse = (response: any): ResponseValidation => {
  if (!response) {
    return {
      isSuccess: false,
      data: null,
      message: "No response received",
    };
  }

  // Check for explicit success indicators
  const isSuccess =
    response?.error === false ||
    response?.status_code === 200 ||
    response?.status_code === 201 ||
    response?.status_code === 202 ||
    response?.status === 200 ||
    response?.status === "success" ||
    response?.success === true;

  if (isSuccess) {
    return {
      isSuccess: true,
      data: response?.data ?? response,
      message: response?.message,
    };
  }

  // Allow plain objects that don't look like errors
  if (
    response &&
    typeof response === "object" &&
    !response.error &&
    !response.status_code
  ) {
    return {
      isSuccess: true,
      data: response,
    };
  }

  return {
    isSuccess: false,
    data: null,
    message: response?.message || "Request failed",
  };
};

/**
 * Checks if a status code indicates success
 */
export const isSuccessStatusCode = (statusCode: number): boolean => {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Extracts data from API response
 * Returns response.data if available, otherwise returns the response itself
 */
export const extractResponseData = <T>(response: any): T => {
  return (response?.data ?? response) as T;
};
