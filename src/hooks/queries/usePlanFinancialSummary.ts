import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/infrastructure/http/paymentService";
import type { TreatmentPlanFinancialSummary } from "@/domain/types";

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
    queryFn: () => paymentService.getFinancialSummary(clinicId, patientId, planId),
    enabled: !!clinicId && !!patientId && !!planId,
  });
};
