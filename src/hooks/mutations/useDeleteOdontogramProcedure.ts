import { useMutation } from "@tanstack/react-query";
import { odontogramService } from "@/api/odontogramService";

export const useDeleteOdontogramProcedure = (clinicId: string, patientId: string) => {
  const mutation = useMutation({
    mutationFn: (procedureId: string) =>
      odontogramService.deleteToothProcedure(clinicId, patientId, procedureId),
  });

  return {
    removeProcedure: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
