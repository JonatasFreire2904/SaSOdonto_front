import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { CreateTreatmentPlanRequest } from "@/api/treatmentPlanService";
import { treatmentPlanKeys } from "@/hooks/queries/useTreatmentPlan";
import { AxiosError } from "axios";

export const useCreatePlanItem = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateTreatmentPlanRequest) =>
      treatmentPlanService.create(clinicId, patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentPlanKeys(clinicId, patientId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Preencha todos os campos obrigatórios.";
    return "Erro ao criar item. Tente novamente.";
  };

  return {
    create: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
