/**
 * @deprecated Importe de @/infrastructure/http/patientService
 * Mantido para compatibilidade durante a migração
 */
export { patientService } from "@/infrastructure/http/patientService";
export type {
  Patient,
  PatientStatus,
  CreatePatientRequest,
  UpdatePatientRequest,
  ListPatientsParams,
  PagedResponse,
} from "@/domain/types";
