import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type {
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
} from "@/api/treatmentPlanService";
import { AxiosError } from "axios";

const planKeys = (clinicId: string, patientId: string) => [
  "treatmentPlan",
  clinicId,
  patientId,
];

export const useTreatmentPlan = (clinicId: string, patientId: string) => {
  return useQuery({
    queryKey: planKeys(clinicId, patientId),
    queryFn: () => treatmentPlanService.list(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
};

export const useCreatePlanItem = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateTreatmentPlanRequest) =>
      treatmentPlanService.create(clinicId, patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys(clinicId, patientId) });
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

export const useUpdatePlanItem = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdateTreatmentPlanRequest }) =>
      treatmentPlanService.update(clinicId, patientId, planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys(clinicId, patientId) });
    },
  });

  return {
    update: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useDeletePlanItem = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (planId: string) =>
      treatmentPlanService.remove(clinicId, patientId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys(clinicId, patientId) });
    },
  });

  return {
    remove: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useDeleteAllPlan = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => treatmentPlanService.removeAll(clinicId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys(clinicId, patientId) });
    },
  });

  return {
    removeAll: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
