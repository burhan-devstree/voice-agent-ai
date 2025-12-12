import useFetchData from "../use-fetch-data";
import API from "@/config/api/api";
import { useAppStore } from "@/store/useAppStore";
import { ChatHistoryItem, ConversationDetail } from "@/types/api";

export const GET_HISTORY = API.getHistory;
export const GET_HISTORY_BY_ID = API.getHistoryById;

export const useChatHistory = (params: { skip: number; limit: number }) => {
  const token = useAppStore((state) => state.token);
  return useFetchData<ChatHistoryItem[]>({
    url: GET_HISTORY,
    params: params,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    enabled: !!token,
  });
};

export const useChatHistoryById = (conversation_id: string | null) => {
  const token = useAppStore((state) => state.token);
  return useFetchData<ConversationDetail>({
    url: GET_HISTORY_BY_ID + `${conversation_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    enabled: !!token && !!conversation_id,
  });
};
