import { useMutation } from "@tanstack/react-query";
import { odontogramService } from "@/api/odontogramService";
import type { ToothProcedureRequest } from "@/api/odontogramService";
import { AxiosError } from "axios";

export const useAddToothProcedure = (clinicId: string, patientId: string) => {
  const mutation = useMutation({
    mutationFn: (data: ToothProcedureRequest) =>
      odontogramService.addToothProcedure(clinicId, patientId, data),
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 400) return "Preencha todos os campos corretamente.";
    if (err.response?.status === 404) return "Procedimento ou dente não encontrado.";
    return "Erro ao salvar procedimento. Tente novamente.";
  };

  return {
    addProcedure: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: getError(),
    reset: mutation.reset,
  };
};
