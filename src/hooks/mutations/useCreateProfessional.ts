import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "@/api/professionalService";
import type { CreateProfessionalRequest } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { getApiError } from "@/hooks/useApiError";

export const useCreateProfessional = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateProfessionalRequest) =>
      professionalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      400: "Preencha todos os campos corretamente.",
      409: "E-mail ou usuário já cadastrado.",
      404: "Clínica não encontrada.",
      default: "Erro inesperado. Tente novamente.",
    });
  };

  return {
    create: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
