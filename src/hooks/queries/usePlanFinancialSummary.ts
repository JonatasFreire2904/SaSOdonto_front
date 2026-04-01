import { useQuery } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { TreatmentPlanFinancialSummary } from "@/api/treatmentPlanService";

export const planFinancialSummaryKeys = (
  clinicId: string,
  patientId: string,
  planId: string
) => ["planFinancialSummary", clinicId, patientId, planId];

export const usePlanFinancialSummary = (
  clinicId: string,
  patientId: string,
  planId: string
) => {
  return useQuery<TreatmentPlanFinancialSummary>({
    queryKey: planFinancialSummaryKeys(clinicId, patientId, planId),
    queryFn: () => treatmentPlanService.getFinancialSummary(clinicId, patientId, planId),
    enabled: !!clinicId && !!patientId && !!planId,
  });
};
