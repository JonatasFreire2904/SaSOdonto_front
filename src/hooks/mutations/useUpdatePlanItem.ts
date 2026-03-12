import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { UpdateTreatmentPlanRequest } from "@/api/treatmentPlanService";
import { treatmentPlanKeys } from "@/hooks/queries/useTreatmentPlan";

export const useUpdatePlanItem = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdateTreatmentPlanRequest }) =>
      treatmentPlanService.update(clinicId, patientId, planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentPlanKeys(clinicId, patientId) });
    },
  });

  return {
    update: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
