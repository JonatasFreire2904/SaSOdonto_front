import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planItemService } from "@/infrastructure/http/planItemService";
import type { CreatePlanItemRequest } from "@/domain/types";
import { planItemsKeys } from "@/hooks/queries/usePlanItems";

interface UseCreatePlanItemContext {
  clinicId: string;
  patientId: string;
  planId: string;
}

export const useCreatePlanItem = ({
  clinicId,
  patientId,
  planId,
}: UseCreatePlanItemContext) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePlanItemRequest) =>
      planItemService.create(clinicId, patientId, planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: planItemsKeys(clinicId, patientId, planId),
      });
    },
  });

  return {
    createItem: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
