import { useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "@/api/professionalService";
import type { CreateProfessionalRequest } from "@/api/professionalService";
import { professionalKeys } from "@/hooks/queries/useProfessionals";
import { AxiosError } from "axios";

export const useCreateProfessional = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateProfessionalRequest) =>
      professionalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all(clinicId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Preencha todos os campos corretamente.";
    if (err.response?.status === 409) return "E-mail ou usuário já cadastrado.";
    if (err.response?.status === 404) return "Clínica não encontrada.";
    return "Erro inesperado. Tente novamente.";
  };

  return {
    create: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
