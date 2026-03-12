import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import { treatmentPlanKeys } from "@/hooks/queries/useTreatmentPlan";

export const useDeletePlanItem = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (planId: string) =>
      treatmentPlanService.remove(clinicId, patientId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentPlanKeys(clinicId, patientId) });
    },
  });

  return {
    remove: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
