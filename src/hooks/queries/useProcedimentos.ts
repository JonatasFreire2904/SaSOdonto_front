import { useQuery } from "@tanstack/react-query";
import { odontogramService } from "@/api/odontogramService";

export const useProcedimentos = (clinicId: string) => {
  return useQuery({
    queryKey: ["procedimentos", clinicId],
    queryFn: () => odontogramService.getProcedimentos(clinicId),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 10,
  });
};
