import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";

export const useLogin = () => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authLogin(data);
      navigate("/dashboard");
    },
  });

  // Extrai mensagem de erro amigável
  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 401) return "E-mail ou senha inválidos.";
    if (err.response?.status === 400) return "Preencha todos os campos.";
    return "Erro ao conectar. Tente novamente.";
  };

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: getError(),
  };
};