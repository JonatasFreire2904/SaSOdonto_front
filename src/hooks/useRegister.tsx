import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";
import { getApiError } from "@/hooks/useApiError";

export const useRegister = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      navigate("/login");
    },
  });

  // Extrai mensagem de erro - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      409: "Este e-mail já está cadastrado.",
      400: "Preencha todos os campos corretamente.",
      default: "Erro ao cadastrar. Tente novamente.",
    });
  };

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: getError(),
  };
};
