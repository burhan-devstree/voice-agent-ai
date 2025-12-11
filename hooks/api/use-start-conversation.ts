import useFetchData from "../use-fetch-data";
import API from "@/config/api/api";
import { ConversationAuthResponse } from "@/types/api";

export const useStartConversation = (
  token: string,
  options?: { enabled?: boolean }
) => {
  return useFetchData<ConversationAuthResponse>({
    url: API.startConversation,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    enabled: options?.enabled ?? !!token,
  });
};
