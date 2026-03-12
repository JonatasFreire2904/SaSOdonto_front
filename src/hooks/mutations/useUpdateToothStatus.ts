import { useMutation } from "@tanstack/react-query";
import { odontogramService } from "@/api/odontogramService";
import type { UpdateToothStatusRequest } from "@/api/odontogramService";

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
