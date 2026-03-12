import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/api/mediaService";
import { mediaKeys } from "@/hooks/queries/useMedias";

export const useDeleteMedia = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (mediaId: string) =>
      mediaService.remove(clinicId, patientId, mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys(clinicId, patientId) });
    },
  });

  return {
    remove: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
