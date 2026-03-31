import { AxiosError } from "axios";
import { extractErrorMessage } from "@/api.types";

/**
 * Interface para mapear códigos de status HTTP para mensagens amigáveis
 */
export interface ErrorMessageMap {
  400?: string;
  401?: string;
  403?: string;
  404?: string;
  409?: string;
  500?: string;
  default?: string;
}

/**
 * Hook helper para extrair mensagem de erro de mutação
 * Prioriza mensagem do backend (novo formato) e faz fallback para mapeamento customizado
 */
export function getApiError(
  error: Error | null | undefined,
  messageMap: ErrorMessageMap = {}
): string | null {
  if (!error) return null;

  const axiosError = error as AxiosError<{ message?: string }>;
  const status = axiosError.response?.status;
  const backendMessage = axiosError.response?.data?.message;

  // Prioriza mensagem do backend se disponível
  if (backendMessage) {
    return backendMessage;
  }

  // Fallback para mapeamento customizado por status
  if (status && messageMap[status as keyof ErrorMessageMap]) {
    return messageMap[status as keyof ErrorMessageMap]!;
  }

  // Mensagem padrão genérica
  return messageMap.default ?? extractErrorMessage(error, "Erro inesperado. Tente novamente.");
}
