/**
 * INFRASTRUCTURE — Response Adapter
 * Normaliza diferentes formatos de resposta do backend para um formato único.
 * Concentra a adaptação em um único lugar, eliminando if/else espalhados nos services.
 */

import type { PagedResponse } from "@/domain/types";

/**
 * Extrai lista de uma resposta que pode vir em 3 formatos diferentes:
 * - Array direto: [item1, item2]
 * - Objeto com 'items': { items: [...], totalCount, ... }
 * - Objeto com 'data': { data: [...], totalCount, ... }
 *
 * TODO (Backend): padronizar para sempre retornar { items: [...], ... }
 */
export function extractList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

/**
 * Normaliza resposta paginada para o formato interno PagedResponse<T>
 */
export function normalizePaged<T>(
  raw: unknown,
  page: number,
  pageSize: number
): PagedResponse<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw as T[],
      totalCount: (raw as T[]).length,
      page,
      pageSize,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    if (obj.items) {
      return {
        items: (obj.items as T[]) ?? [],
        totalCount: (obj.totalCount as number) ?? 0,
        page: (obj.page as number) ?? page,
        pageSize: (obj.pageSize as number) ?? pageSize,
        totalPages: (obj.totalPages as number) ?? 1,
        hasNextPage: (obj.hasNextPage as boolean) ?? false,
        hasPreviousPage: (obj.hasPreviousPage as boolean) ?? false,
      };
    }

    if (obj.data) {
      const data = obj.data as T[];
      return {
        items: data,
        totalCount: (obj.totalCount as number) ?? data.length,
        page: (obj.page as number) ?? page,
        pageSize: (obj.pageSize as number) ?? pageSize,
        totalPages: (obj.totalPages as number) ?? 1,
        hasNextPage: (obj.hasNextPage as boolean) ?? false,
        hasPreviousPage: (obj.hasPreviousPage as boolean) ?? false,
      };
    }
  }

  return {
    items: [],
    totalCount: 0,
    page,
    pageSize,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

/**
 * Extrai payload de resposta que pode vir envolto em { data: payload } ou direto
 */
export function extractPayload<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

/**
 * Extrai mensagem de erro padronizada
 */
export function extractErrorMessage(error: unknown, fallback = "Erro desconhecido"): string {
  if (!error || typeof error !== "object") return fallback;
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
}
