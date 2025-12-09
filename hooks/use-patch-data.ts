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

interface UsePatchDataProps<TData, TVariables> {
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

const usePatchData = <TData = unknown, TVariables = unknown>({
  url,
  mutationOptions,
  headers = {},
  refetchQueries,
  onSuccess = () => {},
  onError = () => {},
}: UsePatchDataProps<TData, TVariables>) => {
  const queryClient = useQueryClient();

  type MutationInput = { id: string | undefined; data: TVariables };

  return useMutation<TData, Error, MutationInput>({
    mutationFn: async ({ id, data }) => {
      const Finalurl = id ? `${url}/${id}` : url;
      const response: any = await instance.patch<ApiResponse<TData>>({
        url: Finalurl,
        data,
        headers,
      });

      if (response?.status_code === 200 || response?.status_code === 201) {
        toast.success(response?.message, {
          duration: 3000,
          position: "top-right",
        });
        return response.data;
      }

      if (response?.status_code === 400) {
        throw Object.assign(new Error(response?.message || "Bad Request"), {
          status_code: 400,
        });
      }

      throw new Error(response?.message || "Failed to patch data");
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

export default usePatchData;
