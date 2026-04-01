import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planItemService } from "@/infrastructure/http/planItemService";
import { planItemsKeys } from "@/hooks/queries/usePlanItems";

interface UseCancelPlanItemContext {
  clinicId: string;
  patientId: string;
  planId: string;
}

export const useCancelPlanItem = ({
  clinicId,
  patientId,
  planId,
}: UseCancelPlanItemContext) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (itemId: string) =>
      planItemService.cancel(clinicId, patientId, planId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: planItemsKeys(clinicId, patientId, planId),
      });
    },
  });

  return {
    cancelItem: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
