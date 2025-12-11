/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";
import { validateResponse } from "@/utils/api-response-handler";
import { ApiResponse } from "@/types/api";

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
      const finalUrl = id ? `${url}/${id}` : url;
      const response: any = await instance.post<ApiResponse<TData>>({
        url: finalUrl,
        data,
        headers,
      });

      const validation = validateResponse(response);

      if (validation.isSuccess) {
        if (validation.message) {
          toast.success(validation.message, {
            duration: 3000,
            position: "top-right",
          });
        }
        return validation.data as TData;
      }

      if (response?.status_code === 400) {
        throw Object.assign(new Error(validation.message || "Bad Request"), {
          status_code: 400,
        });
      }

      throw new Error(validation.message || "Failed to post data");
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
