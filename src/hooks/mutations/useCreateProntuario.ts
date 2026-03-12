import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prontuarioService } from "@/api/prontuarioService";
import type { CreateProntuarioRequest } from "@/api/prontuarioService";
import { prontuarioKeys } from "@/hooks/queries/useProntuario";
import { AxiosError } from "axios";

export const useCreateProntuario = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateProntuarioRequest) =>
      prontuarioService.create(clinicId, patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prontuarioKeys(clinicId, patientId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Preencha todos os campos obrigatórios.";
    return "Erro ao criar registro. Tente novamente.";
  };

  return {
    create: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
