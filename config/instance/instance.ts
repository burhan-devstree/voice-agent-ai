/* eslint-disable import/no-anonymous-default-export */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

// Define a general API response structure
interface ApiResponse<T> {
  status_code: number;
  error: boolean;
  message?: string;
  data: T;
  success?: boolean;
  status: number;
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  <T>(res: AxiosResponse<ApiResponse<T>>) => {
    if (!res.data) throw new Error("Error in response");
    return res;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

class Instance {
  get<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: "GET" });
  }

  post<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: "POST" });
  }

  put<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: "PUT" });
  }

  patch<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: "PATCH" });
  }

  delete<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({ ...config, method: "DELETE" });
  }

  request<T>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<T>(config).then((res) => res.data);
  }
}

export default new Instance();
