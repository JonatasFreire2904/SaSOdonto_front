import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/infrastructure/http/paymentService";
import type { RegisterPaymentRequest } from "@/domain/types";
import { planItemsKeys } from "@/hooks/queries/usePlanItems";
import { paymentHistoryKeys } from "@/hooks/queries/usePaymentHistory";

interface UsePaymentsContext {
  clinicId: string;
  patientId: string;
  planId: string;
}

export const usePayments = ({ clinicId, patientId, planId }: UsePaymentsContext) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: RegisterPaymentRequest }) =>
      paymentService.register(clinicId, patientId, planId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: planItemsKeys(clinicId, patientId, planId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentHistoryKeys(clinicId, patientId, planId, variables.itemId),
      });
    },
  });

  return {
    registerPayment: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
