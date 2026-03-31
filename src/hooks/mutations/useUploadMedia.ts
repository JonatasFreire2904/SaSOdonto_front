import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/api/mediaService";
import { mediaKeys } from "@/hooks/queries/useMedias";
import { getApiError } from "@/hooks/useApiError";

export const useUploadMedia = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) =>
      mediaService.upload(clinicId, patientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys(clinicId, patientId) });
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      413: "Arquivo muito grande.",
      default: "Erro ao enviar arquivo. Tente novamente.",
    });
  };

  return {
    upload: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
