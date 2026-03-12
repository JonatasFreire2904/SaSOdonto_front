import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/api/mediaService";
import { mediaKeys } from "@/hooks/queries/useMedias";
import { AxiosError } from "axios";

export const useUploadMedia = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) =>
      mediaService.upload(clinicId, patientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys(clinicId, patientId) });
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 413) return "Arquivo muito grande.";
    return "Erro ao enviar arquivo. Tente novamente.";
  };

  return {
    upload: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
    reset: mutation.reset,
  };
};
