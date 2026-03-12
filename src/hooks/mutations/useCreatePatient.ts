import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/api/patientService";
import type { CreatePatientRequest } from "@/api/patientService";
import { patientKeys } from "@/hooks/queries/usePatients";
import { AxiosError } from "axios";

export const useCreatePatient = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePatientRequest) =>
      patientService.create(clinicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all(clinicId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Preencha todos os campos obrigatórios.";
    if (err.response?.status === 409) return "CPF já cadastrado.";
    return "Erro ao cadastrar paciente. Tente novamente.";
  };

  return {
    create: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
