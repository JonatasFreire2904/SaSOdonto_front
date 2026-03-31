import axios, { AxiosError } from "axios";
import { extractErrorMessage, type ApiError } from "@/api.types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5143/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: injeta token em toda request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redireciona para login se receber 401 (exceto rotas de auth)
// e padroniza extração de mensagens de erro
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const url = error.config?.url || "";
    const isAuthRoute = url.includes("/auth/");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Enriquece o erro com mensagem extraída no formato padronizado
    const enrichedError = {
      ...error,
      message: extractErrorMessage(error, error.message),
    };

    return Promise.reject(enrichedError);
  }
);

export default api;
