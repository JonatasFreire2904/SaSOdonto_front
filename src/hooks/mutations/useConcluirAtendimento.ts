import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atendimentoService } from "@/api/atendimentoService";
import { atendimentoKeys } from "@/hooks/queries/useAtendimentos";

export const useConcluirAtendimento = (clinicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (atendimentoId: string) =>
      atendimentoService.complete(atendimentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atendimentoKeys(clinicId) });
    },
  });

  return {
    concluir: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
