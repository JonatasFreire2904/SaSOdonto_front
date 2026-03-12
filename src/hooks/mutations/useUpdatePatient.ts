import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/api/patientService";
import type { UpdatePatientRequest } from "@/api/patientService";
import { patientKeys } from "@/hooks/queries/usePatients";

export const useUpdatePatient = (clinicId: string, patientId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdatePatientRequest) =>
      patientService.update(clinicId, patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all(clinicId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(clinicId, patientId) });
    },
  });

  return {
    update: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
