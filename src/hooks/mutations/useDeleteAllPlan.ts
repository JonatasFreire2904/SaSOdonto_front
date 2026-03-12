import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import { treatmentPlanKeys } from "@/hooks/queries/useTreatmentPlan";

export const useDeleteAllPlan = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => treatmentPlanService.removeAll(clinicId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentPlanKeys(clinicId, patientId) });
    },
  });

  return {
    removeAll: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
