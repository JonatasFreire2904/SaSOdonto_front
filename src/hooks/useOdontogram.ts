import { useQuery, useMutation } from "@tanstack/react-query";
import { odontogramService } from "@/api/odontogramService";
import type { ToothProcedureRequest, UpdateToothStatusRequest } from "@/api/odontogramService";
import { AxiosError } from "axios";

export const useProcedimentos = (clinicId: string) => {
  return useQuery({
    queryKey: ["procedimentos", clinicId],
    queryFn: () => odontogramService.getProcedimentos(clinicId),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
};

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

export const useUpdateToothStatus = (clinicId: string, patientId: string) => {
  const mutation = useMutation({
    mutationFn: ({ toothNumber, data }: { toothNumber: number; data: UpdateToothStatusRequest }) =>
      odontogramService.updateToothStatus(clinicId, patientId, toothNumber, data),
  });

  return {
    updateStatus: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
