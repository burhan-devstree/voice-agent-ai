import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";
import { validateResponse } from "@/utils/api-response-handler";

interface PutDataOptions<TData, TVariables> {
  url: string;
  refetchQueries?: string[];
  headers?: Record<string, string>;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

const usePutData = <TData = unknown, TVariables = unknown>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions,
  onSuccess,
  onError,
}: PutDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await instance.put({ url, data: variables, headers });

      const validation = validateResponse(response);

      if (validation.isSuccess) {
        if (validation.message) {
          toast.success(validation.message, {
            position: "top-right",
          });
        }
        return validation.data as TData;
      }

      const errorMessage = validation.message || "Failed to update data";
      const error = new Error(errorMessage);

      if (response?.status_code === 400) {
        throw Object.assign(error, { status_code: 400 });
      }
      if (response?.status_code === 401) {
        throw Object.assign(error, {
          status_code: 401,
          message: "Unauthorized",
        });
      }

      throw error;
    },
    onSuccess: (data: TData) => {
      refetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      );

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error & { status_code?: number }) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });

      if (onError) {
        onError(error);
      }
    },
    ...mutationOptions,
  });
};

export default usePutData;
