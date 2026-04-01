import { useQuery } from "@tanstack/react-query";
import { planItemService } from "@/infrastructure/http/planItemService";
import type { PlanItem } from "@/domain/types";

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
    queryFn: () => planItemService.list(clinicId, patientId, planId!),
    enabled: !!clinicId && !!patientId && !!planId,
  });
};
