import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/api/patientService";
import type { CreatePatientRequest } from "@/api/patientService";
import { patientKeys } from "@/hooks/queries/usePatients";
import { getApiError } from "@/hooks/useApiError";

export const useCreatePatient = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePatientRequest) =>
      patientService.create(clinicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all(clinicId) });
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      400: "Preencha todos os campos obrigatórios.",
      409: "CPF já cadastrado.",
      default: "Erro ao cadastrar paciente. Tente novamente.",
    });
  };

  return {
    create: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
