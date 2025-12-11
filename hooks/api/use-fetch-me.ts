import useFetchData from "../use-fetch-data";
import API from "@/config/api/api";
import { UserProfile } from "@/types/api";

export const useFetchMe = (token: string | null) => {
  return useFetchData<UserProfile>({
    url: API.fetchMe,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    enabled: !!token,
  });
};
