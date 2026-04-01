/**
 * INFRASTRUCTURE — HTTP Client
 * Instância do Axios configurada com interceptors de auth e tratamento de erro.
 */

import axios, { AxiosError } from "axios";
import { extractErrorMessage } from "@/infrastructure/adapters/responseAdapter";
import { authStorage } from "@/infrastructure/storage/authStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5143/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const url = error.config?.url ?? "";
    const isAuthRoute = url.includes("/auth/");

    if (error.response?.status === 401 && !isAuthRoute) {
      authStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?reason=session-expired";
      }
    }

    return Promise.reject({
      ...error,
      message: extractErrorMessage(error, error.message),
    });
  }
);

export default apiClient;
