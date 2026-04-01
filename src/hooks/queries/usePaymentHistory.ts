import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/infrastructure/http/paymentService";
import type { PaymentRecord } from "@/domain/types";

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
  return useQuery<PaymentRecord[]>({
    queryKey: paymentHistoryKeys(clinicId, patientId, planId, itemId ?? ""),
    queryFn: () =>
      paymentService.listByItem(clinicId, patientId, planId, itemId as string),
    enabled: !!clinicId && !!patientId && !!planId && !!itemId,
  });
};
