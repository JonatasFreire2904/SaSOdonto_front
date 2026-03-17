import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { AxiosError } from "axios";

export const useDeleteProfessional = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => professionalService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Não foi possível remover o profissional.";
    if (err.response?.status === 404) return "Profissional não encontrado.";
    return "Erro inesperado. Tente novamente.";
  };

  return {
    deleteProfessional: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
