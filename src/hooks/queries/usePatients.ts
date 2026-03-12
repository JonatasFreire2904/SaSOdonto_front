import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/api/patientService";

export const patientKeys = {
  all: (clinicId: string) => ["patients", clinicId] as const,
  detail: (clinicId: string, patientId: string) => ["patients", clinicId, patientId] as const,
};

export const usePatients = (clinicId: string, search?: string) => {
  return useQuery({
    queryKey: [...patientKeys.all(clinicId), search],
    queryFn: () => patientService.list(clinicId, search),
    enabled: !!clinicId,
  });
};

export const usePatientDetail = (clinicId: string, patientId: string) => {
  return useQuery({
    queryKey: patientKeys.detail(clinicId, patientId),
    queryFn: () => patientService.getById(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
};
