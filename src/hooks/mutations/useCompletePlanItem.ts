import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import { planItemsKeys } from "@/hooks/queries/usePlanItems";
import type { CompletePlanItemRequest } from "@/api/treatmentPlanService";

interface UseCompletePlanItemContext {
  clinicId: string;
  patientId: string;
  planId: string;
}

export const useCompletePlanItem = ({
  clinicId,
  patientId,
  planId,
}: UseCompletePlanItemContext) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: CompletePlanItemRequest }) =>
      treatmentPlanService.completeItem(clinicId, patientId, planId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: planItemsKeys(clinicId, patientId, planId),
      });
    },
  });

  return {
    completeItem: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
