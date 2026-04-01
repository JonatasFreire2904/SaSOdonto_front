import { useQuery } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { PaymentResponse } from "@/api/treatmentPlanService";

export const paymentHistoryKeys = (
  clinicId: string,
  patientId: string,
  planId: string,
  itemId: string
) => ["paymentHistory", clinicId, patientId, planId, itemId];

export const usePaymentHistory = (
  clinicId: string,
  patientId: string,
  planId: string,
  itemId: string | null
) => {
  return useQuery<PaymentResponse[]>({
    queryKey: paymentHistoryKeys(clinicId, patientId, planId, itemId ?? ""),
    queryFn: () =>
      treatmentPlanService.listItemPayments(clinicId, patientId, planId, itemId as string),
    enabled: !!clinicId && !!patientId && !!planId && !!itemId,
  });
};
