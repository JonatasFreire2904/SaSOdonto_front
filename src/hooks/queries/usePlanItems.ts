import { useQuery } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { PlanItem } from "@/api/treatmentPlanService";

export const planItemsKeys = (clinicId: string, patientId: string, planId: string) => [
  "planItems",
  clinicId,
  patientId,
  planId,
];

export const usePlanItems = (
  clinicId: string,
  patientId: string,
  planId: string | undefined
) => {
  return useQuery<PlanItem[]>({
    queryKey: planItemsKeys(clinicId, patientId, planId ?? ""),
    queryFn: () => treatmentPlanService.listItems(clinicId, patientId, planId!),
    enabled: !!clinicId && !!patientId && !!planId,
  });
};
