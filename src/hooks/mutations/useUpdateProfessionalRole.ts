import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { AxiosError } from "axios";

interface UpdateRoleVariables {
  id: string;
  role: string;
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

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Cargo inválido.";
    if (err.response?.status === 404) return "Profissional não encontrado.";
    return "Erro inesperado. Tente novamente.";
  };

  return {
    updateRole: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
