/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { buildQueryString } from "@/utils/commonFunctions";
import { validateResponse } from "@/utils/api-response-handler";

const useFetchData = <TData = unknown, TParams = Record<string, unknown>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true,
  headers = {},
}: {
  url: string;
  params?: TParams;
  queryOptions?: Omit<
    UseQueryOptions<TData, Error, TData>,
    "queryKey" | "queryFn"
  >;
  enabled?: boolean;
  headers?: Record<string, string>;
}) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async (): Promise<TData> => {
      const queryString = buildQueryString(params as Record<string, unknown>);
      const response: any = await instance.get({
        url: `${url}${queryString}`,
        headers,
      });

      const validation = validateResponse(response);

      if (validation.isSuccess) {
        return validation.data as TData;
      }

      throw new Error(validation.message || "Failed to fetch data");
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled,
    staleTime: 0,
    ...queryOptions,
  });
};

export default useFetchData;
