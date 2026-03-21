import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService, type UpdateProfessionalRequest } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { AxiosError } from "axios";

export const useUpdateProfessional = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfessionalRequest }) =>
      professionalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 409) return "E-mail já está em uso.";
    if (err.response?.status === 404) return "Profissional não encontrado.";
    if (err.response?.status === 400) return "Verifique os dados informados.";
    return "Erro inesperado. Tente novamente.";
  };

  return {
    update: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
