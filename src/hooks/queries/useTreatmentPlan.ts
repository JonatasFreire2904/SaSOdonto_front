import { useQuery } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";

export const treatmentPlanKeys = (clinicId: string, patientId: string) => [
  "treatmentPlan",
  clinicId,
  patientId,
];

export const useTreatmentPlan = (clinicId: string, patientId: string) => {
  return useQuery({
    queryKey: treatmentPlanKeys(clinicId, patientId),
    queryFn: () => treatmentPlanService.list(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
};
