/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { buildQueryString } from "@/utils/commanFunctions";

const useFetchData = <TData = unknown, TParams = Record<string, unknown>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true,
}: {
  url: string;
  params?: TParams;
  queryOptions?: Omit<
    UseQueryOptions<TData, Error, TData>,
    "queryKey" | "queryFn"
  >;
  enabled?: boolean;
}) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async (): Promise<TData> => {
      const queryString = buildQueryString(params as Record<string, unknown>);
      const response: any = await instance.get({
        url: `${url}${queryString}`,
      });

      // Handle different response formats
      // Format 1: { status_code: 200, success: true, data: {...} }
      // Format 2: { status: "success", users: [...], count: 12 }
      if (
        response?.status_code === 200 ||
        response?.status_code === 201 ||
        response?.status === 200 ||
        response?.status === "success" ||
        response?.success === true
      ) {
        // If response has a 'data' property, return the data
        // Otherwise return the entire response (for Format 2)
        return (response?.data ?? response) as TData;
      }
      throw new Error(response?.message || "Failed to fetch data");
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled,
    staleTime: 0,
    ...queryOptions,
  });
};

export default useFetchData;
