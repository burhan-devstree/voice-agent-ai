/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";

interface DeleteDataOptions<TData> {
  url: string;
  refetchQueries?: string[];
  mutationOptions?: UseMutationOptions<TData, Error, void>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

const useDeleteData = <TData = unknown>({
  url,
  refetchQueries = [],
  mutationOptions,
  onError,
  onSuccess,
}: DeleteDataOptions<TData>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, void>({
    mutationFn: async (id: any): Promise<TData> => {
      const response = await instance.delete({ url: url + `/${id}` });

      if (
        response?.status_code === 200 ||
        response?.status_code === 202 ||
        response?.status_code === 201
      ) {
        toast.success("Data deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
        return response.data as TData;
      }

      const errorMessage = response?.message || "Failed to delete data";
      if (response?.status_code === 400) {
        throw Object.assign(new Error(errorMessage), { status_code: 400 });
      }
      if (response?.status_code === 401) {
        throw Object.assign(new Error("Unauthorized"), { status_code: 401 });
      }

      throw new Error(errorMessage);
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

export default useDeleteData;
