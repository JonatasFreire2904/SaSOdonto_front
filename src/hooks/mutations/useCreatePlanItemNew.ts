import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { CreatePlanItemRequest } from "@/api/treatmentPlanService";
import { planItemsKeys } from "@/hooks/queries/usePlanItems";

interface UseCreatePlanItemNewContext {
  clinicId: string;
  patientId: string;
  planId: string;
}

export const useCreatePlanItemNew = ({
  clinicId,
  patientId,
  planId,
}: UseCreatePlanItemNewContext) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePlanItemRequest) =>
      treatmentPlanService.createItem(clinicId, patientId, planId, data),
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
