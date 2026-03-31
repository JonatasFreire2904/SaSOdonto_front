import { useQuery, useMutation } from "@tanstack/react-query";
import { odontogramService } from "@/api/odontogramService";
import type { ToothProcedureRequest, UpdateToothStatusRequest } from "@/api/odontogramService";
import { getApiError } from "@/hooks/useApiError";

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

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      400: "Preencha todos os campos corretamente.",
      404: "Procedimento ou dente não encontrado.",
      default: "Erro ao salvar procedimento. Tente novamente.",
    });
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
