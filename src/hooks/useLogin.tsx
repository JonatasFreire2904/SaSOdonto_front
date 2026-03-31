import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/hooks/useApiError";

export const useLogin = () => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authLogin(data);
      navigate("/clinicas");
    },
  });

  // Extrai mensagem de erro amigável - prioriza mensagem do backend
  const getError = (): string | null => {
    return getApiError(mutation.error, {
      401: "E-mail ou senha inválidos.",
      400: "Preencha todos os campos.",
      default: "Erro ao conectar. Tente novamente.",
    });
  };

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
  };
};