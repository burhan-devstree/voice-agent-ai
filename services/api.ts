/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";

export const API = {
  sendOtp: "/auth/send-otp",
  verifyOtp: "/auth/verify-otp",
  fetchMe: "/user/me",
  startConversation: "/conversation/get-pre-signed-url",
};

export const useSendOtp = (onSucess: any, onError: any) => {
  return usePostData({
    url: API.sendOtp,
    onSuccess: onSucess,
    onError: onError,
  });
};

export const useVerifyOtp = (onSucess: any, onError: any) => {
  return usePostData({
    url: API.verifyOtp,
    onSuccess: onSucess,
    onError: onError,
  });
};

export const useFetchMe = (token: string | null) => {
  return useFetchData({
    url: API.fetchMe,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    enabled: !!token,
  });
};

export const useStartConversationAuth = (
  token: string,
  options?: { enabled?: boolean }
) => {
  return useFetchData({
    url: API.startConversation,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    enabled: options?.enabled ?? !!token,
  });
};
