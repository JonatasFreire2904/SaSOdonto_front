/**
 * Tipos centralizados para comunicação com a API
 * Alinhados com o backend refatorado (Clean Architecture)
 */

// ==================== RESPOSTA DE ERRO PADRÃO ====================

export interface ApiError {
  message: string;
}

// ==================== PAGINAÇÃO ====================

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==================== CLÍNICA ====================

export interface ClinicResponse {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  teamCount: number;
  role: string;
  createdAt: string;
}

export interface CreateClinicRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateClinicRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface SelectClinicResponse {
  clinicId: string;
  clinicName: string;
  userRole: string;
}

// ==================== PACIENTE ====================

export type PatientStatus = "Active" | "Inactive" | "Suspended";

export interface PatientResponse {
  id: string;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  status: PatientStatus;
  clinicId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  fullName: string;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

export interface UpdatePatientRequest {
  fullName?: string;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

export interface UpdatePatientStatusRequest {
  status: PatientStatus;
}

// ==================== PROFISSIONAL ====================

export type ProfessionalRole = "Dentista" | "Auxiliar" | "Rh" | "Gestor";

export interface ProfessionalResponse {
  id: string;
  name: string;
  email: string;
  role: ProfessionalRole;
  clinicId: string;
  createdAt: string;
}

export interface CreateProfessionalRequest {
  name: string;
  email: string;
  password: string;
  role: ProfessionalRole;
  clinicId: string;
}

export interface UpdateProfessionalRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface UpdateProfessionalRoleRequest {
  role: ProfessionalRole;
}

// ==================== AUTENTICAÇÃO ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  message: string;
}

// ==================== STATUS MAPS ====================

/**
 * Status possíveis para procedimentos/atendimentos
 */
export type ProcedureStatus = "Scheduled" | "Pending" | "InProgress" | "Completed" | "Cancelled";

/**
 * Mapeamento de status para exibição no frontend
 */
export const STATUS_MAP: Record<string, { label: string; color: string; className: string }> = {
  // Status de Procedimento/Atendimento
  Scheduled: { label: "Agendado", color: "blue", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  Pending: { label: "Pendente", color: "yellow", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  InProgress: { label: "Em Andamento", color: "blue", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  Completed: { label: "Concluído", color: "green", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  Cancelled: { label: "Cancelado", color: "red", className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  
  // Status de Paciente
  Active: { label: "Ativo", color: "green", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  Inactive: { label: "Inativo", color: "gray", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  Suspended: { label: "Suspenso", color: "orange", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

/**
 * Helper para obter informações de status com fallback seguro
 */
export function getStatusInfo(status: string | undefined | null): { label: string; color: string; className: string } {
  if (!status) {
    return { label: "Desconhecido", color: "gray", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
  }
  return STATUS_MAP[status] ?? { 
    label: status, 
    color: "gray", 
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" 
  };
}

// ==================== HELPER PARA ERROS ====================

/**
 * Extrai mensagem de erro padronizada de uma resposta de erro Axios
 */
export function extractErrorMessage(error: unknown, fallback = "Erro desconhecido"): string {
  if (!error || typeof error !== "object") return fallback;
  
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  
  // Tenta extrair do novo formato padronizado
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  
  // Fallback para mensagem de erro do Axios
  if (err.message) {
    return err.message;
  }
  
  return fallback;
}
