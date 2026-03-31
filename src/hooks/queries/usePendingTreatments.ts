import { useQuery } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { PendingTreatmentItem } from "@/api/treatmentPlanService";

export const pendingTreatmentsKeys = (clinicId: string, patientId: string) => [
  "pendingTreatments",
  clinicId,
  patientId,
];

/**
 * Hook para buscar tratamentos pendentes de um paciente
 * Retorna apenas itens com status Planned ou InProgress
 */
export const usePendingTreatments = (clinicId: string, patientId: string) => {
  return useQuery<PendingTreatmentItem[]>({
    queryKey: pendingTreatmentsKeys(clinicId, patientId),
    queryFn: () => treatmentPlanService.listPendingTreatments(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};
