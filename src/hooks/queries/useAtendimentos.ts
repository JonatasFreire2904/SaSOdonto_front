import { useQuery } from "@tanstack/react-query";
import { atendimentoService } from "@/api/atendimentoService";

export const atendimentoKeys = (clinicId: string) => [
  "atendimentos",
  clinicId,
];

export const useAtendimentos = (clinicId: string) => {
  return useQuery({
    queryKey: atendimentoKeys(clinicId),
    queryFn: () => atendimentoService.list(clinicId),
    enabled: !!clinicId,
  });
};
