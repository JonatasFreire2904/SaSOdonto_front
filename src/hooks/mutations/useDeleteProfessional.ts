import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { getApiError } from "@/hooks/useApiError";

export const useDeleteProfessional = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => professionalService.remove(id, clinicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      400: "Não foi possível remover o profissional.",
      404: "Profissional não encontrado.",
      default: "Erro inesperado. Tente novamente.",
    });
  };

  return {
    deleteProfessional: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
