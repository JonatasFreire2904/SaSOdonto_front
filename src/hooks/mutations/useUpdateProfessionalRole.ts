import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService, type ProfessionalRole } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { getApiError } from "@/hooks/useApiError";

interface UpdateRoleVariables {
  id: string;
  role: ProfessionalRole;
}

export const useUpdateProfessionalRole = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, role }: UpdateRoleVariables) =>
      professionalService.updateRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      400: "Cargo inválido.",
      404: "Profissional não encontrado.",
      default: "Erro inesperado. Tente novamente.",
    });
  };

  return {
    updateRole: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
