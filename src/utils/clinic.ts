/**
 * @deprecated Importe de @/infrastructure/storage/clinicStorage
 * Mantido para compatibilidade durante a migração
 */
import { clinicStorage } from "@/infrastructure/storage/clinicStorage";

export const getClinicId = (): string => clinicStorage.getClinicId();
