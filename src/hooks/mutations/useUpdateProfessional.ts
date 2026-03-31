import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService, type UpdateProfessionalRequest } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { getApiError } from "@/hooks/useApiError";

export const useUpdateProfessional = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfessionalRequest }) =>
      professionalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      409: "E-mail já está em uso.",
      404: "Profissional não encontrado.",
      400: "Verifique os dados informados.",
      default: "Erro inesperado. Tente novamente.",
    });
  };

  return {
    update: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
