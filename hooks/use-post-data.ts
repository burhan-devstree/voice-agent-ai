/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";

interface ApiResponse<T = unknown> {
  status_code: number;
  message: string;
  data: T;
  error?: boolean;
}

interface UsePostDataProps<TData, TVariables> {
  url: string;
  mutationOptions?: UseMutationOptions<
    TData,
    Error,
    { id: string | undefined; data: TVariables }
  >;
  headers?: Record<string, string>;
  refetchQueries?: string[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

const usePostData = <TData = unknown, TVariables = unknown>({
  url,
  mutationOptions,
  headers = {},
  refetchQueries,
  onSuccess = () => {},
  onError = () => {},
}: UsePostDataProps<TData, TVariables>) => {
  const queryClient = useQueryClient();

  type MutationInput = { id: string | undefined; data: TVariables };

  return useMutation<TData, Error, MutationInput>({
    mutationFn: async ({ id, data }) => {
      const Finalurl = id ? `${url}/${id}` : url;
      const response: any = await instance.post<ApiResponse<TData>>({
        url: Finalurl,
        data,
        headers,
      });

      // Handle different response formats
      const isSuccess =
        response?.status_code === 200 ||
        response?.status_code === 201 ||
        response?.status_code === 202 ||
        response?.status === 200 ||
        response?.status === "success" ||
        response?.success === true;

      // Also consider direct data return as success if it's an object/array and not an error structure
      // But for now, let's rely on standard fields. If user Modified instance.ts to return res, res.data might be the response.
      // If the backend returns just { access_token: "..." }, none of the above matches.
      // However, usually API returns some status or we assume success if no mismatch.
      // Given the user commented out checks in instance.ts, we should be permissive.

      if (isSuccess || (response && !response.error && !response.status_code)) {
        if (response?.message) {
          toast.success(response.message, {
            duration: 3000,
            position: "top-right",
          });
        }
        return response.data ?? response;
      }

      if (response?.status_code === 400) {
        throw Object.assign(new Error(response?.message || "Bad Request"), {
          status_code: 400,
        });
      }

      throw new Error(response?.message || "Failed to post data");
    },

    onSuccess: (data) => {
      refetchQueries?.forEach((queryKey) => {
        queryClient.refetchQueries({ queryKey: [queryKey] });
      });
      onSuccess(data);
    },

    onError: (error: Error) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });
      onError(error);
    },

    ...mutationOptions,
  });
};

export default usePostData;
