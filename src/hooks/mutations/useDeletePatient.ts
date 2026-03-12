import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/api/patientService";
import { patientKeys } from "@/hooks/queries/usePatients";

export const useDeletePatient = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (patientId: string) =>
      patientService.remove(clinicId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all(clinicId) });
    },
  });

  return {
    remove: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
