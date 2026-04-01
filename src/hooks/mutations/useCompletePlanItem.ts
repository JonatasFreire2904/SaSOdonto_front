import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planItemService } from "@/infrastructure/http/planItemService";
import { planItemsKeys } from "@/hooks/queries/usePlanItems";
import type { CompletePlanItemRequest } from "@/domain/types";

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
      planItemService.complete(clinicId, patientId, planId, itemId, data),
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
