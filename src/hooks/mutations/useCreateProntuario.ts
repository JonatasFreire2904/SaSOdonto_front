import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prontuarioService } from "@/api/prontuarioService";
import type { CreateProntuarioRequest } from "@/api/prontuarioService";
import { prontuarioKeys } from "@/hooks/queries/useProntuario";
import { getApiError } from "@/hooks/useApiError";

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
    return getApiError(mutation.error, {
      400: "Preencha todos os campos obrigatórios.",
      default: "Erro ao criar registro. Tente novamente.",
    });
  };

  return {
    create: mutation.mutate,
    isPending: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
