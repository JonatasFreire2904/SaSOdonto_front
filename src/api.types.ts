/**
 * @deprecated Importe de @/domain/types e @/domain/constants
 * Mantido para compatibilidade durante a migração
 */
export type {
  ApiError,
  PagedResponse,
  PatientStatus,
  ProfessionalRole,
  Patient as PatientResponse,
  Professional as ProfessionalResponse,
} from "@/domain/types";

export { getStatusInfo } from "@/domain/constants";

export { extractErrorMessage } from "@/infrastructure/adapters/responseAdapter";
