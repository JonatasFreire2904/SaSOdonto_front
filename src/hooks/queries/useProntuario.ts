import { useQuery } from "@tanstack/react-query";
import { prontuarioService } from "@/api/prontuarioService";

export const prontuarioKeys = (clinicId: string, patientId: string) => [
  "prontuario",
  clinicId,
  patientId,
];

export const useProntuario = (clinicId: string, patientId: string) => {
  return useQuery({
    queryKey: prontuarioKeys(clinicId, patientId),
    queryFn: () => prontuarioService.list(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
};
